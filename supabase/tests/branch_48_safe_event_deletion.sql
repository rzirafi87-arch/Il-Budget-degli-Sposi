begin;
set local role postgres;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
 ('48000000-0000-4000-8000-000000000021','00000000-0000-0000-0000-000000000000','authenticated','authenticated','delete-owner@example.invalid','',now(),now(),now()),
 ('48000000-0000-4000-8000-000000000022','00000000-0000-0000-0000-000000000000','authenticated','authenticated','delete-partner@example.invalid','',now(),now(),now()),
 ('48000000-0000-4000-8000-000000000023','00000000-0000-0000-0000-000000000000','authenticated','authenticated','delete-third@example.invalid','',now(),now(),now());

insert into public.events(id, owner_id, name) values
 ('48000000-0000-4000-8000-000000000031','48000000-0000-4000-8000-000000000021','Delete A'),
 ('48000000-0000-4000-8000-000000000032','48000000-0000-4000-8000-000000000021','Preserve B');
insert into public.event_members(event_id,user_id,role,status,accepted_at)
values ('48000000-0000-4000-8000-000000000031','48000000-0000-4000-8000-000000000022','partner','active',now());
insert into public.budget_items(event_id,name,amount,country_code)
values ('48000000-0000-4000-8000-000000000031','Delete budget',100,'IT'),
       ('48000000-0000-4000-8000-000000000032','Preserve budget',200,'IT');

do $$
declare supplier_count bigint;
begin
  select count(*) into supplier_count from public.suppliers;
  perform set_config('branch48.supplier_count', supplier_count::text, true);
end $$;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000022","email":"delete-partner@example.invalid","role":"authenticated"}',true);
do $$ begin
  delete from public.events where id='48000000-0000-4000-8000-000000000031';
  if found then raise exception 'partner deleted event'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000023","email":"delete-third@example.invalid","role":"authenticated"}',true);
do $$ begin
  delete from public.events where id='48000000-0000-4000-8000-000000000031';
  if found then raise exception 'unrelated user deleted event'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  delete from public.events where id='48000000-0000-4000-8000-000000000031';
  if found then raise exception 'anonymous user deleted event'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"48000000-0000-4000-8000-000000000021","email":"delete-owner@example.invalid","role":"authenticated"}',true);
delete from public.events where id='48000000-0000-4000-8000-000000000031';

set local role postgres;
do $$ begin
  if exists(select 1 from public.events where id='48000000-0000-4000-8000-000000000031') then raise exception 'owner deletion failed'; end if;
  if exists(select 1 from public.budget_items where event_id='48000000-0000-4000-8000-000000000031') then raise exception 'budget cascade failed'; end if;
  if not exists(select 1 from public.events where id='48000000-0000-4000-8000-000000000032') then raise exception 'other event changed'; end if;
  if not exists(select 1 from public.budget_items where event_id='48000000-0000-4000-8000-000000000032') then raise exception 'other event budget changed'; end if;
  if (select count(*) from public.suppliers)::text <> current_setting('branch48.supplier_count') then raise exception 'global suppliers changed'; end if;
  if (select confdeltype from pg_constraint where conname='budget_items_event_id_fkey') <> 'c' then raise exception 'budget FK is not cascade'; end if;
  if (select confdeltype from pg_constraint where conname='catalog_review_queue_event_id_fkey') <> 'n' then raise exception 'community catalog link is not set null'; end if;
  if exists (select 1 from pg_constraint where contype='f' and confrelid='public.events'::regclass and confdeltype not in ('c','n')) then
    raise exception 'an event dependency has an unsafe delete action';
  end if;
end $$;
rollback;
