-- Disposable CI only. Seed three real pre-install first-value sources.
insert into auth.users(id,email) values ('54900000-0000-4000-8000-000000000001','branch54-cohort@example.invalid');
insert into public.events(id,owner_id,name,event_type) values
('54900000-0000-4000-8000-000000000010','54900000-0000-4000-8000-000000000001','B54 old budget','wedding'),
('54900000-0000-4000-8000-000000000011','54900000-0000-4000-8000-000000000001','B54 old expense','wedding'),
('54900000-0000-4000-8000-000000000012','54900000-0000-4000-8000-000000000001','B54 old supplier','wedding'),
('54900000-0000-4000-8000-000000000013','54900000-0000-4000-8000-000000000001','B54 old template only','wedding');
insert into public.budget_items(event_id,name,country_code,amount,source) values ('54900000-0000-4000-8000-000000000013','Old applied idea','it',100,'budget_idea');
insert into public.expenses(event_id,amount,status,from_dashboard) values ('54900000-0000-4000-8000-000000000013',0,'planned',true);
insert into public.budget_items(event_id,name,country_code,amount) values ('54900000-0000-4000-8000-000000000010','Old item','it',25);
insert into public.expenses(event_id,amount,status) values ('54900000-0000-4000-8000-000000000011',25,'approved');
insert into public.suppliers(id,name,category,country_code,source,verification_status,region,province,city) values ('54900000-0000-4000-8000-000000000020','Old supplier','catering','it','admin_import','VERIFIED','Lazio','RM','Roma');
insert into public.saved_suppliers(event_id,supplier_id,status) values ('54900000-0000-4000-8000-000000000012','54900000-0000-4000-8000-000000000020','SAVED');
