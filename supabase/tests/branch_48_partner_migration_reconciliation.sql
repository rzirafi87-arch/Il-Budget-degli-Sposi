begin;
set local role postgres;
create temporary table partner_before as
select (select count(*) from public.event_members) member_count,
       (select count(*) from public.event_invitations) invitation_count,
       (select md5(coalesce(string_agg(id::text||':'||event_id::text||':'||user_id::text||':'||role||':'||status,'|' order by id),'')) from public.event_members) member_checksum,
       (select md5(coalesce(string_agg(id::text||':'||event_id::text||':'||status||':'||coalesce(invited_email_normalized,''),'|' order by id),'')) from public.event_invitations) invitation_checksum;

-- Equivalent schema carrying the historical 20260914133505 migration is safe.
\ir ../migrations/20260914150000_branch_48_partner_lifecycle.sql
do $$ declare b partner_before%rowtype; begin select * into b from partner_before;
  if (select count(*) from public.event_members)<>b.member_count or
     (select count(*) from public.event_invitations)<>b.invitation_count or
     (select md5(coalesce(string_agg(id::text||':'||event_id::text||':'||user_id::text||':'||role||':'||status,'|' order by id),'')) from public.event_members)<>b.member_checksum or
     (select md5(coalesce(string_agg(id::text||':'||event_id::text||':'||status||':'||coalesce(invited_email_normalized,''),'|' order by id),'')) from public.event_invitations)<>b.invitation_checksum
  then raise exception 'partner reconciliation changed membership or invitation data'; end if;
end $$;

-- An object with an approved name but divergent behavior is rejected and the
-- exception subtransaction restores the compatible definition afterwards.
do $$ begin
  begin
    execute $fn$create or replace function public.reject_event_invitation(p_token text,p_user_id uuid)
      returns uuid language plpgsql security definer set search_path=public,auth,extensions
      as 'begin return null; end'$fn$;
    perform private.assert_branch48_partner_lifecycle_compatible();
    raise exception 'divergent function was accepted';
  exception when raise_exception then
    if sqlerrm not like 'BRANCH48_PARTNER_DIVERGENT_FUNCTION:%' then raise; end if;
  end;
end $$;
rollback;

-- Base schema with all five lifecycle columns and new routines absent.
begin;
set local role postgres;
drop function public.reject_event_invitation(text,uuid);
drop function public.rotate_event_invitation_token(uuid,uuid,uuid,text,timestamptz);
drop index public.event_members_one_active_partner_idx;
drop index public.event_invitations_one_pending_partner_idx;
alter table public.event_invitations drop constraint event_invitations_status_check;
alter table public.event_invitations add constraint event_invitations_status_check
  check(status in ('pending','accepted','expired','revoked'));
alter table public.event_invitations drop column sent_at,drop column last_sent_at,
  drop column delivery_status,drop column delivery_error_code,drop column rejected_at;
\ir ../migrations/20260914150000_branch_48_partner_lifecycle.sql
do $$ begin
  if (select count(*) from information_schema.columns where table_schema='public' and table_name='event_invitations'
      and column_name in ('sent_at','last_sent_at','delivery_status','delivery_error_code','rejected_at'))<>5
    then raise exception 'absent lifecycle schema was not created'; end if;
  perform private.assert_branch48_partner_lifecycle_compatible();
end $$;
rollback;
