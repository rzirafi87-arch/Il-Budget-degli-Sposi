-- Do not treat a missing JWT email as an invitation to every empty email slot.
create or replace function public.can_access_event(p_event_id uuid)
returns boolean language sql stable security definer set search_path=public,auth as $$
 select exists(select 1 from public.event_members m where m.event_id=p_event_id and m.user_id=(select auth.uid()) and m.status='active')
 or (not exists(select 1 from public.event_members m where m.event_id=p_event_id and m.user_id=(select auth.uid()))
 and exists(select 1 from public.events e where e.id=p_event_id and
 (e.owner_id=(select auth.uid()) or
 (nullif(btrim(auth.jwt()->>'email'),'') is not null and
 (lower(btrim(e.bride_email))=lower(btrim(auth.jwt()->>'email')) or lower(btrim(e.groom_email))=lower(btrim(auth.jwt()->>'email')))))));
$$;
