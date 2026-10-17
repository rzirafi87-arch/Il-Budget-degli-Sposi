-- Parent lock also serializes reservation expiry with the final Storage write.
create or replace function private.guard_event_document_storage_parent()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.bucket_id = 'event-documents' then
    perform 1 from public.events e
      where e.id::text = split_part(new.name, '/', 1) for update;
    if not found then
      raise exception using errcode='23503',message='DOCUMENT_EVENT_NOT_FOUND';
    end if;
    -- Current protocol uses event/reservation UUID/random filename. Historical
    -- flat/non-reservation paths remain compatible; tracked paths never bypass.
    if split_part(new.name,'/',2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or exists(select 1 from private.event_document_upload_reservations r where r.object_path=new.name) then
      if not exists(select 1 from private.event_document_upload_reservations r
        where r.event_id::text=split_part(new.name,'/',1) and r.object_path=new.name
          and r.status='active' and r.expires_at>clock_timestamp())
        and not exists(select 1 from public.event_documents d
          where d.event_id::text=split_part(new.name,'/',1) and d.object_path=new.name and d.deletion_state='active') then
        raise exception using errcode='55000',message='DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE';
      end if;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_event_document_storage_parent() from public,anon,authenticated,service_role;
