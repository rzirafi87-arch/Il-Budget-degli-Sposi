-- Close browser deletion bypasses. The old and new guarded APIs use service_role.
revoke delete on public.tables from public, anon, authenticated;

create or replace function private.guard_event_document_cascade()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.event_documents d where d.event_id = old.id)
    or exists (select 1 from private.event_document_deletions d
      where d.event_id = old.id and d.status = 'pending_storage')
    or exists (select 1 from private.event_document_upload_reservations r
      where r.event_id = old.id and r.status in ('active', 'finalizing', 'cleanup_pending'))
    or exists (select 1 from storage.objects o where o.bucket_id = 'event-documents'
      and split_part(o.name, '/', 1) = old.id::text and o.archived_at is null)
  then
    raise exception using errcode = '55000', message = 'EVENT_DOCUMENT_CLEANUP_REQUIRED';
  end if;
  return old;
end;
$$;
revoke all on function private.guard_event_document_cascade() from public, anon, authenticated, service_role;
drop trigger if exists event_document_cascade_guard on public.events;
create trigger event_document_cascade_guard before delete on public.events
for each row execute function private.guard_event_document_cascade();

-- A late Storage write must serialize with the parent DELETE and fail if its
-- event was already removed. This covers service uploads as well as browser roles.
create or replace function private.guard_event_document_storage_parent()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.bucket_id = 'event-documents' then
    perform 1 from public.events e
      where e.id::text = split_part(new.name, '/', 1) for update;
    if not found then
      raise exception using errcode = '23503', message = 'DOCUMENT_EVENT_NOT_FOUND';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_event_document_storage_parent() from public, anon, authenticated, service_role;
drop trigger if exists event_document_storage_parent_guard on storage.objects;
create trigger event_document_storage_parent_guard before insert or update of bucket_id, name on storage.objects
for each row execute function private.guard_event_document_storage_parent();
