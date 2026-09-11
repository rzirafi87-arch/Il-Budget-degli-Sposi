begin;
do $$
declare owner_id uuid := '45000000-0000-0000-0000-000000000001'; partner_id uuid := '45000000-0000-0000-0000-000000000002';
  event_a uuid := '45000000-0000-0000-0000-000000000010'; event_b uuid := '45000000-0000-0000-0000-000000000020'; result jsonb;
begin
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='expenses' and column_name='canonical_key') then raise exception 'expenses canonical_key missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='expenses_unique_event_canonical_active') then raise exception 'expense canonical uniqueness missing'; end if;
  insert into auth.users(id,email) values(owner_id,'branch45-owner@example.invalid'),(partner_id,'branch45-partner@example.invalid');
  insert into public.events(id,owner_id,event_type,groom_email) values(event_a,owner_id,'wedding','branch45-partner@example.invalid'),(event_b,owner_id,'wedding',null);

  result := public.save_budget_idea_snapshot(event_a,owner_id,'[
    {"category":"Wedding Bag","subcategory":"Ventaglio","canonicalKey":"wedding.guest-comfort.fan","amount":100,"enabled":true},
    {"category":"Wedding Bag","subcategory":"Libretto della cerimonia","canonicalKey":"wedding.ceremony.booklet","amount":50,"enabled":true},
    {"category":"Wedding Bag","subcategory":"Ventagli ricamati a mano","amount":25,"enabled":true,"custom":true}
  ]'::jsonb);
  if (result->>'inserted')::int <> 3 then raise exception 'initial snapshot count'; end if;
  if (select count(*) from public.expenses where event_id=event_a and canonical_key='wedding.guest-comfort.fan') <> 1 then raise exception 'canonical duplicate'; end if;
  if (select sum(committed_amount) from public.expenses where event_id=event_a and taxonomy_status='active') <> 175 then raise exception 'total mismatch'; end if;
  if (select count(*) from public.subcategories s join public.categories c on c.id=s.category_id where c.event_id=event_a and s.is_custom and s.canonical_key is null) <> 1 then raise exception 'custom distinction lost'; end if;

  result := public.save_budget_idea_snapshot(event_a,partner_id,'[
    {"category":"Wedding Bag","subcategory":"Ventaglio","canonicalKey":"wedding.guest-comfort.fan","amount":100,"enabled":true},
    {"category":"Cerimonia","subcategory":"Ventagli","canonicalKey":"wedding.guest-comfort.fan","amount":100,"enabled":true}
  ]'::jsonb);
  if (select count(*) from public.expenses where event_id=event_a and canonical_key='wedding.guest-comfort.fan') <> 1 then raise exception 'partner reload not idempotent'; end if;
  if exists(select 1 from public.expenses where event_id=event_b) then raise exception 'event isolation failed'; end if;
end $$;
rollback;
