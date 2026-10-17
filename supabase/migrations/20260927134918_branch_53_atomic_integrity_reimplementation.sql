-- Branch 53 P1/P2 reimplementation.
-- Additive hardening for shared event authorization, atomic table plans,
-- serialized assignment capacity, and server-controlled document quota.

create or replace function private.event_access_role_for_actor(
  p_event_id uuid,
  p_actor_id uuid
)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when e.owner_id = p_actor_id then 'owner'
    when m.status = 'active' and m.role = 'owner' then 'owner'
    when m.status = 'active' and m.role = 'partner' then 'partner'
    when m.id is not null then null
    when coalesce(a.email_normalized, '') <> '' and a.email_normalized in (
      lower(btrim(coalesce(e.bride_email, ''))),
      lower(btrim(coalesce(e.groom_email, '')))
    ) then 'legacy'
    else null
  end
  from public.events e
  left join public.event_members m
    on m.event_id = e.id and m.user_id = p_actor_id
  left join lateral (
    select lower(btrim(coalesce(u.email, ''))) as email_normalized
    from auth.users u
    where u.id = p_actor_id
  ) a on true
  where e.id = p_event_id
    and p_actor_id is not null
$$;

revoke all on function private.event_access_role_for_actor(uuid, uuid)
  from public, anon, authenticated, service_role;

create or replace function public.can_access_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.event_access_role_for_actor(p_event_id, (select auth.uid())) is not null
$$;

create or replace function public.is_event_owner(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.event_access_role_for_actor(p_event_id, (select auth.uid())) = 'owner'
$$;

revoke all on function public.can_access_event(uuid) from public, anon, authenticated;
revoke all on function public.is_event_owner(uuid) from public, anon, authenticated;
grant execute on function public.can_access_event(uuid) to authenticated, service_role;
grant execute on function public.is_event_owner(uuid) to authenticated, service_role;

create unique index if not exists table_assignments_table_seat_unique_idx
  on public.table_assignments(table_id, seat_number)
  where seat_number is not null;

create or replace function public.validate_table_assignment_event_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_table_event uuid;
  v_guest_event uuid;
  v_total_seats integer;
  v_assigned integer;
begin
  select t.event_id, t.total_seats
  into v_table_event, v_total_seats
  from public.tables t
  where t.id = new.table_id
  for update;

  select g.event_id into v_guest_event
  from public.guests g
  where g.id = new.guest_id;

  if v_table_event is null or v_guest_event is null then
    raise exception using errcode = '23503', message = 'TABLE_OR_GUEST_NOT_FOUND';
  end if;
  if v_table_event <> v_guest_event then
    raise exception using errcode = '23514', message = 'TABLE_GUEST_EVENT_MISMATCH';
  end if;
  if new.seat_number is not null and new.seat_number > v_total_seats then
    raise exception using errcode = '23514', message = 'TABLE_SEAT_OUT_OF_RANGE';
  end if;
  if new.seat_number is not null and exists (
    select 1 from public.table_assignments a
    where a.table_id = new.table_id
      and a.seat_number = new.seat_number
      and a.id <> new.id
  ) then
    raise exception using errcode = '23514', message = 'TABLE_SEAT_DUPLICATE';
  end if;

  select count(*)::integer into v_assigned
  from public.table_assignments a
  where a.table_id = new.table_id
    and a.id <> new.id;

  if v_assigned >= v_total_seats then
    raise exception using errcode = '23514', message = 'TABLE_CAPACITY_EXCEEDED';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_table_assignment_event_capacity()
  from public, anon, authenticated;

create or replace function public.prevent_table_capacity_underflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_assigned integer;
begin
  select count(*)::integer into v_assigned
  from public.table_assignments a
  where a.table_id = new.id;
  if new.total_seats < v_assigned then
    raise exception using errcode = '23514', message = 'TABLE_CAPACITY_BELOW_ASSIGNMENTS';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_table_capacity_underflow()
  from public, anon, authenticated;

create or replace function public.save_event_table_plan(
  p_event_id uuid,
  p_actor_id uuid,
  p_tables jsonb,
  p_replace boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_table jsonb;
  v_assignment jsonb;
  v_table_id uuid;
  v_guest_id uuid;
  v_table_number integer;
  v_total_seats integer;
  v_seat_number integer;
  v_table_name text;
  v_table_type text;
  v_notes text;
  v_assignment_index integer;
  v_seen_table_ids uuid[] := array[]::uuid[];
  v_seen_table_numbers integer[] := array[]::integer[];
  v_seen_guest_ids uuid[] := array[]::uuid[];
  v_seen_seats integer[];
  v_plan jsonb := '[]'::jsonb;
  v_count integer := 0;
  v_temporary_base integer;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;

  perform 1
  from public.events e
  where e.id = p_event_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;

  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  if p_tables is null
    or jsonb_typeof(p_tables) <> 'array'
    or jsonb_array_length(p_tables) > 200
  then
    raise exception using errcode = '22023', message = 'TABLE_PLAN_INVALID';
  end if;

  for v_table in select value from jsonb_array_elements(p_tables)
  loop
    if jsonb_typeof(v_table) <> 'object' then
      raise exception using errcode = '22023', message = 'TABLE_INVALID';
    end if;

    if nullif(v_table ->> 'id', '') is null then
      v_table_id := gen_random_uuid();
    elsif (v_table ->> 'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      v_table_id := (v_table ->> 'id')::uuid;
    else
      raise exception using errcode = '22023', message = 'INVALID_TABLE_ID';
    end if;
    if v_table_id = any(v_seen_table_ids) then
      raise exception using errcode = '22023', message = 'DUPLICATE_TABLE_ID';
    end if;
    if exists (
      select 1 from public.tables t
      where t.id = v_table_id and t.event_id <> p_event_id
    ) then
      raise exception using errcode = '42501', message = 'TABLE_EVENT_MISMATCH';
    end if;

    if coalesce(v_table ->> 'tableNumber', '') !~ '^[0-9]+$' then
      raise exception using errcode = '22023', message = 'TABLE_NUMBER_INVALID';
    end if;
    v_table_number := (v_table ->> 'tableNumber')::integer;
    if v_table_number < 1 or v_table_number > 10000 then
      raise exception using errcode = '22023', message = 'TABLE_NUMBER_INVALID';
    end if;
    if v_table_number = any(v_seen_table_numbers) then
      raise exception using errcode = '22023', message = 'DUPLICATE_TABLE_NUMBER';
    end if;

    if coalesce(v_table ->> 'totalSeats', '') !~ '^[0-9]+$' then
      raise exception using errcode = '22023', message = 'TABLE_CAPACITY_INVALID';
    end if;
    v_total_seats := (v_table ->> 'totalSeats')::integer;
    if v_total_seats < 1 or v_total_seats > 100 then
      raise exception using errcode = '22023', message = 'TABLE_CAPACITY_INVALID';
    end if;

    if v_table ? 'tableName' and jsonb_typeof(v_table -> 'tableName') not in ('string', 'null') then
      raise exception using errcode = '22023', message = 'TABLE_NAME_INVALID';
    end if;
    v_table_name := nullif(btrim(v_table ->> 'tableName'), '');
    if length(coalesce(v_table_name, '')) > 255 then
      raise exception using errcode = '22023', message = 'TABLE_NAME_INVALID';
    end if;

    if v_table ? 'tableType' and jsonb_typeof(v_table -> 'tableType') not in ('string', 'null') then
      raise exception using errcode = '22023', message = 'TABLE_TYPE_INVALID';
    end if;
    v_table_type := coalesce(nullif(btrim(v_table ->> 'tableType'), ''), 'round');
    if length(v_table_type) > 50 then
      raise exception using errcode = '22023', message = 'TABLE_TYPE_INVALID';
    end if;

    if v_table ? 'notes' and jsonb_typeof(v_table -> 'notes') not in ('string', 'null') then
      raise exception using errcode = '22023', message = 'TABLE_NOTES_INVALID';
    end if;
    v_notes := nullif(v_table ->> 'notes', '');
    if length(coalesce(v_notes, '')) > 2000 then
      raise exception using errcode = '22023', message = 'TABLE_NOTES_INVALID';
    end if;

    if jsonb_typeof(coalesce(v_table -> 'assignedGuests', '[]'::jsonb)) <> 'array' then
      raise exception using errcode = '22023', message = 'TABLE_ASSIGNMENTS_INVALID';
    end if;
    if jsonb_array_length(coalesce(v_table -> 'assignedGuests', '[]'::jsonb)) > v_total_seats then
      raise exception using errcode = '23514', message = 'TABLE_CAPACITY_EXCEEDED';
    end if;

    v_seen_seats := array[]::integer[];
    v_assignment_index := 0;
    for v_assignment, v_assignment_index in
      select value, ordinality::integer
      from jsonb_array_elements(coalesce(v_table -> 'assignedGuests', '[]'::jsonb))
        with ordinality
    loop
      if jsonb_typeof(v_assignment) <> 'object'
        or coalesce(v_assignment ->> 'guestId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then
        raise exception using errcode = '22023', message = 'INVALID_GUEST_ID';
      end if;
      v_guest_id := (v_assignment ->> 'guestId')::uuid;
      if v_guest_id = any(v_seen_guest_ids) then
        raise exception using errcode = '22023', message = 'GUEST_ALREADY_ASSIGNED';
      end if;
      if not exists (
        select 1 from public.guests g
        where g.id = v_guest_id and g.event_id = p_event_id
      ) then
        raise exception using errcode = '23514', message = 'TABLE_GUEST_EVENT_MISMATCH';
      end if;

      if nullif(v_assignment ->> 'seatNumber', '') is null then
        v_seat_number := v_assignment_index;
      elsif coalesce(v_assignment ->> 'seatNumber', '') ~ '^[0-9]+$' then
        v_seat_number := (v_assignment ->> 'seatNumber')::integer;
      else
        raise exception using errcode = '22023', message = 'TABLE_SEAT_INVALID';
      end if;
      if v_seat_number < 1 or v_seat_number > v_total_seats then
        raise exception using errcode = '23514', message = 'TABLE_SEAT_OUT_OF_RANGE';
      end if;
      if v_seat_number = any(v_seen_seats) then
        raise exception using errcode = '23514', message = 'TABLE_SEAT_DUPLICATE';
      end if;

      v_seen_guest_ids := array_append(v_seen_guest_ids, v_guest_id);
      v_seen_seats := array_append(v_seen_seats, v_seat_number);
    end loop;

    v_seen_table_ids := array_append(v_seen_table_ids, v_table_id);
    v_seen_table_numbers := array_append(v_seen_table_numbers, v_table_number);
    v_plan := v_plan || jsonb_build_array(
      jsonb_build_object(
        'id', v_table_id,
        'tableNumber', v_table_number,
        'tableName', v_table_name,
        'tableType', v_table_type,
        'totalSeats', v_total_seats,
        'notes', v_notes,
        'assignedGuests', coalesce(v_table -> 'assignedGuests', '[]'::jsonb)
      )
    );
  end loop;

  select greatest(
    coalesce(max(t.table_number), 0),
    coalesce((select max(value) from unnest(v_seen_table_numbers) value), 0)
  ) + 10001
  into v_temporary_base
  from public.tables t
  where t.event_id = p_event_id;

  if p_replace then
    with ranked as (
      select t.id, row_number() over (order by t.id) as ordinal
      from public.tables t where t.event_id = p_event_id
    )
    update public.tables t
    set table_number = v_temporary_base + ranked.ordinal
    from ranked
    where t.id = ranked.id;

    delete from public.table_assignments a
    using public.tables t
    where a.table_id = t.id and t.event_id = p_event_id;
  elsif cardinality(v_seen_table_ids) > 0 then
    with ranked as (
      select t.id, row_number() over (order by t.id) as ordinal
      from public.tables t
      where t.event_id = p_event_id and t.id = any(v_seen_table_ids)
    )
    update public.tables t
    set table_number = v_temporary_base + ranked.ordinal
    from ranked
    where t.id = ranked.id;

    delete from public.table_assignments a
    where a.table_id = any(v_seen_table_ids);
  end if;

  for v_table in select value from jsonb_array_elements(v_plan)
  loop
    v_table_id := (v_table ->> 'id')::uuid;
    if exists (
      select 1 from public.tables t
      where t.id = v_table_id and t.event_id = p_event_id
    ) then
      update public.tables
      set table_number = (v_table ->> 'tableNumber')::integer,
          table_name = nullif(v_table ->> 'tableName', ''),
          table_type = v_table ->> 'tableType',
          total_seats = (v_table ->> 'totalSeats')::integer,
          notes = nullif(v_table ->> 'notes', ''),
          updated_at = now()
      where id = v_table_id and event_id = p_event_id;
    else
      insert into public.tables(
        id, event_id, table_number, table_name, table_type, total_seats, notes
      ) values (
        v_table_id,
        p_event_id,
        (v_table ->> 'tableNumber')::integer,
        nullif(v_table ->> 'tableName', ''),
        v_table ->> 'tableType',
        (v_table ->> 'totalSeats')::integer,
        nullif(v_table ->> 'notes', '')
      );
    end if;
  end loop;

  if p_replace then
    delete from public.tables t
    where t.event_id = p_event_id
      and not (t.id = any(v_seen_table_ids));
  end if;

  for v_table in select value from jsonb_array_elements(v_plan)
  loop
    v_table_id := (v_table ->> 'id')::uuid;
    v_assignment_index := 0;
    for v_assignment, v_assignment_index in
      select value, ordinality::integer
      from jsonb_array_elements(v_table -> 'assignedGuests') with ordinality
    loop
      v_seat_number := coalesce(
        nullif(v_assignment ->> 'seatNumber', '')::integer,
        v_assignment_index
      );
      insert into public.table_assignments(table_id, guest_id, seat_number)
      values(v_table_id, (v_assignment ->> 'guestId')::uuid, v_seat_number);
    end loop;
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('savedTables', v_count);
end;
$$;

revoke all on function public.save_event_table_plan(uuid, uuid, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.save_event_table_plan(uuid, uuid, jsonb, boolean)
  to service_role;

create table if not exists private.event_document_upload_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  document_id uuid not null default gen_random_uuid(),
  object_path text not null unique,
  original_name text not null check (length(btrim(original_name)) between 1 and 255),
  category text not null check (
    category in ('quote','contract','invoice','receipt','generic','certificate','license')
  ),
  mime_type text not null check (
    mime_type in ('application/pdf','image/jpeg','image/png')
  ),
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  notes text check (notes is null or length(notes) <= 2000),
  status text not null default 'active' check (
    status in ('active','finalizing','finalized','released','cleanup_pending','expired')
  ),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz,
  unique(event_id, idempotency_key),
  unique(document_id),
  constraint event_document_reservation_path_prefix
    check (object_path like event_id::text || '/%')
);

create index if not exists event_document_reservations_event_status_expiry_idx
  on private.event_document_upload_reservations(event_id, status, expires_at);
create index if not exists event_document_reservations_actor_event_idx
  on private.event_document_upload_reservations(actor_id, event_id);

revoke all on table private.event_document_upload_reservations
  from public, anon, authenticated, service_role;

create or replace function private.enforce_event_document_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_persisted bigint;
  v_reserved bigint;
begin
  perform 1 from public.events e where e.id = new.event_id for update;
  if not found then
    raise exception using errcode = '23503', message = 'EVENT_NOT_FOUND';
  end if;

  select coalesce(sum(d.file_size), 0)::bigint into v_persisted
  from public.event_documents d
  where d.event_id = new.event_id and d.id <> new.id;

  select coalesce(sum(r.file_size), 0)::bigint into v_reserved
  from private.event_document_upload_reservations r
  where r.event_id = new.event_id
    and r.status = 'active'
    and r.expires_at > now();

  if v_persisted + v_reserved + new.file_size > 104857600 then
    raise exception using errcode = '23514', message = 'EVENT_DOCUMENT_QUOTA_EXCEEDED';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_event_document_quota()
  from public, anon, authenticated;

drop trigger if exists event_documents_enforce_quota on public.event_documents;
create trigger event_documents_enforce_quota
before insert or update of event_id, file_size on public.event_documents
for each row execute function private.enforce_event_document_quota();

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
    if v_existing.actor_id <> p_actor_id
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
  if v_reservation.actor_id <> p_actor_id
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
  if v_reservation.actor_id <> p_actor_id or v_reservation.object_path <> p_object_path then
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

create or replace function public.claim_expired_event_document_uploads(
  p_event_id uuid,
  p_actor_id uuid,
  p_limit integer default 20
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;
  if p_limit not between 1 and 100 then
    raise exception using errcode = '22023', message = 'DOCUMENT_CLEANUP_LIMIT_INVALID';
  end if;
  perform 1 from public.events e where e.id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;

  with candidates as (
    select r.id
    from private.event_document_upload_reservations r
    where r.event_id = p_event_id
      and (
        r.status = 'cleanup_pending'
        or (r.status = 'active' and r.expires_at <= now())
      )
    order by r.expires_at, r.id
    limit p_limit
    for update
  ), claimed as (
    update private.event_document_upload_reservations r
    set status = 'cleanup_pending', updated_at = now()
    from candidates c
    where r.id = c.id
    returning r.id, r.object_path
  )
  select coalesce(
    jsonb_agg(jsonb_build_object('reservationId', id, 'objectPath', object_path)),
    '[]'::jsonb
  ) into v_result
  from claimed;
  return v_result;
end;
$$;

create or replace function public.complete_event_document_upload_cleanup(
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
    return jsonb_build_object('status', 'expired');
  end if;
  if v_reservation.object_path <> p_object_path then
    raise exception using errcode = '42501', message = 'DOCUMENT_RESERVATION_MISMATCH';
  end if;
  if exists (
    select 1 from storage.objects o
    where o.bucket_id = 'event-documents'
      and o.name = p_object_path
      and o.archived_at is null
  ) then
    raise exception using errcode = '55000', message = 'DOCUMENT_OBJECT_STILL_PRESENT';
  end if;
  if v_reservation.status <> 'finalized' then
    update private.event_document_upload_reservations
    set status = 'expired', updated_at = now()
    where id = v_reservation.id;
  end if;
  return jsonb_build_object('status', case when v_reservation.status = 'finalized' then 'finalized' else 'expired' end);
end;
$$;

revoke all on function public.reserve_event_document_upload(uuid, uuid, uuid, bigint, text, text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.finalize_event_document_upload(uuid, uuid, uuid, text, bigint)
  from public, anon, authenticated;
revoke all on function public.release_event_document_upload(uuid, uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.claim_expired_event_document_uploads(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.complete_event_document_upload_cleanup(uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.reserve_event_document_upload(uuid, uuid, uuid, bigint, text, text, text, text, integer)
  to service_role;
grant execute on function public.finalize_event_document_upload(uuid, uuid, uuid, text, bigint)
  to service_role;
grant execute on function public.release_event_document_upload(uuid, uuid, uuid, text)
  to service_role;
grant execute on function public.claim_expired_event_document_uploads(uuid, uuid, integer)
  to service_role;
grant execute on function public.complete_event_document_upload_cleanup(uuid, uuid, uuid, text)
  to service_role;

drop policy if exists event_documents_insert_event on public.event_documents;
drop policy if exists event_documents_delete_event on public.event_documents;
revoke insert, delete on table public.event_documents from authenticated;

drop policy if exists event_documents_storage_insert on storage.objects;
drop policy if exists event_documents_storage_delete on storage.objects;

comment on function private.event_access_role_for_actor(uuid, uuid) is
  'Canonical owner/partner/legacy authorization resolver. Any canonical inactive membership suppresses email fallback.';
comment on table private.event_document_upload_reservations is
  'Server-controlled idempotent quota reservations. Storage work is performed only after short database transactions commit.';
comment on function public.save_event_table_plan(uuid, uuid, jsonb, boolean) is
  'Serializes event table plans on the event row, validates the full payload, and applies it atomically.';
