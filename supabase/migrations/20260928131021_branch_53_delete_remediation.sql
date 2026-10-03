-- Branch 53 targeted remediation for serialized table deletion and recoverable
-- document deletion. Storage work remains outside PostgreSQL transactions.

alter table public.event_documents
  add column if not exists deletion_state text not null default 'active',
  add column if not exists deletion_started_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_documents_deletion_state_check'
      and conrelid = 'public.event_documents'::regclass
  ) then
    alter table public.event_documents
      add constraint event_documents_deletion_state_check
      check (deletion_state in ('active', 'pending_storage'));
  end if;
end
$$;

create index if not exists event_documents_active_event_created_idx
  on public.event_documents(event_id, created_at desc, id)
  where deletion_state = 'active';

create table if not exists private.event_document_deletions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  document_id uuid not null unique,
  actor_id uuid not null references auth.users(id) on delete restrict,
  object_path text not null unique,
  status text not null default 'pending_storage'
    check (status in ('pending_storage', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint event_document_deletions_path_prefix
    check (object_path like event_id::text || '/%')
);

create index if not exists event_document_deletions_event_status_idx
  on private.event_document_deletions(event_id, status, updated_at, id);

revoke all on table private.event_document_deletions
  from public, anon, authenticated, service_role;

create or replace function public.delete_event_table(
  p_event_id uuid,
  p_actor_id uuid,
  p_table_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_table_id uuid;
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

  select t.id into v_table_id
  from public.tables t
  where t.id = p_table_id and t.event_id = p_event_id
  for update;

  if found then
    delete from public.tables t
    where t.id = v_table_id and t.event_id = p_event_id;
    return jsonb_build_object('status', 'deleted', 'tableId', p_table_id);
  end if;

  if exists (select 1 from public.tables t where t.id = p_table_id) then
    raise exception using errcode = '42501', message = 'TABLE_EVENT_MISMATCH';
  end if;

  return jsonb_build_object('status', 'already_deleted', 'tableId', p_table_id);
end;
$$;

create or replace function public.begin_event_document_delete(
  p_event_id uuid,
  p_actor_id uuid,
  p_document_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation private.event_document_deletions%rowtype;
  v_document public.event_documents%rowtype;
  v_document_event uuid;
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

  select * into v_operation
  from private.event_document_deletions d
  where d.document_id = p_document_id
  for update;

  if found then
    if v_operation.event_id <> p_event_id
      or v_operation.object_path not like p_event_id::text || '/%'
    then
      raise exception using errcode = '42501', message = 'DOCUMENT_EVENT_MISMATCH';
    end if;
    return jsonb_build_object(
      'operationId', v_operation.id,
      'documentId', v_operation.document_id,
      'objectPath', v_operation.object_path,
      'status', v_operation.status
    );
  end if;

  select d.event_id into v_document_event
  from public.event_documents d
  where d.id = p_document_id;
  if not found then
    return jsonb_build_object('documentId', p_document_id, 'status', 'not_found');
  end if;
  if v_document_event <> p_event_id then
    raise exception using errcode = '42501', message = 'DOCUMENT_EVENT_MISMATCH';
  end if;

  select * into v_document
  from public.event_documents d
  where d.id = p_document_id and d.event_id = p_event_id
  for update;
  if not found then
    return jsonb_build_object('documentId', p_document_id, 'status', 'not_found');
  end if;
  if v_document.object_path not like p_event_id::text || '/%'
    or v_document.deletion_state not in ('active', 'pending_storage')
  then
    raise exception using errcode = '23514', message = 'DOCUMENT_DELETE_INVALID';
  end if;

  insert into private.event_document_deletions(
    event_id, document_id, actor_id, object_path
  ) values (
    p_event_id, p_document_id, p_actor_id, v_document.object_path
  ) returning * into v_operation;

  update public.event_documents d
  set deletion_state = 'pending_storage',
      deletion_started_at = coalesce(d.deletion_started_at, now())
  where d.id = p_document_id and d.event_id = p_event_id;

  return jsonb_build_object(
    'operationId', v_operation.id,
    'documentId', v_operation.document_id,
    'objectPath', v_operation.object_path,
    'status', v_operation.status
  );
end;
$$;

create or replace function public.complete_event_document_delete(
  p_event_id uuid,
  p_actor_id uuid,
  p_operation_id uuid,
  p_document_id uuid,
  p_object_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation private.event_document_deletions%rowtype;
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

  select * into v_operation
  from private.event_document_deletions d
  where d.id = p_operation_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'DOCUMENT_DELETE_NOT_FOUND';
  end if;
  if v_operation.event_id <> p_event_id
    or v_operation.document_id <> p_document_id
    or v_operation.object_path <> p_object_path
    or p_object_path not like p_event_id::text || '/%'
  then
    raise exception using errcode = '42501', message = 'DOCUMENT_DELETE_MISMATCH';
  end if;

  if v_operation.status = 'completed' then
    return jsonb_build_object(
      'operationId', v_operation.id,
      'documentId', v_operation.document_id,
      'status', 'completed'
    );
  end if;

  if exists (
    select 1 from storage.objects o
    where o.bucket_id = 'event-documents'
      and o.name = p_object_path
      and o.archived_at is null
  ) then
    raise exception using errcode = '55000', message = 'DOCUMENT_OBJECT_STILL_PRESENT';
  end if;

  delete from public.event_documents d
  where d.id = p_document_id
    and d.event_id = p_event_id
    and d.object_path = p_object_path
    and d.deletion_state = 'pending_storage';

  update private.event_document_deletions d
  set status = 'completed', completed_at = now(), updated_at = now()
  where d.id = v_operation.id;

  return jsonb_build_object(
    'operationId', v_operation.id,
    'documentId', v_operation.document_id,
    'status', 'completed'
  );
end;
$$;

revoke all on function public.delete_event_table(uuid, uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.begin_event_document_delete(uuid, uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.complete_event_document_delete(uuid, uuid, uuid, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.delete_event_table(uuid, uuid, uuid) to service_role;
grant execute on function public.begin_event_document_delete(uuid, uuid, uuid) to service_role;
grant execute on function public.complete_event_document_delete(uuid, uuid, uuid, uuid, text) to service_role;

drop policy if exists event_documents_select_event on public.event_documents;
create policy event_documents_select_event
  on public.event_documents for select to authenticated
  using (deletion_state = 'active' and public.can_access_event(event_id));

comment on column public.event_documents.deletion_state is
  'Active metadata is visible; pending_storage is a durable tombstone awaiting retryable Storage cleanup.';
comment on table private.event_document_deletions is
  'Server-only idempotency ledger for tombstone, Storage delete, and metadata-finalize document deletion.';
comment on function public.delete_event_table(uuid, uuid, uuid) is
  'Deletes one table after acquiring the same event-row lock used by save_event_table_plan.';
comment on function public.begin_event_document_delete(uuid, uuid, uuid) is
  'Persists or replays a document deletion tombstone before any Storage operation.';
comment on function public.complete_event_document_delete(uuid, uuid, uuid, uuid, text) is
  'Finalizes metadata deletion only after the immutable Storage object is absent.';
