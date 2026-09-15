begin;
set local role postgres;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
 ('48000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner48@example.invalid','',now(),now(),now()),
 ('48000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner48@example.invalid','',now(),now(),now()),
 ('48000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','third48@example.invalid','',now(),now(),now());
insert into public.events(id, owner_id, name) values
 ('48000000-0000-4000-8000-000000000011','48000000-0000-4000-8000-000000000001','Branch 48 A'),
 ('48000000-0000-4000-8000-000000000012','48000000-0000-4000-8000-000000000001','Branch 48 B');
insert into public.event_members(event_id,user_id,role,status,accepted_at)
values ('48000000-0000-4000-8000-000000000011','48000000-0000-4000-8000-000000000002','partner','active',now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000002","email":"partner48@example.invalid","role":"authenticated"}',true);
do $$ begin
  begin
    update public.events set owner_id='48000000-0000-4000-8000-000000000002'
    where id='48000000-0000-4000-8000-000000000011';
    raise exception 'partner changed owner_id';
  exception when insufficient_privilege then
    if sqlerrm <> 'EVENT_OWNER_IMMUTABLE' then raise; end if;
  end;
  update public.events set name='Partner permitted update' where id='48000000-0000-4000-8000-000000000011';
  if not found then raise exception 'partner lost legitimate update access'; end if;
  update public.events set name='Cross-event update' where id='48000000-0000-4000-8000-000000000012';
  if found then raise exception 'partner crossed event boundary'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000003","email":"third48@example.invalid","role":"authenticated"}',true);
do $$ begin
  update public.events set name='Third user update' where id='48000000-0000-4000-8000-000000000011';
  if found then raise exception 'third user changed event'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000001","email":"owner48@example.invalid","role":"authenticated"}',true);
do $$ begin
  update public.events set name='Owner permitted update' where id='48000000-0000-4000-8000-000000000011';
  if not found then raise exception 'owner update denied'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  update public.events set name='Anonymous update' where id='48000000-0000-4000-8000-000000000011';
  if found then raise exception 'anonymous update allowed'; end if;
end $$;

set local role postgres;
do $$ begin
  if (select count(*) from public.events where id in ('48000000-0000-4000-8000-000000000011','48000000-0000-4000-8000-000000000012')) <> 2
  then raise exception 'lifecycle test modified event cardinality'; end if;
end $$;
rollback;
