begin;
set local role postgres;

do $$
declare
  owner_id uuid := '48800000-0000-4000-8000-000000000001';
  v_event_id uuid := '48800000-0000-4000-8000-000000000002';
  result jsonb;
begin
  insert into auth.users(id,email) values(owner_id,'branch48-budget-identity@example.invalid');
  insert into public.events(id,owner_id,event_type) values(v_event_id,owner_id,'wedding');

  result := public.save_budget_idea_snapshot(v_event_id,owner_id,'[
    {"category":"Cerimonia","subcategory":"Musica","canonicalKey":"wedding.ceremony.music","amount":100,"enabled":true},
    {"category":"Cerimonia","subcategory":"musica","canonicalKey":"wedding.reception.music","amount":200,"enabled":true},
    {"category":"Cerimonia","subcategory":"Musica","amount":300,"enabled":true,"custom":true}
  ]'::jsonb);

  if (result->>'inserted')::int <> 3 then raise exception 'canonical/custom identity snapshot count'; end if;
  if (select count(*) from public.subcategories s join public.categories c on c.id=s.category_id
      where c.event_id=v_event_id and lower(btrim(s.name))='musica') <> 3
    then raise exception 'same label identities were merged'; end if;
  if (select count(distinct canonical_key) from public.subcategories s join public.categories c on c.id=s.category_id
      where c.event_id=v_event_id and s.canonical_key is not null) <> 2
    then raise exception 'different canonical keys were not preserved'; end if;

  result := public.save_budget_idea_snapshot(v_event_id,owner_id,'[
    {"category":"Cerimonia","subcategory":"MUSICA","canonicalKey":"wedding.ceremony.music","amount":125,"enabled":true},
    {"category":"Cerimonia","subcategory":"musica","canonicalKey":"wedding.reception.music","amount":225,"enabled":true},
    {"category":"Cerimonia","subcategory":"musica","amount":325,"enabled":true,"custom":true}
  ]'::jsonb);

  if (result->>'inserted')::int <> 3 then raise exception 'repeated snapshot count'; end if;
  if (select count(*) from public.subcategories s join public.categories c on c.id=s.category_id
      where c.event_id=v_event_id and lower(btrim(s.name))='musica') <> 3
    then raise exception 'repeated load created or removed identities'; end if;
  if (select sum(committed_amount) from public.expenses where event_id=v_event_id) <> 675
    then raise exception 'amounts were not preserved on repeated load'; end if;
end $$;

rollback;
