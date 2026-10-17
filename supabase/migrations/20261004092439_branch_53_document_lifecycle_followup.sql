-- Keep audit/idempotency state while allowing an actor account to be removed.
alter table private.event_document_deletions alter column actor_id drop not null;
alter table private.event_document_deletions drop constraint if exists event_document_deletions_actor_id_fkey;
alter table private.event_document_deletions add constraint event_document_deletions_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete set null;

-- Event membership alone cannot reveal a tombstoned or untracked private file.
drop policy if exists event_documents_storage_select on storage.objects;
create policy event_documents_storage_select on storage.objects
for select to authenticated using (
  bucket_id = 'event-documents'
  and case when coalesce((storage.foldername(name))[1], '') ~*
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.can_access_event(((storage.foldername(name))[1])::uuid) else false end
  and exists (select 1 from public.event_documents d
    where d.object_path = storage.objects.name and d.deletion_state = 'active')
);
