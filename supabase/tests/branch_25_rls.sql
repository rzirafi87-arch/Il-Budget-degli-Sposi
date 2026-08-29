-- Branch 25 authorization regression test.
-- Safe on an isolated/test database: all fixture writes are rolled back.

begin;

set local role postgres;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values
  (
    '25000000-0000-4000-8000-00000000000a',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'rls-a@example.invalid', '',
    now(), now(), now()
  ),
  (
    '25000000-0000-4000-8000-00000000000b',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'rls-b@example.invalid', '',
    now(), now(), now()
  );

insert into public.events (id, owner_id, name)
values
  ('25000000-0000-4000-8000-000000000001', '25000000-0000-4000-8000-00000000000a', 'RLS A'),
  ('25000000-0000-4000-8000-000000000002', '25000000-0000-4000-8000-00000000000b', 'RLS B'),
  ('25000000-0000-4000-8000-000000000003', '25000000-0000-4000-8000-00000000000c', 'Legacy orphan fixture');

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

  update public.events
  set name = 'RLS A updated'
  where id = '25000000-0000-4000-8000-000000000001';
  if not found then
    raise exception 'RLS failure: user A cannot update own event';
  end if;

  select count(*) into visible_count from public.expenses;
  if visible_count <> 1 then
    raise exception 'RLS failure: user A can see % expenses, expected 1', visible_count;
  end if;

  insert into public.suppliers (
    id, name, region, province, city, verified, user_id
  )
  values (
    '25000000-0000-4000-8000-000000000021',
    'RLS catalog fixture', 'Test', 'Test', 'Test', false,
    '25000000-0000-4000-8000-00000000000a'
  );

  begin
    insert into public.suppliers (
      id, name, region, province, city, verified, user_id
    )
    values (
      '25000000-0000-4000-8000-000000000022',
      'Unauthorized verified fixture', 'Test', 'Test', 'Test', true,
      '25000000-0000-4000-8000-00000000000a'
    );
    raise exception 'RLS failure: user A inserted a pre-verified catalog row';
  exception
    when insufficient_privilege then null;
  end;

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
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"25000000-0000-4000-8000-00000000000b","role":"authenticated"}',
  true
);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.events;
  if visible_count <> 1 then
    raise exception 'RLS failure: user B can see % events, expected 1', visible_count;
  end if;

  update public.events
  set name = 'unauthorized'
  where id = '25000000-0000-4000-8000-000000000001';
  if found then
    raise exception 'RLS failure: user B modified user A event';
  end if;
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

  begin
    perform public.regenerate_event_data('25000000-0000-4000-8000-000000000001');
    raise exception 'RLS failure: anon executed an administrative RPC';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

reset role;
set local role service_role;
do $$
begin
  if not has_function_privilege(
    current_user,
    'public.regenerate_event_data(uuid)',
    'EXECUTE'
  ) then
    raise exception 'RLS failure: service_role lacks administrative RPC access';
  end if;
end
$$;

rollback;
