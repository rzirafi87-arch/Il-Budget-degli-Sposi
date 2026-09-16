begin;
set local role postgres;

-- ACL inventory invariants: no broad PUBLIC grants or unsafe Data API verbs.
do $$
declare
  bad text;
begin
  select string_agg(format('%I.%I:%s', table_schema, table_name, privilege_type), ', ' order by table_name, privilege_type)
    into bad
    from information_schema.role_table_grants
   where table_schema = 'public'
     and grantee = 'PUBLIC';
  if bad is not null then raise exception 'PUBLIC table privileges remain: %', bad; end if;

  select string_agg(c.relname, ', ' order by c.relname) into bad
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r'
     and c.relname <> all(array[
       'account_deletion_requests','analytics_events','appointments','atelier',
       'budget_ideas','budget_items','catalog_provenance','catalog_review_queue',
       'categories','category_translations','checklist_modules','churches',
       'event_invitations','event_members','event_timeline_translations','event_timelines',
       'event_type_categories','event_type_subcategories','event_type_translations',
       'event_type_variants','event_types','events','expenses','family_groups',
       'geo_countries','guests','i18n_locales','incomes','locations',
       'musica_cerimonia','musica_ricevimento','non_invited_recipients',
       'payment_reminders','places','profiles','rate_limit_buckets','saved_churches',
       'saved_locations','saved_suppliers','subcategories','subcategory_translations',
       'subscription_packages','subscription_transactions','supplier_locations',
       'suppliers','sync_jobs','table_assignments','tables','timeline_items','traditions',
       'user_event_timeline','user_favorites','vendor_places','vendors','wedding_cards',
       'wedding_planners'
     ]);
  if bad is not null then raise exception 'unclassified public tables: %', bad; end if;

  select string_agg(format('%I:%s', table_name, privilege_type), ', ' order by table_name, privilege_type)
    into bad
    from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon'
     and privilege_type <> 'SELECT';
  if bad is not null then raise exception 'anon has non-SELECT privileges: %', bad; end if;

  if has_table_privilege('anon', 'public.events', 'select')
     or has_table_privilege('anon', 'public.catalog_review_queue', 'select')
     or has_table_privilege('authenticated', 'public.sync_jobs', 'select')
     or has_table_privilege('authenticated', 'public.rate_limit_buckets', 'select')
  then raise exception 'private/technical relation exposed through Data API'; end if;

  if not has_table_privilege('anon', 'public.churches', 'select')
     or has_table_privilege('anon', 'public.churches', 'insert')
     or not has_table_privilege('authenticated', 'public.events', 'select,insert,update,delete')
     or not has_table_privilege('service_role', 'public.events', 'select,insert,update,delete')
  then raise exception 'reviewed table capability is missing or excessive'; end if;

  if has_sequence_privilege('anon', 'public.budget_items_id_seq', 'usage')
     or has_sequence_privilege('authenticated', 'public.traditions_id_seq', 'usage')
     or not has_sequence_privilege('authenticated', 'public.budget_items_id_seq', 'usage')
  then raise exception 'sequence least privilege mismatch'; end if;
end
$$;

-- RPC exposure and SECURITY DEFINER search_path.
do $$
declare
  bad text;
begin
  if has_function_privilege('anon', 'public.accept_event_invitation(text,uuid)', 'execute')
     or has_function_privilege('authenticated', 'public.accept_event_invitation(text,uuid)', 'execute')
     or has_function_privilege('authenticated', 'public.save_budget_idea_snapshot(uuid,uuid,jsonb)', 'execute')
     or not has_function_privilege('service_role', 'public.accept_event_invitation(text,uuid)', 'execute')
     or not has_function_privilege('authenticated', 'public.can_access_event(uuid)', 'execute')
  then raise exception 'RPC least privilege mismatch'; end if;

  select string_agg(p.oid::regprocedure::text, ', ' order by p.oid::regprocedure::text)
    into bad
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.prosecdef
     and not coalesce(p.proconfig, '{}'::text[]) @> array['search_path=pg_catalog, public, auth, extensions, pg_temp'];
  if bad is not null then raise exception 'unsafe SECURITY DEFINER search_path: %', bad; end if;

  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='v'
       and coalesce(c.reloptions, '{}'::text[]) @> array['security_invoker=true'] is false
  ) then raise exception 'public view without security_invoker'; end if;
end
$$;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
 ('51040000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner51m4@example.invalid','',now(),now(),now()),
 ('51040000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner51m4@example.invalid','',now(),now(),now()),
 ('51040000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger51m4@example.invalid','',now(),now(),now()),
 ('51040000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','noevent51m4@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name) values
 ('51040000-0000-4000-8000-000000000011','51040000-0000-4000-8000-000000000001','M4 owner event'),
 ('51040000-0000-4000-8000-000000000012','51040000-0000-4000-8000-000000000003','M4 stranger event');
insert into public.event_members(event_id,user_id,role,status,accepted_at) values
 ('51040000-0000-4000-8000-000000000011','51040000-0000-4000-8000-000000000002','partner','active',now());
insert into public.appointments(id,event_id,title,appointment_date) values
 ('51040000-0000-4000-8000-000000000021','51040000-0000-4000-8000-000000000011','Owner appointment',current_date),
 ('51040000-0000-4000-8000-000000000022','51040000-0000-4000-8000-000000000012','Other appointment',current_date);

-- anon: catalog allowlist only, no private rows or writes.
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
begin
  perform count(*) from public.churches;
  begin perform count(*) from public.events; raise exception 'anon read events';
  exception when insufficient_privilege then null; end;
  begin insert into public.churches(name,city) values('Forbidden','Nowhere'); raise exception 'anon wrote catalog';
  exception when insufficient_privilege then null; end;
end
$$;

-- Owner sees/writes its event only; a manipulated owner_id is blocked.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"51040000-0000-4000-8000-000000000001","email":"owner51m4@example.invalid","role":"authenticated"}',true);
do $$
declare n integer;
begin
  select count(*) into n from public.appointments;
  if n <> 1 then raise exception 'owner isolation mismatch: %', n; end if;
  insert into public.appointments(event_id,title,appointment_date)
    values('51040000-0000-4000-8000-000000000011','Owner write',current_date);
  begin
    insert into public.events(owner_id,name) values('51040000-0000-4000-8000-000000000003','Manipulated owner');
    raise exception 'owner_id manipulation succeeded';
  exception when insufficient_privilege then null; end;
end
$$;

-- Active partner shares only the contracted event and cannot access another.
select set_config('request.jwt.claims','{"sub":"51040000-0000-4000-8000-000000000002","email":"partner51m4@example.invalid","role":"authenticated"}',true);
do $$
declare n integer;
begin
  select count(*) into n from public.appointments;
  if n <> 2 then raise exception 'active partner read/write contract mismatch: %', n; end if;
  update public.appointments set title='Partner write'
   where id='51040000-0000-4000-8000-000000000021';
  if not found then raise exception 'active partner write denied'; end if;
  delete from public.appointments where id='51040000-0000-4000-8000-000000000022';
  if found then raise exception 'partner accessed different event'; end if;
end
$$;

-- Revocation immediately removes reads and writes; stale cookie/event ids confer nothing.
set local role postgres;
update public.event_members set status='revoked'
 where event_id='51040000-0000-4000-8000-000000000011'
   and user_id='51040000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"51040000-0000-4000-8000-000000000002","email":"partner51m4@example.invalid","role":"authenticated","app-current-event":"51040000-0000-4000-8000-000000000011"}',true);
do $$
declare n integer;
begin
  select count(*) into n from public.appointments;
  if n <> 0 then raise exception 'revoked partner/stale CurrentEvent retained access'; end if;
  insert into public.user_favorites(user_id,item_type,item_id)
    values('51040000-0000-4000-8000-000000000002','church','51040000-0000-4000-8000-000000000099');
  if not found then raise exception 'user-global favorite denied'; end if;
end
$$;

-- Stranger and authenticated user with no event receive no private rows.
select set_config('request.jwt.claims','{"sub":"51040000-0000-4000-8000-000000000003","email":"stranger51m4@example.invalid","role":"authenticated"}',true);
do $$ declare n integer; begin
  select count(*) into n from public.appointments;
  if n <> 1 then raise exception 'stranger should see exactly own event: %', n; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"51040000-0000-4000-8000-000000000004","email":"noevent51m4@example.invalid","role":"authenticated"}',true);
do $$ declare n integer; begin
  select count(*) into n from public.appointments;
  if n <> 0 then raise exception 'user without events saw private rows'; end if;
  perform count(*) from public.suppliers;
end $$;

-- service_role remains the server/cron boundary and can operate across events.
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
do $$ declare n integer; begin
  select count(*) into n from public.appointments;
  if n < 2 then raise exception 'service role cannot read required rows'; end if;
  update public.appointments set reminder_48h_sent=true
   where id='51040000-0000-4000-8000-000000000022';
  if not found then raise exception 'service role write denied'; end if;
end $$;

rollback;
