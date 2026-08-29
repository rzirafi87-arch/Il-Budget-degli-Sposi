-- Branch 25 authorization regression test.
-- Safe on an isolated/test database: all fixture writes are rolled back.

begin;

set local role postgres;

insert into public.events (id, owner_id, name)
values
  ('25000000-0000-4000-8000-000000000001', '25000000-0000-4000-8000-00000000000a', 'RLS A'),
  ('25000000-0000-4000-8000-000000000002', '25000000-0000-4000-8000-00000000000b', 'RLS B');

insert into public.expenses (id, event_id, description, amount)
values
  ('25000000-0000-4000-8000-000000000011', '25000000-0000-4000-8000-000000000001', 'Expense A', 1),
  ('25000000-0000-4000-8000-000000000012', '25000000-0000-4000-8000-000000000002', 'Expense B', 1);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"25000000-0000-4000-8000-00000000000a","role":"authenticated"}',
  true
);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.events;
  if visible_count <> 1 then
    raise exception 'RLS failure: user A can see % events, expected 1', visible_count;
  end if;

  select count(*) into visible_count from public.expenses;
  if visible_count <> 1 then
    raise exception 'RLS failure: user A can see % expenses, expected 1', visible_count;
  end if;

  begin
    update public.events
    set owner_id = '25000000-0000-4000-8000-00000000000b'
    where id = '25000000-0000-4000-8000-000000000001';
    raise exception 'RLS failure: user A reassigned event ownership';
  exception
    when insufficient_privilege then null;
  end;

  begin
    update public.expenses
    set event_id = '25000000-0000-4000-8000-000000000002'
    where id = '25000000-0000-4000-8000-000000000011';
    raise exception 'RLS failure: user A moved an expense to user B';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.events;
  if visible_count <> 0 then
    raise exception 'RLS failure: anon can see % private events', visible_count;
  end if;

  select count(*) into visible_count from public.expenses;
  if visible_count <> 0 then
    raise exception 'RLS failure: anon can see % private expenses', visible_count;
  end if;
end
$$;

rollback;

