-- Branch 53 / Milestone 1: private persistent event documents.
-- Additive schema and private Storage configuration only. No application-row cleanup
-- or Production backfill is performed by this migration.

create table if not exists public.event_documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  original_name text not null check (length(btrim(original_name)) between 1 and 255),
  object_path text not null unique,
  category text not null default 'generic'
    check (category in ('quote','contract','invoice','receipt','generic','certificate','license')),
  mime_type text not null
    check (mime_type in ('application/pdf','image/jpeg','image/png')),
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  notes text,
  created_at timestamptz not null default now(),
  constraint event_documents_object_path_event_prefix
    check (object_path like event_id::text || '/%')
);

create index if not exists event_documents_event_created_idx
  on public.event_documents(event_id, created_at desc, id);

alter table public.event_documents enable row level security;

drop policy if exists event_documents_select_event on public.event_documents;
create policy event_documents_select_event
  on public.event_documents for select to authenticated
  using (public.can_access_event(event_id));

drop policy if exists event_documents_insert_event on public.event_documents;
create policy event_documents_insert_event
  on public.event_documents for insert to authenticated
  with check (
    public.can_access_event(event_id)
    and created_by = (select auth.uid())
  );

drop policy if exists event_documents_delete_event on public.event_documents;
create policy event_documents_delete_event
  on public.event_documents for delete to authenticated
  using (public.can_access_event(event_id));

revoke all on table public.event_documents from public, anon;
grant select, insert, delete on table public.event_documents to authenticated;
grant all on table public.event_documents to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-documents',
  'event-documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists event_documents_storage_select on storage.objects;
create policy event_documents_storage_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'event-documents'
    and case
      when coalesce((storage.foldername(name))[1], '') ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_access_event(((storage.foldername(name))[1])::uuid)
      else false
    end
  );

drop policy if exists event_documents_storage_insert on storage.objects;
create policy event_documents_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-documents'
    and case
      when coalesce((storage.foldername(name))[1], '') ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_access_event(((storage.foldername(name))[1])::uuid)
      else false
    end
  );

drop policy if exists event_documents_storage_delete on storage.objects;
create policy event_documents_storage_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-documents'
    and case
      when coalesce((storage.foldername(name))[1], '') ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.can_access_event(((storage.foldername(name))[1])::uuid)
      else false
    end
  );

comment on table public.event_documents is
  'Private event-scoped document metadata. Binary content lives in the private event-documents Storage bucket.';
comment on column public.event_documents.object_path is
  'Immutable private Storage path prefixed by the authoritative event UUID.';
