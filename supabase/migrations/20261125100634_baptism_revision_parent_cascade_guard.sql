-- Skip revision writes only when the parent was removed by an event cascade.
-- Ordinary guest/expense edits still lock the event and invalidate snapshots.
begin;
create or replace function public.bump_baptism_revision()
returns trigger language plpgsql security definer set search_path='' as $$
declare eid uuid;
begin
 if TG_OP='UPDATE' and OLD.baptism_details is not null and (NEW.event_id<>OLD.event_id or NEW.baptism_details is null) then raise exception 'BAPTISM_ROW_IDENTITY_IMMUTABLE';end if;
 eid=case when TG_OP='DELETE' then OLD.event_id else NEW.event_id end;
 if (case when TG_OP='DELETE' then OLD.baptism_details else NEW.baptism_details end) is not null then
  perform 1 from public.events where id=eid for update;
  if found then
   update public.baptism_family_plans set revision=revision+1,request_hash=null where event_id=eid;
  end if;
 end if;
 return case when TG_OP='DELETE' then OLD else NEW end;
end $$;
revoke all on function public.bump_baptism_revision() from public,anon,authenticated;
commit;
