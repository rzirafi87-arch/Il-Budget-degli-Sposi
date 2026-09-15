-- Branch 48 milestone 5: complete the owner/partner lifecycle.
-- Additive, schema-only and legacy compatible: no existing row is changed.

-- Production already contains the semantically identical migration under the
-- historical version 20260914133505.  Refuse to silently reuse any names whose
-- definitions differ, while allowing the repository version to run afterwards.
create or replace function private.assert_branch48_partner_lifecycle_compatible()
returns void language plpgsql security invoker set search_path=pg_catalog,public as $$
declare
  v record;
  v_definition text;
begin
  for v in
    select * from (values
      ('sent_at','timestamp with time zone','YES',null::text),
      ('last_sent_at','timestamp with time zone','YES',null::text),
      ('delivery_status','text','NO','''pending''::text'),
      ('delivery_error_code','text','YES',null::text),
      ('rejected_at','timestamp with time zone','YES',null::text)
    ) expected(column_name,data_type,is_nullable,column_default)
  loop
    if exists (
      select 1 from information_schema.columns c
      where c.table_schema='public' and c.table_name='event_invitations'
        and c.column_name=v.column_name
        and (c.data_type,c.is_nullable,coalesce(c.column_default,''))
          is distinct from (v.data_type,v.is_nullable,coalesce(v.column_default,''))
    ) then
      raise exception 'BRANCH48_PARTNER_DIVERGENT_COLUMN: %',v.column_name using errcode='P0001';
    end if;
  end loop;

  for v in
    select * from (values
      ('event_members_one_active_partner_idx',
       'CREATE UNIQUE INDEX event_members_one_active_partner_idx ON public.event_members USING btree (event_id) WHERE ((role = ''partner''::text) AND (status = ''active''::text))'),
      ('event_invitations_one_pending_partner_idx',
       'CREATE UNIQUE INDEX event_invitations_one_pending_partner_idx ON public.event_invitations USING btree (event_id) WHERE ((role = ''partner''::text) AND (status = ''pending''::text))')
    ) expected(index_name,index_definition)
  loop
    select indexdef into v_definition from pg_indexes
      where schemaname='public' and indexname=v.index_name;
    if found and v_definition <> v.index_definition then
      raise exception 'BRANCH48_PARTNER_DIVERGENT_INDEX: %',v.index_name using errcode='P0001';
    end if;
  end loop;

  select pg_get_constraintdef(c.oid,true) into v_definition
  from pg_constraint c
  where c.conrelid='public.event_invitations'::regclass
    and c.conname='event_invitations_status_check';
  if found and v_definition not in (
    'CHECK (status = ANY (ARRAY[''pending''::text, ''accepted''::text, ''expired''::text, ''revoked''::text]))',
    'CHECK (status = ANY (ARRAY[''pending''::text, ''accepted''::text, ''rejected''::text, ''expired''::text, ''revoked''::text])) NOT VALID'
  )
  then
    raise exception 'BRANCH48_PARTNER_DIVERGENT_CONSTRAINT: event_invitations_status_check' using errcode='P0001';
  end if;

  if not (select relrowsecurity from pg_class where oid='public.event_invitations'::regclass) then
    raise exception 'BRANCH48_PARTNER_DIVERGENT_RLS: event_invitations RLS disabled' using errcode='P0001';
  end if;
  for v in
    select * from (values
      ('event_invitations_owner_select','SELECT',array['authenticated']::name[],'is_event_owner(event_id)',null::text),
      ('event_invitations_owner_insert','INSERT',array['authenticated']::name[],null::text,
       '(is_event_owner(event_id) AND (invited_by = ( SELECT auth.uid() AS uid)) AND (role = ''partner''::text) AND (status = ''pending''::text))')
    ) expected(policy_name,command_name,policy_roles,using_expression,check_expression)
  loop
    if not exists(select 1 from pg_policies p where p.schemaname='public' and p.tablename='event_invitations'
      and p.policyname=v.policy_name and p.permissive='PERMISSIVE' and p.cmd=v.command_name
      and p.roles=v.policy_roles and p.qual is not distinct from v.using_expression
      and p.with_check is not distinct from v.check_expression)
    then raise exception 'BRANCH48_PARTNER_DIVERGENT_POLICY: %',v.policy_name using errcode='P0001'; end if;
  end loop;

  for v in
    select * from (values
      ('accept_event_invitation','p_token text, p_user_id uuid','uuid',true,'search_path=public, auth, extensions','69675f23b26a1b666c56bee6746dd8fb','05965d69a8e1aea2d42def7fc2bc760d'),
      ('reject_event_invitation','p_token text, p_user_id uuid','uuid',true,'search_path=public, auth, extensions','d3de85266a7d42a8835113e1fc65d1d0',null),
      ('rotate_event_invitation_token','p_invitation_id uuid, p_event_id uuid, p_user_id uuid, p_token_hash text, p_expires_at timestamp with time zone','text',true,'search_path=public, auth','8255323fc263ce324c703722736e3a5c',null)
    ) expected(function_name,identity_args,result_type,security_definer,configuration,body_md5,predecessor_body_md5)
  loop
    if exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=v.function_name
        and pg_get_function_identity_arguments(p.oid)=v.identity_args
        and ((pg_get_function_result(p.oid),p.prosecdef,coalesce(array_to_string(p.proconfig,','),''))
               is distinct from (v.result_type,v.security_definer,v.configuration)
          or md5(regexp_replace(btrim(p.prosrc),'\s+',' ','g'))
               not in (v.body_md5,coalesce(v.predecessor_body_md5,v.body_md5)))
    ) then
      raise exception 'BRANCH48_PARTNER_DIVERGENT_FUNCTION: %(%)',v.function_name,v.identity_args using errcode='P0001';
    end if;
    if exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=v.function_name
        and pg_get_function_identity_arguments(p.oid)=v.identity_args
        and (exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
                    where a.grantee=0 and a.privilege_type='EXECUTE')
          or has_function_privilege('anon',p.oid,'execute')
          or has_function_privilege('authenticated',p.oid,'execute')
          or not has_function_privilege('service_role',p.oid,'execute'))
    ) then
      raise exception 'BRANCH48_PARTNER_DIVERGENT_GRANTS: %(%)',v.function_name,v.identity_args using errcode='P0001';
    end if;
  end loop;
end $$;
revoke all on function private.assert_branch48_partner_lifecycle_compatible() from public,anon,authenticated;
select private.assert_branch48_partner_lifecycle_compatible();

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
revoke all on function public.accept_event_invitation(text,uuid) from public,anon,authenticated;
grant execute on function public.accept_event_invitation(text,uuid) to service_role;

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
