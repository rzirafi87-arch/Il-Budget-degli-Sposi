-- Branch 48 milestone 1: ownership is never transferable through the Data API.
-- Service-role maintenance remains possible for a future, explicitly controlled
-- ownership-transfer operation. This trigger updates no existing rows.
create or replace function public.prevent_event_owner_change()
returns trigger language plpgsql set search_path = public, auth as $$
begin
  if new.owner_id is distinct from old.owner_id
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'EVENT_OWNER_IMMUTABLE' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.prevent_event_owner_change() from public, anon, authenticated;
grant execute on function public.prevent_event_owner_change() to service_role;
drop trigger if exists events_prevent_owner_change on public.events;
create trigger events_prevent_owner_change before update of owner_id on public.events
for each row execute function public.prevent_event_owner_change();
