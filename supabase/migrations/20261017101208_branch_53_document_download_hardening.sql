-- Branch 53 migration 13: browser reads are denied by default.
-- Private documents are served only by the authorized server download route.
-- No data, Storage objects, service-role grants or seating objects are changed.
drop policy if exists event_documents_storage_select on storage.objects;
