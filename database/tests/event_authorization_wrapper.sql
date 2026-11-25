-- Isolated fixtures and session settings are rolled back, including on failure.
begin;
insert into auth.users(id,email) values
 ('95250000-0000-4000-8000-000000000001','wrapper-owner@example.invalid'),
 ('95250000-0000-4000-8000-000000000002','wrapper-other@example.invalid');
insert into public.events(id,owner_id,public_id,event_type,bride_email) values
 ('95250000-0000-4000-8000-000000000003','95250000-0000-4000-8000-000000000001','wrapper-regression-20261125','wedding','wrapper-owner@example.invalid');
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"email":"wrapper-owner@example.invalid"}',true);
do $$ begin
 if public.can_access_event('95250000-0000-4000-8000-000000000003') then raise exception 'STALE_JWT_EMAIL_AUTHORIZED';end if;
end $$;
insert into public.event_members(id,event_id,user_id,status,role) values
 ('95250000-0000-4000-8000-000000000004','95250000-0000-4000-8000-000000000003','95250000-0000-4000-8000-000000000002','active','partner');
do $$ begin
 if not public.can_access_event('95250000-0000-4000-8000-000000000003') then raise exception 'ACTIVE_PARTNER_DENIED';end if;
end $$;
update public.event_members set status='revoked' where id='95250000-0000-4000-8000-000000000004';
do $$ begin
 if public.can_access_event('95250000-0000-4000-8000-000000000003') then raise exception 'REVOKED_MEMBER_AUTHORIZED';end if;
end $$;
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000001',true);
do $$ begin
 if not public.can_access_event('95250000-0000-4000-8000-000000000003') then raise exception 'OWNER_DENIED';end if;
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if public.can_access_event('95250000-0000-4000-8000-000000000003') then raise exception 'ANONYMOUS_AUTHORIZED';end if;
end $$;
rollback;
