begin;
set local role postgres;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
 ('47000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner47@example.invalid','',now(),now(),now()),
 ('47000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner47@example.invalid','',now(),now(),now()),
 ('47000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','third47@example.invalid','',now(),now(),now());

insert into public.events(id, owner_id, name, bride_email) values
 ('47000000-0000-4000-8000-000000000011','47000000-0000-4000-8000-000000000001','Branch 47 A','partner47@example.invalid'),
 ('47000000-0000-4000-8000-000000000012','47000000-0000-4000-8000-000000000001','Branch 47 B',null);

do $$ begin
  if not exists (select 1 from public.event_members where event_id='47000000-0000-4000-8000-000000000011' and user_id='47000000-0000-4000-8000-000000000001' and role='owner' and status='active') then
    raise exception 'owner membership backfill/trigger failed';
  end if;
end $$;

insert into public.event_invitations(event_id, invited_by, invited_email_normalized, token_hash, expires_at)
values
 ('47000000-0000-4000-8000-000000000011','47000000-0000-4000-8000-000000000001','partner47@example.invalid',encode(extensions.digest('valid-token-branch-47-valid-token-1234','sha256'),'hex'),now()+interval '1 day'),
 ('47000000-0000-4000-8000-000000000011','47000000-0000-4000-8000-000000000001','third47@example.invalid',encode(extensions.digest('wrong-email-branch-47-token-123456','sha256'),'hex'),now()+interval '1 day'),
 ('47000000-0000-4000-8000-000000000011','47000000-0000-4000-8000-000000000001','third47@example.invalid',encode(extensions.digest('expired-branch-47-token-123456789','sha256'),'hex'),now()-interval '1 day');

do $$ begin
  begin
    perform public.accept_event_invitation('wrong-email-branch-47-token-123456','47000000-0000-4000-8000-000000000002');
    raise exception 'wrong email accepted';
  exception when others then if sqlerrm = 'wrong email accepted' then raise; end if; end;
  begin
    perform public.accept_event_invitation('expired-branch-47-token-123456789','47000000-0000-4000-8000-000000000003');
    raise exception 'expired invitation accepted';
  exception when others then if sqlerrm = 'expired invitation accepted' then raise; end if; end;
end $$;

select public.accept_event_invitation('valid-token-branch-47-valid-token-1234','47000000-0000-4000-8000-000000000002');

do $$ begin
  if not exists (select 1 from public.event_members where event_id='47000000-0000-4000-8000-000000000011' and user_id='47000000-0000-4000-8000-000000000002' and role='partner' and status='active') then
    raise exception 'partner invite acceptance failed';
  end if;
  begin
    perform public.accept_event_invitation('valid-token-branch-47-valid-token-1234','47000000-0000-4000-8000-000000000002');
    raise exception 'invitation replay accepted';
  exception when others then if sqlerrm = 'invitation replay accepted' then raise; end if; end;
end $$;

-- Each requested shared Matrimonio module remains wired to the same canonical
-- access helper. Combined with the authenticated partner checks below, this
-- guards Budget, Guests/Families, Timeline, Documents/Save the Date, Expenses,
-- and saved supplier/location writes against route or policy drift.
do $$
declare
  scoped_table text;
  scoped_tables constant text[] := array[
    'budget_items', 'budget_ideas', 'guests', 'family_groups',
    'timeline_items', 'appointments', 'wedding_cards', 'expenses',
    'saved_suppliers', 'saved_locations'
  ];
begin
  foreach scoped_table in array scoped_tables loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = scoped_table
        and cmd in ('ALL', 'INSERT', 'UPDATE')
        and coalesce(with_check, qual, '') like '%can_access_event%'
    ) then
      raise exception 'partner write policy missing for %', scoped_table;
    end if;
  end loop;
end $$;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"47000000-0000-4000-8000-000000000002","email":"partner47@example.invalid","role":"authenticated"}',true);
do $$ begin
  if not public.can_access_event('47000000-0000-4000-8000-000000000011') then raise exception 'partner same event denied'; end if;
  if public.can_access_event('47000000-0000-4000-8000-000000000012') then raise exception 'partner other event allowed'; end if;
  delete from public.events where id='47000000-0000-4000-8000-000000000011';
  if found then raise exception 'partner deleted event'; end if;
end $$;

set local role postgres;
update public.event_members set status='revoked' where event_id='47000000-0000-4000-8000-000000000011' and user_id='47000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"47000000-0000-4000-8000-000000000002","email":"partner47@example.invalid","role":"authenticated"}',true);
do $$ begin
  if public.can_access_event('47000000-0000-4000-8000-000000000011') then raise exception 'revoked partner retained legacy access'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"47000000-0000-4000-8000-000000000003","email":"third47@example.invalid","role":"authenticated"}',true);
do $$ begin
  if public.can_access_event('47000000-0000-4000-8000-000000000011') then raise exception 'third user gained access'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"47000000-0000-4000-8000-000000000001","email":"owner47@example.invalid","role":"authenticated"}',true);
do $$ begin
  if not public.is_event_owner('47000000-0000-4000-8000-000000000011') then raise exception 'owner helper denied owner'; end if;
  delete from public.events where id='47000000-0000-4000-8000-000000000012';
  if not found then raise exception 'owner could not delete event'; end if;
end $$;

rollback;
