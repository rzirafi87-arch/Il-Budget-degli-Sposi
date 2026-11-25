-- A fresh replay includes the historical baptism QA hotfix, which predates
-- Branch53 actor authorization. Reconcile it without changing historical files.
-- Resolve legacy emails from auth.users, never from a potentially stale JWT.
begin;
create or replace function public.can_access_event(p_event_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.event_access_role_for_actor(p_event_id, (select auth.uid())) is not null
$$;
revoke all on function public.can_access_event(uuid) from public, anon, authenticated;
grant execute on function public.can_access_event(uuid) to authenticated, service_role;
commit;
