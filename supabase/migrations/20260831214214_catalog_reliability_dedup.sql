-- Branch 31: additive reliability metadata and a minimal server-only review queue.
alter table public.catalog_provenance
  add column if not exists source_updated_at timestamptz,
  add column if not exists missed_observations integer not null default 0,
  add column if not exists freshness_status text not null default 'ACTIVE';

alter table public.catalog_provenance
  add constraint catalog_provenance_missed_observations_check check (missed_observations >= 0),
  add constraint catalog_provenance_freshness_status_check check (freshness_status in ('ACTIVE','STALE','UNVERIFIED_STALE'));

create table public.catalog_review_queue (
  id uuid primary key default gen_random_uuid(), entity_type text not null, candidate_entity_id uuid, source text not null,
  incoming_fingerprint text not null, match_score smallint not null, conflict_level text not null,
  reasons jsonb not null default '{}'::jsonb, payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING', created_at timestamptz not null default now(), reviewed_at timestamptz,
  constraint catalog_review_queue_entity_type_check check (entity_type in ('church','location','supplier')),
  constraint catalog_review_queue_score_check check (match_score between 0 and 100),
  constraint catalog_review_queue_conflict_check check (conflict_level in ('NON_CONFLICTING','SOFT_CONFLICT','HARD_CONFLICT')),
  constraint catalog_review_queue_status_check check (status in ('PENDING','APPROVED','REJECTED','DISMISSED')),
  constraint catalog_review_queue_fingerprint_check check (incoming_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint catalog_review_queue_reviewed_check check ((status='PENDING' and reviewed_at is null) or (status<>'PENDING' and reviewed_at is not null)),
  constraint catalog_review_queue_payload_size_check check (pg_column_size(payload) <= 8192),
  constraint catalog_review_queue_reasons_size_check check (pg_column_size(reasons) <= 16384)
);

create unique index catalog_review_queue_pending_uidx on public.catalog_review_queue(entity_type,candidate_entity_id,incoming_fingerprint) where status='PENDING';
create index idx_catalog_review_queue_status_created on public.catalog_review_queue(status,created_at);
create index idx_catalog_review_queue_candidate on public.catalog_review_queue(entity_type,candidate_entity_id);
alter table public.catalog_review_queue enable row level security;
revoke all on table public.catalog_review_queue from anon, authenticated;
grant all on table public.catalog_review_queue to service_role;
comment on table public.catalog_review_queue is 'Server-only bounded evidence for ambiguous catalog matches and source conflicts; no admin UI and no large raw payloads.';
comment on column public.catalog_provenance.metadata is 'Minimal provenance metadata; Branch 31 may include a field_sources object for field-level traceability.';
