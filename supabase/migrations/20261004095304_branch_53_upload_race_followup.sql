-- Listed Storage paths are removable only when neither metadata nor a live
-- immutable reservation can still finalize them. Reservations precede writes.
create or replace function public.event_document_path_is_untracked(
  p_event_id uuid, p_actor_id uuid, p_object_path text
) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if private.event_access_role_for_actor(p_event_id,p_actor_id) is null then
    raise exception using errcode='42501', message='EVENT_ACCESS_DENIED';
  end if;
  if p_object_path is null or p_object_path not like p_event_id::text || '/%' then
    raise exception using errcode='42501', message='DOCUMENT_RESERVATION_MISMATCH';
  end if;
  perform 1 from public.events where id=p_event_id for update;
  if not found then raise exception using errcode='P0002',message='EVENT_NOT_FOUND'; end if;
  if private.event_access_role_for_actor(p_event_id,p_actor_id) is null then
    raise exception using errcode='42501', message='EVENT_ACCESS_DENIED';
  end if;
  return not exists(select 1 from public.event_documents where event_id=p_event_id and object_path=p_object_path)
    and not exists(select 1 from private.event_document_upload_reservations
      where event_id=p_event_id and object_path=p_object_path
      and status in ('active','finalizing','finalized','cleanup_pending'));
end;
$$;
revoke all on function public.event_document_path_is_untracked(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.event_document_path_is_untracked(uuid,uuid,text) to service_role;
