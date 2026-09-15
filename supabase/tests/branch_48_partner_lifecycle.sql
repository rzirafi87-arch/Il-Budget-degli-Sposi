begin;
set local role postgres;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
 ('48500000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner@example.invalid','',now(),now(),now()),
 ('48500000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner@example.invalid','',now(),now(),now()),
 ('48500000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name) values
 ('48500000-0000-4000-8000-000000000011','48500000-0000-4000-8000-000000000001','Partner lifecycle'),
 ('48500000-0000-4000-8000-000000000012','48500000-0000-4000-8000-000000000003','Other event');
insert into public.event_invitations(event_id,invited_by,invited_email_normalized,token_hash,expires_at,delivery_status)
values('48500000-0000-4000-8000-000000000011','48500000-0000-4000-8000-000000000001','partner@example.invalid',encode(digest('valid-partner-token-0000000000000001','sha256'),'hex'),now()+interval '7 days','sent');
do $$ begin
  begin perform public.accept_event_invitation('valid-partner-token-0000000000000001','48500000-0000-4000-8000-000000000003'); raise exception 'wrong email accepted'; exception when others then if sqlerrm not like '%INVITATION_EMAIL_MISMATCH%' then raise; end if; end;
end $$;
select public.accept_event_invitation('valid-partner-token-0000000000000001','48500000-0000-4000-8000-000000000002');
do $$ begin
 if not exists(select 1 from public.event_members where event_id='48500000-0000-4000-8000-000000000011' and user_id='48500000-0000-4000-8000-000000000002' and role='partner' and status='active') then raise exception 'membership missing'; end if;
 if exists(select 1 from public.event_members where event_id='48500000-0000-4000-8000-000000000012' and user_id='48500000-0000-4000-8000-000000000002') then raise exception 'cross event access'; end if;
end $$;
insert into public.event_invitations(event_id,invited_by,invited_email_normalized,token_hash,expires_at)
values('48500000-0000-4000-8000-000000000012','48500000-0000-4000-8000-000000000003','partner@example.invalid',encode(digest('reject-partner-token-00000000000001','sha256'),'hex'),now()+interval '7 days');
select public.reject_event_invitation('reject-partner-token-00000000000001','48500000-0000-4000-8000-000000000002');
do $$ begin if exists(select 1 from public.event_members where event_id='48500000-0000-4000-8000-000000000012' and user_id='48500000-0000-4000-8000-000000000002') then raise exception 'rejection created membership'; end if; end $$;
rollback;
