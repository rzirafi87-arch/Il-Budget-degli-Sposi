-- Branch 30: common catalog ingestion provenance. Additive and server-only.
create table public.catalog_provenance (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  external_key text,
  source_type text not null,
  source_name text not null,
  source_url text,
  external_id text not null,
  imported_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  raw_fingerprint text not null,
  metadata jsonb not null default '{}'::jsonb,
  constraint catalog_provenance_entity_type_check check (entity_type in ('church','location','supplier')),
  constraint catalog_provenance_source_type_not_blank check (length(trim(source_type)) > 0),
  constraint catalog_provenance_source_name_not_blank check (length(trim(source_name)) > 0),
  constraint catalog_provenance_external_id_not_blank check (length(trim(external_id)) > 0),
  constraint catalog_provenance_fingerprint_check check (raw_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint catalog_provenance_source_identity_key unique(entity_type,source_type,source_name,external_id)
);

create index idx_catalog_provenance_entity on public.catalog_provenance(entity_type,entity_id);
create index idx_catalog_provenance_last_seen on public.catalog_provenance(last_seen_at);
alter table public.catalog_provenance enable row level security;
revoke all on table public.catalog_provenance from anon, authenticated;
grant all on table public.catalog_provenance to service_role;
comment on table public.catalog_provenance is 'Server-only provenance for the shared church, location and supplier ingestion pipeline. No user-private saved state.';
