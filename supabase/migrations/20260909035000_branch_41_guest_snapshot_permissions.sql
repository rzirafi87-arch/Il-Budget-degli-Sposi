-- Branch 41 runtime fix: the backend invokes the atomic snapshot as
-- service_role, which intentionally has no direct SELECT grant on auth.users.
-- SECURITY DEFINER is safe here because execution remains service-role-only
-- and the function validates p_user_id against the target event before writes.
alter function public.save_event_guest_snapshot(uuid,uuid,date,jsonb,jsonb,jsonb)
  security definer;

revoke all on function public.save_event_guest_snapshot(uuid,uuid,date,jsonb,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.save_event_guest_snapshot(uuid,uuid,date,jsonb,jsonb,jsonb)
  to service_role;

