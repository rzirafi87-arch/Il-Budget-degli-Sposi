-- Branch 47: canonical partner collaboration. Additive and legacy-compatible.

create table if not exists public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'partner')),
  status text not null default 'active' check (status in ('active', 'revoked', 'left')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists event_members_event_id_idx on public.event_members(event_id);
create index if not exists event_members_user_id_idx on public.event_members(user_id);
create index if not exists event_members_event_status_idx on public.event_members(event_id, status);

create table if not exists public.event_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_email_normalized text not null check (
    invited_email_normalized = lower(btrim(invited_email_normalized))
    and invited_email_normalized <> ''
  ),
  role text not null default 'partner' check (role = 'partner'),
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz
);

create index if not exists event_invitations_event_id_idx on public.event_invitations(event_id);
create index if not exists event_invitations_event_status_idx on public.event_invitations(event_id, status);
create index if not exists event_invitations_email_status_idx on public.event_invitations(invited_email_normalized, status);

create or replace function public.create_event_owner_membership()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.event_members(event_id, user_id, role, status, accepted_at)
  values (new.id, new.owner_id, 'owner', 'active', now())
  on conflict (event_id, user_id) do update
  set role = 'owner', status = 'active', updated_at = now();
  return new;
end;
$$;
revoke all on function public.create_event_owner_membership() from public, anon, authenticated;
drop trigger if exists events_create_owner_membership on public.events;
create trigger events_create_owner_membership after insert on public.events
for each row execute function public.create_event_owner_membership();

-- Every existing event gets exactly one active canonical owner membership.
insert into public.event_members (event_id, user_id, role, status, accepted_at)
select e.id, e.owner_id, 'owner', 'active', coalesce(e.inserted_at, now())
from public.events e
join auth.users u on u.id = e.owner_id
where e.owner_id is not null
on conflict (event_id, user_id) do update
set role = 'owner', status = 'active', updated_at = now();

-- Promote a legacy spouse only when the normalized email identifies an existing
-- auth account exactly and that account is not the event owner.
insert into public.event_members (event_id, user_id, role, status, accepted_at)
select distinct e.id, u.id, 'partner', 'active', now()
from public.events e
join auth.users u on u.id <> e.owner_id
  and lower(btrim(coalesce(u.email, ''))) <> ''
  and lower(btrim(u.email)) in (
    lower(btrim(coalesce(e.bride_email, ''))),
    lower(btrim(coalesce(e.groom_email, '')))
  )
on conflict (event_id, user_id) do nothing;

create or replace function public.can_access_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.event_members m
    where m.event_id = p_event_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  ) or (
    not exists (
      select 1 from public.event_members m
      where m.event_id = p_event_id and m.user_id = (select auth.uid())
    ) and exists (
    select 1 from public.events e
    where e.id = p_event_id
      and (
        e.owner_id = (select auth.uid())
        or lower(btrim(coalesce(e.bride_email, ''))) = lower(btrim(coalesce(auth.jwt() ->> 'email', '')))
        or lower(btrim(coalesce(e.groom_email, ''))) = lower(btrim(coalesce(auth.jwt() ->> 'email', '')))
      )
    )
  );
$$;

create or replace function public.is_event_owner(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.event_members m
    where m.event_id = p_event_id
      and m.user_id = (select auth.uid())
      and m.role = 'owner'
      and m.status = 'active'
  ) or exists (
    select 1 from public.events e
    where e.id = p_event_id and e.owner_id = (select auth.uid())
  );
$$;

revoke execute on function public.can_access_event(uuid) from public, anon;
revoke execute on function public.is_event_owner(uuid) from public, anon;
grant execute on function public.can_access_event(uuid) to authenticated, service_role;
grant execute on function public.is_event_owner(uuid) to authenticated, service_role;

-- Keep destructive event operations owner-only under the canonical model.
alter policy events_delete_own on public.events using (public.is_event_owner(id));

alter table public.event_members enable row level security;
alter table public.event_invitations enable row level security;

create policy event_members_select_accessible on public.event_members
for select to authenticated using (public.can_access_event(event_id));

create policy event_members_owner_insert_partner on public.event_members
for insert to authenticated with check (
  public.is_event_owner(event_id) and role = 'partner' and user_id <> (select auth.uid())
);
create policy event_members_owner_update_partner on public.event_members
for update to authenticated using (
  public.is_event_owner(event_id) and role = 'partner'
) with check (
  public.is_event_owner(event_id) and role = 'partner'
);
create policy event_members_owner_delete_partner on public.event_members
for delete to authenticated using (
  public.is_event_owner(event_id) and role = 'partner'
);
create policy event_members_partner_leave on public.event_members
for update to authenticated using (
  user_id = (select auth.uid()) and role = 'partner' and status = 'active'
) with check (
  user_id = (select auth.uid()) and role = 'partner' and status = 'left'
);

create policy event_invitations_owner_select on public.event_invitations
for select to authenticated using (public.is_event_owner(event_id));
create policy event_invitations_owner_insert on public.event_invitations
for insert to authenticated with check (
  public.is_event_owner(event_id)
  and invited_by = (select auth.uid())
  and role = 'partner'
  and status = 'pending'
);
-- Server-only atomic acceptance. The raw token is hashed only for comparison and
-- never persisted. Row locking makes concurrent/replayed acceptance deterministic.
create or replace function public.accept_event_invitation(
  p_token text,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_invitation public.event_invitations%rowtype;
  v_email text;
begin
  if p_token is null or length(p_token) < 32 or p_user_id is null then
    raise exception 'INVITATION_INVALID';
  end if;

  select lower(btrim(coalesce(email, ''))) into v_email
  from auth.users where id = p_user_id;
  if coalesce(v_email, '') = '' then raise exception 'INVITATION_ACCOUNT_INVALID'; end if;

  select * into v_invitation
  from public.event_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
  for update;

  if not found then raise exception 'INVITATION_INVALID'; end if;
  if v_invitation.status <> 'pending' then raise exception 'INVITATION_NOT_PENDING'; end if;
  if v_invitation.expires_at <= now() then
    update public.event_invitations set status = 'expired'
    where id = v_invitation.id;
    raise exception 'INVITATION_EXPIRED';
  end if;
  if v_invitation.invited_email_normalized <> v_email then
    raise exception 'INVITATION_EMAIL_MISMATCH';
  end if;
  if not exists (select 1 from public.events where id = v_invitation.event_id) then
    raise exception 'INVITATION_EVENT_INVALID';
  end if;

  insert into public.event_members(event_id, user_id, role, status, accepted_at)
  values (v_invitation.event_id, p_user_id, 'partner', 'active', now())
  on conflict (event_id, user_id) do update
  set role = case when event_members.role = 'owner' then 'owner' else 'partner' end,
      status = 'active', accepted_at = coalesce(event_members.accepted_at, now()), updated_at = now();

  update public.event_invitations
  set status = 'accepted', accepted_at = now()
  where id = v_invitation.id and status = 'pending';

  return v_invitation.event_id;
end;
$$;

revoke all on function public.accept_event_invitation(text, uuid) from public, anon, authenticated;
grant execute on function public.accept_event_invitation(text, uuid) to service_role;

grant select, insert, update, delete on public.event_members to authenticated, service_role;
grant select, insert on public.event_invitations to authenticated;
grant select, insert, update, delete on public.event_invitations to service_role;
