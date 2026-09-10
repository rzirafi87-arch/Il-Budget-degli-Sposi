-- Community clients create/read through RLS; edits are validated by the server API.
-- Table-wide UPDATE would also expose moderation columns, so it is intentionally withheld.
revoke update on public.catalog_review_queue from authenticated;
grant select, insert on public.catalog_review_queue to authenticated;
