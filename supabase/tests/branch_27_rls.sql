begin;
set local role postgres;
insert into public.i18n_locales(code,name,direction) values('it','Italiano','ltr') on conflict(code) do nothing;
insert into public.geo_countries(code,default_locale) values('zz','it') on conflict(code) do nothing;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('27000000-0000-4000-8000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','location-a@example.invalid','',now(),now(),now()),
('27000000-0000-4000-8000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','location-b@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name) values
('27000000-0000-4000-8000-000000000001','27000000-0000-4000-8000-00000000000a','Location A'),
('27000000-0000-4000-8000-000000000002','27000000-0000-4000-8000-00000000000b','Location B');
insert into public.locations(id,name,venue_type,region,province,city,country_code,source,external_id,verification_status,confidence_score) values
('27000000-0000-4000-8000-000000000011','Villa Test Uno','villa','Test','TT','Test A','zz','test','location-1','VERIFIED',95),
('27000000-0000-4000-8000-000000000012','Villa Test Due','villa','Test','TT','Test B','zz','test','location-2','TO_CHECK',20);

set local role anon; select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if (select count(*) from public.locations where source='test') <> 2 then raise exception 'Anon catalog read failed'; end if;
  begin perform count(*) from public.saved_locations; raise exception 'Anon read private locations'; exception when insufficient_privilege then null; end;
  begin insert into public.locations(name,region,province,city,country_code,source) values('Bad','T','T','T','zz','test'); raise exception 'Anon wrote catalog'; exception when insufficient_privilege then null; end;
end $$;

reset role; set local role authenticated; select set_config('request.jwt.claims','{"sub":"27000000-0000-4000-8000-00000000000a","role":"authenticated"}',true);
insert into public.saved_locations(event_id,location_id,location_role,favorite) values('27000000-0000-4000-8000-000000000001','27000000-0000-4000-8000-000000000011','reception',true);
do $$ begin
  begin insert into public.saved_locations(event_id,location_id) values('27000000-0000-4000-8000-000000000002','27000000-0000-4000-8000-000000000012'); raise exception 'A wrote B data'; exception when insufficient_privilege then null; end;
  begin insert into public.saved_locations(event_id,location_id,location_role) values('27000000-0000-4000-8000-000000000001','27000000-0000-4000-8000-000000000011','reception'); raise exception 'Duplicate accepted'; exception when unique_violation then null; end;
  insert into public.saved_locations(event_id,location_id,location_role,selected) values('27000000-0000-4000-8000-000000000001','27000000-0000-4000-8000-000000000012','ceremony',true);
  update public.saved_locations set selected=true where event_id='27000000-0000-4000-8000-000000000001' and location_role='reception';
end $$;

reset role; set local role postgres;
insert into public.saved_churches(event_id,church_id) select '27000000-0000-4000-8000-000000000001',id from public.churches limit 1;
do $$ begin
  if (select count(*) from public.saved_locations where event_id='27000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Location roles failed'; end if;
  if (select count(*) from public.saved_churches where event_id='27000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Church/location integration failed'; end if;
end $$;
rollback;
