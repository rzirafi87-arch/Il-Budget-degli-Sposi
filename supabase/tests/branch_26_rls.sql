-- Branch 26 catalog and saved-church authorization regression tests.
-- All fixtures are rolled back.

begin;
set local role postgres;

insert into public.i18n_locales(code, name, direction)
values ('it', 'Italiano', 'ltr') on conflict (code) do nothing;

insert into public.geo_countries(code, default_locale)
values ('zz', 'it') on conflict (code) do nothing;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values
  ('26000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'church-a@example.invalid', '', now(), now(), now()),
  ('26000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'church-b@example.invalid', '', now(), now(), now());

insert into public.events(id, owner_id, name)
values
  ('26000000-0000-4000-8000-000000000001', '26000000-0000-4000-8000-00000000000a', 'Church event A'),
  ('26000000-0000-4000-8000-000000000002', '26000000-0000-4000-8000-00000000000b', 'Church event B');

insert into public.churches(
  id, name, region, province, city, country_code, source, external_id,
  verification_status, confidence_score
)
values
  ('26000000-0000-4000-8000-000000000011', 'Chiesa Prova Uno', 'Test', 'TT', 'Test A', 'zz',
   'test', 'church-1', 'VERIFIED', 95),
  ('26000000-0000-4000-8000-000000000012', 'Chiesa Prova Due', 'Test', 'TT', 'Test B', 'zz',
   'test', 'church-2', 'TO_CHECK', 20);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare visible_count integer;
begin
  select count(*) into visible_count from public.churches
  where source = 'test';
  if visible_count <> 2 then
    raise exception 'Anonymous catalog read failed: expected 2, found %', visible_count;
  end if;

  begin
    perform count(*) from public.saved_churches;
    raise exception 'Anonymous user read private saved_churches';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.churches(name, region, province, city, country_code, source)
    values ('Unauthorized', 'Test', 'TT', 'Test', 'zz', 'test');
    raise exception 'Anonymous user inserted a global church';
  exception when insufficient_privilege then null;
  end;
end
$$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"26000000-0000-4000-8000-00000000000a","role":"authenticated"}',
  true
);

do $$
declare visible_count integer;
begin
  select count(*) into visible_count from public.churches where source = 'test';
  if visible_count <> 2 then
    raise exception 'Authenticated catalog read failed';
  end if;

  begin
    update public.churches set name = 'Unauthorized edit'
    where id = '26000000-0000-4000-8000-000000000011';
    raise exception 'Authenticated user modified global church';
  exception when insufficient_privilege then null;
  end;

  insert into public.saved_churches(event_id, church_id, favorite)
  values (
    '26000000-0000-4000-8000-000000000001',
    '26000000-0000-4000-8000-000000000011',
    true
  );

  begin
    insert into public.saved_churches(event_id, church_id)
    values (
      '26000000-0000-4000-8000-000000000002',
      '26000000-0000-4000-8000-000000000012'
    );
    raise exception 'User A inserted saved church for user B event';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.saved_churches(event_id, church_id)
    values (
      '26000000-0000-4000-8000-000000000001',
      '26000000-0000-4000-8000-000000000011'
    );
    raise exception 'Duplicate event/church was accepted';
  exception when unique_violation then null;
  end;
end
$$;

reset role;
set local role postgres;
insert into public.saved_churches(event_id, church_id)
values (
  '26000000-0000-4000-8000-000000000002',
  '26000000-0000-4000-8000-000000000012'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"26000000-0000-4000-8000-00000000000b","role":"authenticated"}',
  true
);

do $$
declare visible_count integer;
begin
  select count(*) into visible_count from public.saved_churches;
  if visible_count <> 1 then
    raise exception 'User B private isolation failed: expected 1, found %', visible_count;
  end if;

  update public.saved_churches set selected = true
  where event_id = '26000000-0000-4000-8000-000000000001';
  if found then
    raise exception 'User B modified user A saved church';
  end if;
end
$$;

reset role;
set local role postgres;

do $$
declare remaining integer;
begin
  begin
    delete from public.churches
    where id = '26000000-0000-4000-8000-000000000011';
    raise exception 'Referenced global church deletion was not restricted';
  exception when foreign_key_violation then null;
  end;

  delete from public.events
  where id = '26000000-0000-4000-8000-000000000001';

  select count(*) into remaining from public.saved_churches
  where event_id = '26000000-0000-4000-8000-000000000001';
  if remaining <> 0 then
    raise exception 'Event deletion did not cascade to saved_churches';
  end if;
end
$$;

rollback;
