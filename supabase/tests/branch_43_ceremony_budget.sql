create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(13);

select has_column('public','wedding_cards','ceremony_type','neutral ceremony type exists');
select has_column('public','wedding_cards','ceremony_place_name','manual ceremony place exists');
select has_column('public','wedding_cards','religion','neutral religion classification exists');
select has_column('public','subcategories','is_custom','custom budget marker exists');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('43000000-0000-4000-8000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch43-owner@example.invalid','',now(),now(),now()),
('43000000-0000-4000-8000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch43-partner@example.invalid','',now(),now(),now()),
('43000000-0000-4000-8000-00000000000c','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch43-other@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name,event_type,groom_email) values
('43000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-00000000000a','Synthetic Branch 43','wedding','branch43-partner@example.invalid'),
('43000000-0000-4000-8000-000000000002','43000000-0000-4000-8000-00000000000c','Isolated Branch 43','wedding',null);
insert into public.wedding_cards(event_id,ceremony_type,ceremony_place_kind,ceremony_place_name)
values('43000000-0000-4000-8000-000000000001','civil','Comune / Municipio','Municipio sintetico');
select is((select ceremony_type from public.wedding_cards where event_id='43000000-0000-4000-8000-000000000001'),'civil','civil ceremony persists without names or date');
select is((select ceremony_place_name from public.wedding_cards where event_id='43000000-0000-4000-8000-000000000001'),'Municipio sintetico','manual place persists privately');
select lives_ok($q$select public.save_budget_idea_snapshot('43000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-00000000000b','[{"category":"Intrattenimento","subcategory":"Voce sintetica","idea_amount":300,"enabled":true,"custom":true},{"category":"Foto & Video","subcategory":"Servizio fotografico","idea_amount":900,"enabled":false}]')$q$,'partner saves shared budget snapshot');
select is((select count(*)::int from public.expenses where event_id='43000000-0000-4000-8000-000000000001'),2,'selected state snapshot persists');
select is((select count(*)::int from public.expenses where event_id='43000000-0000-4000-8000-000000000001' and is_enabled),1,'only one snapshot entry is enabled');
select ok((select s.is_custom from public.subcategories s join public.expenses e on e.subcategory_id=s.id where e.event_id='43000000-0000-4000-8000-000000000001' and e.subcategory='Voce sintetica'),'custom marker persists');
select throws_ok($q$select public.save_budget_idea_snapshot('43000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-00000000000c','[]')$q$,'42501',null,'other event user cannot overwrite snapshot');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"43000000-0000-4000-8000-00000000000b","role":"authenticated"}',true);
select is((select count(*)::int from public.wedding_cards),1,'partner sees ceremony for shared event only');
select is((select count(*)::int from public.expenses),2,'partner sees budget entries for shared event only');
select * from finish();
rollback;
