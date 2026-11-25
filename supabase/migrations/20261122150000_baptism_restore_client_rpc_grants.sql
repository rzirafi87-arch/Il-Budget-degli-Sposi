-- Branch 51 reconciliation can run after the newer baptism migrations in QA.
-- Restore only the two reviewed client entry points; each checks auth.uid()
-- and event ownership internally. Anonymous callers remain denied.
revoke all on function public.read_family_baptism(uuid) from public, anon;
revoke all on function public.save_family_baptism(uuid, integer, jsonb) from public, anon;
grant execute on function public.read_family_baptism(uuid) to authenticated;
grant execute on function public.save_family_baptism(uuid, integer, jsonb) to authenticated;
