-- Preserve upload cleanup after actor account removal without weakening identity checks.
alter table private.event_document_upload_reservations alter column actor_id drop not null;
alter table private.event_document_upload_reservations drop constraint if exists event_document_upload_reservations_actor_id_fkey;
alter table private.event_document_upload_reservations add constraint event_document_upload_reservations_actor_id_fkey foreign key(actor_id) references auth.users(id) on delete set null;
create or replace function public.reserve_event_document_upload(
  p_event_id uuid,
  p_actor_id uuid,
  p_idempotency_key uuid,
  p_file_size bigint,
  p_original_name text,
  p_mime_type text,
  p_category text,
  p_notes text default null,
  p_ttl_seconds integer default 900
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing private.event_document_upload_reservations%rowtype;
  v_reservation private.event_document_upload_reservations%rowtype;
  v_persisted bigint;
  v_reserved bigint;
  v_extension text;
  v_reservation_id uuid;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  if p_idempotency_key is null
    or p_file_size is null or p_file_size < 1 or p_file_size > 10485760
    or p_original_name is null or length(btrim(p_original_name)) not between 1 and 255
    or p_mime_type not in ('application/pdf','image/jpeg','image/png')
    or p_category not in ('quote','contract','invoice','receipt','generic','certificate','license')
    or length(coalesce(p_notes, '')) > 2000
    or p_ttl_seconds not between 60 and 3600
  then
    raise exception using errcode = '22023', message = 'DOCUMENT_RESERVATION_INVALID';
  end if;

  perform 1 from public.events e where e.id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;

  update private.event_document_upload_reservations r
  set status = case
        when exists (
          select 1 from storage.objects o
          where o.bucket_id = 'event-documents'
            and o.name = r.object_path
            and o.archived_at is null
        ) then 'cleanup_pending'
        else 'expired'
      end,
      updated_at = now()
  where r.event_id = p_event_id
    and r.status = 'active'
    and r.expires_at <= now();

  select * into v_existing
  from private.event_document_upload_reservations r
  where r.event_id = p_event_id and r.idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.actor_id is distinct from p_actor_id
      or v_existing.file_size <> p_file_size
      or v_existing.original_name <> btrim(p_original_name)
      or v_existing.mime_type <> p_mime_type
      or v_existing.category <> p_category
      or coalesce(v_existing.notes, '') <> coalesce(nullif(btrim(p_notes), ''), '')
    then
      raise exception using errcode = '22023', message = 'DOCUMENT_IDEMPOTENCY_CONFLICT';
    end if;

    if v_existing.status in ('active','finalized') then
      return jsonb_build_object(
        'reservationId', v_existing.id,
        'documentId', v_existing.document_id,
        'objectPath', v_existing.object_path,
        'fileSize', v_existing.file_size,
        'status', v_existing.status,
        'expiresAt', v_existing.expires_at
      );
    end if;
    if v_existing.status = 'cleanup_pending' or exists (
      select 1 from storage.objects o
      where o.bucket_id = 'event-documents'
        and o.name = v_existing.object_path
        and o.archived_at is null
    ) then
      raise exception using errcode = '55000', message = 'DOCUMENT_RESERVATION_CLEANUP_REQUIRED';
    end if;
  end if;

  select coalesce(sum(d.file_size), 0)::bigint into v_persisted
  from public.event_documents d where d.event_id = p_event_id;
  select coalesce(sum(r.file_size), 0)::bigint into v_reserved
  from private.event_document_upload_reservations r
  where r.event_id = p_event_id
    and r.status = 'active'
    and r.expires_at > now()
    and (v_existing.id is null or r.id <> v_existing.id);

  if v_persisted + v_reserved + p_file_size > 104857600 then
    raise exception using errcode = '23514', message = 'EVENT_DOCUMENT_QUOTA_EXCEEDED';
  end if;

  v_extension := case p_mime_type
    when 'application/pdf' then 'pdf'
    when 'image/jpeg' then 'jpg'
    else 'png'
  end;

  if v_existing.id is not null then
    update private.event_document_upload_reservations r
    set status = 'active',
        object_path = format('%s/%s/%s.%s', p_event_id, r.id, gen_random_uuid(), v_extension),
        expires_at = now() + make_interval(secs => p_ttl_seconds),
        updated_at = now(),
        finalized_at = null
    where r.id = v_existing.id
    returning * into v_reservation;
  else
    v_reservation_id := gen_random_uuid();
    insert into private.event_document_upload_reservations(
      id, event_id, actor_id, idempotency_key, object_path, original_name,
      category, mime_type, file_size, notes, expires_at
    ) values (
      v_reservation_id,
      p_event_id,
      p_actor_id,
      p_idempotency_key,
      format('%s/%s/%s.%s', p_event_id, v_reservation_id, gen_random_uuid(), v_extension),
      btrim(p_original_name),
      p_category,
      p_mime_type,
      p_file_size,
      nullif(btrim(p_notes), ''),
      now() + make_interval(secs => p_ttl_seconds)
    ) returning * into v_reservation;
  end if;

  return jsonb_build_object(
    'reservationId', v_reservation.id,
    'documentId', v_reservation.document_id,
    'objectPath', v_reservation.object_path,
    'fileSize', v_reservation.file_size,
    'status', v_reservation.status,
    'expiresAt', v_reservation.expires_at
  );
end;
$$;

create or replace function public.finalize_event_document_upload(
  p_event_id uuid,
  p_actor_id uuid,
  p_reservation_id uuid,
  p_object_path text,
  p_file_size bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation private.event_document_upload_reservations%rowtype;
  v_document public.event_documents%rowtype;
  v_storage_size bigint;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  perform 1 from public.events e where e.id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;

  select * into v_reservation
  from private.event_document_upload_reservations r
  where r.id = p_reservation_id and r.event_id = p_event_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'DOCUMENT_RESERVATION_NOT_FOUND';
  end if;
  if v_reservation.actor_id is distinct from p_actor_id
    or v_reservation.object_path <> p_object_path
    or v_reservation.file_size <> p_file_size
  then
    raise exception using errcode = '42501', message = 'DOCUMENT_RESERVATION_MISMATCH';
  end if;

  if v_reservation.status = 'finalized' then
    select * into v_document from public.event_documents d
    where d.id = v_reservation.document_id and d.event_id = p_event_id;
    if not found then
      raise exception using errcode = 'P0002', message = 'DOCUMENT_FINALIZATION_INCONSISTENT';
    end if;
    return jsonb_build_object('documentId', v_document.id, 'status', 'finalized');
  end if;
  if v_reservation.status <> 'active' or v_reservation.expires_at <= now() then
    raise exception using errcode = '55000', message = 'DOCUMENT_RESERVATION_NOT_ACTIVE';
  end if;

  select nullif(o.metadata ->> 'size', '')::bigint into v_storage_size
  from storage.objects o
  where o.bucket_id = 'event-documents'
    and o.name = p_object_path
    and o.archived_at is null;
  if v_storage_size is null or v_storage_size <> p_file_size then
    raise exception using errcode = '23514', message = 'DOCUMENT_STORAGE_OBJECT_MISMATCH';
  end if;

  update private.event_document_upload_reservations
  set status = 'finalizing', updated_at = now()
  where id = v_reservation.id;

  insert into public.event_documents(
    id, event_id, created_by, original_name, object_path,
    category, mime_type, file_size, notes
  ) values (
    v_reservation.document_id,
    v_reservation.event_id,
    v_reservation.actor_id,
    v_reservation.original_name,
    v_reservation.object_path,
    v_reservation.category,
    v_reservation.mime_type,
    v_reservation.file_size,
    v_reservation.notes
  ) returning * into v_document;

  update private.event_document_upload_reservations
  set status = 'finalized', finalized_at = now(), updated_at = now()
  where id = v_reservation.id;

  return jsonb_build_object('documentId', v_document.id, 'status', 'finalized');
end;
$$;

create or replace function public.release_event_document_upload(
  p_event_id uuid,
  p_actor_id uuid,
  p_reservation_id uuid,
  p_object_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation private.event_document_upload_reservations%rowtype;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  perform 1 from public.events e where e.id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  select * into v_reservation
  from private.event_document_upload_reservations r
  where r.id = p_reservation_id and r.event_id = p_event_id
  for update;
  if not found then
    return jsonb_build_object('status', 'released');
  end if;
  if v_reservation.actor_id is distinct from p_actor_id or v_reservation.object_path <> p_object_path then
    raise exception using errcode = '42501', message = 'DOCUMENT_RESERVATION_MISMATCH';
  end if;
  if v_reservation.status in ('released','expired') then
    return jsonb_build_object('status', v_reservation.status);
  end if;
  if v_reservation.status = 'finalized' then
    return jsonb_build_object('status', 'finalized', 'documentId', v_reservation.document_id);
  end if;
  if exists (
    select 1 from storage.objects o
    where o.bucket_id = 'event-documents'
      and o.name = p_object_path
      and o.archived_at is null
  ) then
    raise exception using errcode = '55000', message = 'DOCUMENT_OBJECT_STILL_PRESENT';
  end if;

  update private.event_document_upload_reservations
  set status = 'released', updated_at = now()
  where id = v_reservation.id;
  return jsonb_build_object('status', 'released');
end;
$$;

