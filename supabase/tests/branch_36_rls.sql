-- Branch 36 appointment isolation. All fixtures are rolled back.
begin;
set local role postgres;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('36000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b36-a@example.invalid', '', now(), now(), now()),
  ('36000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b36-b@example.invalid', '', now(), now(), now());

insert into public.events (id, owner_id, name) values
  ('36000000-0000-4000-8000-000000000001', '36000000-0000-4000-8000-00000000000a', 'Event A'),
  ('36000000-0000-4000-8000-000000000002', '36000000-0000-4000-8000-00000000000b', 'Event B');

insert into public.appointments (id, event_id, title, appointment_date) values
  ('36000000-0000-4000-8000-000000000011', '36000000-0000-4000-8000-000000000001', 'Appointment A', current_date),
  ('36000000-0000-4000-8000-000000000012', '36000000-0000-4000-8000-000000000002', 'Appointment B', current_date);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"36000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

do $$
declare visible_count integer;
begin
  select count(*) into visible_count from public.appointments;
  if visible_count <> 1 then raise exception 'User A can see % appointments, expected 1', visible_count; end if;

  begin
    insert into public.appointments(event_id, title, appointment_date)
    values ('36000000-0000-4000-8000-000000000002', 'Forbidden', current_date);
    raise exception 'User A inserted an appointment for event B';
  exception when insufficient_privilege then null;
  end;

  update public.appointments set title = 'Appointment A updated'
  where id = '36000000-0000-4000-8000-000000000011';
  if not found then raise exception 'User A cannot update appointment A'; end if;

  delete from public.appointments where id = '36000000-0000-4000-8000-000000000012';
  if found then raise exception 'User A deleted appointment B'; end if;
end $$;

rollback;
