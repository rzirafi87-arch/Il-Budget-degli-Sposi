-- Branch 48 milestone 5: complete the owner/partner lifecycle.
-- Additive, schema-only and legacy compatible: no existing row is changed.

alter table public.event_invitations
  drop constraint if exists event_invitations_status_check;
alter table public.event_invitations
  add constraint event_invitations_status_check
  check (status in ('pending', 'accepted', 'rejected', 'expired', 'revoked')) not valid;

alter table public.event_invitations
  add column if not exists sent_at timestamptz,
  add column if not exists last_sent_at timestamptz,
  add column if not exists delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'sent', 'failed')),
  add column if not exists delivery_error_code text,
  add column if not exists rejected_at timestamptz;

create unique index if not exists event_members_one_active_partner_idx
  on public.event_members(event_id) where role = 'partner' and status = 'active';
create unique index if not exists event_invitations_one_pending_partner_idx
  on public.event_invitations(event_id) where role = 'partner' and status = 'pending';

create or replace function public.accept_event_invitation(p_token text, p_user_id uuid)
returns uuid language plpgsql security definer set search_path = public, auth, extensions as $$
declare v public.event_invitations%rowtype; v_email text;
begin
  if p_token is null or length(p_token) < 32 or p_user_id is null then raise exception 'INVITATION_INVALID'; end if;
  select lower(btrim(coalesce(email, ''))) into v_email from auth.users where id=p_user_id;
  if coalesce(v_email,'')='' then raise exception 'INVITATION_ACCOUNT_INVALID'; end if;
  select * into v from public.event_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') for update;
  if not found then raise exception 'INVITATION_INVALID'; end if;
  if v.status <> 'pending' then raise exception 'INVITATION_NOT_PENDING'; end if;
  if v.expires_at <= now() then
    update public.event_invitations set status='expired' where id=v.id;
    raise exception 'INVITATION_EXPIRED';
  end if;
  if v.invited_email_normalized <> v_email then raise exception 'INVITATION_EMAIL_MISMATCH'; end if;
  if not exists(select 1 from public.events e join auth.users u on u.id=e.owner_id where e.id=v.event_id)
    then raise exception 'INVITATION_EVENT_INVALID'; end if;
  if exists(select 1 from public.event_members m where m.event_id=v.event_id and m.role='partner' and m.status='active' and m.user_id<>p_user_id)
    then raise exception 'PARTNER_ALREADY_ACTIVE'; end if;
  insert into public.event_members(event_id,user_id,role,status,accepted_at)
    values(v.event_id,p_user_id,'partner','active',now())
    on conflict(event_id,user_id) do update set
      role=case when event_members.role='owner' then 'owner' else 'partner' end,
      status='active', accepted_at=now(), updated_at=now();
  update public.event_invitations set status='accepted',accepted_at=now()
    where id=v.id and status='pending';
  if not found then raise exception 'INVITATION_NOT_PENDING'; end if;
  return v.event_id;
exception when unique_violation then raise exception 'PARTNER_ALREADY_ACTIVE';
end; $$;

create or replace function public.reject_event_invitation(p_token text, p_user_id uuid)
returns uuid language plpgsql security definer set search_path = public, auth, extensions as $$
declare v public.event_invitations%rowtype; v_email text;
begin
  if p_token is null or length(p_token)<32 or p_user_id is null then raise exception 'INVITATION_INVALID'; end if;
  select lower(btrim(coalesce(email,''))) into v_email from auth.users where id=p_user_id;
  select * into v from public.event_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') for update;
  if not found then raise exception 'INVITATION_INVALID'; end if;
  if v.status<>'pending' then raise exception 'INVITATION_NOT_PENDING'; end if;
  if v.expires_at<=now() then update public.event_invitations set status='expired' where id=v.id; raise exception 'INVITATION_EXPIRED'; end if;
  if v.invited_email_normalized<>v_email then raise exception 'INVITATION_EMAIL_MISMATCH'; end if;
  update public.event_invitations set status='rejected',rejected_at=now() where id=v.id and status='pending';
  return v.event_id;
end; $$;

revoke all on function public.reject_event_invitation(text,uuid) from public,anon,authenticated;
grant execute on function public.reject_event_invitation(text,uuid) to service_role;

create or replace function public.rotate_event_invitation_token(
  p_invitation_id uuid, p_event_id uuid, p_user_id uuid, p_token_hash text, p_expires_at timestamptz
) returns text language plpgsql security definer set search_path=public,auth as $$
declare v public.event_invitations%rowtype;
begin
  if not exists(select 1 from public.events e where e.id=p_event_id and e.owner_id=p_user_id) then raise exception 'OWNER_REQUIRED'; end if;
  select * into v from public.event_invitations where id=p_invitation_id and event_id=p_event_id for update;
  if not found or v.status<>'pending' then raise exception 'INVITATION_NOT_PENDING'; end if;
  if v.last_sent_at is not null and v.last_sent_at > now()-interval '60 seconds' then raise exception 'INVITATION_RESEND_COOLDOWN'; end if;
  update public.event_invitations set token_hash=p_token_hash,expires_at=p_expires_at,delivery_status='pending',delivery_error_code=null
  where id=v.id;
  return v.invited_email_normalized;
end; $$;
revoke all on function public.rotate_event_invitation_token(uuid,uuid,uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.rotate_event_invitation_token(uuid,uuid,uuid,text,timestamptz) to service_role;
