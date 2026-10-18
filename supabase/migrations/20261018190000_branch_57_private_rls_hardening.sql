-- Branch 57: defense in depth for tables outside the Data API.
-- The private schema is not exposed by PostgREST and anon/authenticated have no
-- USAGE on it, so these tables are unreachable from the browser today. Enabling
-- RLS without policies keeps them closed even if a grant or the exposed schema
-- list changes later. Their only writers are SECURITY DEFINER functions owned by
-- postgres (table owner, BYPASSRLS) and service_role (BYPASSRLS): no behaviour change.

alter table private.subcategory_identity_reservations enable row level security;
alter table private.event_document_deletions enable row level security;
alter table private.event_document_upload_reservations enable row level security;

revoke all on table
  private.subcategory_identity_reservations,
  private.event_document_deletions,
  private.event_document_upload_reservations
from public, anon, authenticated;

-- Supabase advisor 0011 (function_search_path_mutable). The body already uses
-- schema-qualified names; gen_random_uuid, lower and btrim live in pg_catalog.
alter function public.ensure_subcategory(uuid, text) set search_path = '';
