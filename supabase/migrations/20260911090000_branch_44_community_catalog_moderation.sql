-- Branch 44: authenticated community catalog submissions and atomic moderation.
alter table public.catalog_review_queue
  add column if not exists submitted_by uuid references auth.users(id) on delete set null,
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists moderation_note text,
  add column if not exists user_message text,
  add column if not exists canonical_record_id uuid;

alter table public.catalog_review_queue drop constraint if exists catalog_review_queue_status_check;
alter table public.catalog_review_queue add constraint catalog_review_queue_status_check
  check (status in ('PENDING','APPROVED','REJECTED','NEEDS_CHANGES','DISMISSED'));
alter table public.catalog_review_queue drop constraint if exists catalog_review_queue_reviewed_check;
alter table public.catalog_review_queue add constraint catalog_review_queue_reviewed_check check (
  (status = 'PENDING' and reviewed_at is null and reviewed_by is null)
  or (status <> 'PENDING' and reviewed_at is not null and reviewed_by is not null)
);
alter table public.catalog_review_queue add constraint catalog_review_queue_community_owner_check
  check (source <> 'user_submission' or submitted_by is not null);
alter table public.catalog_review_queue add constraint catalog_review_queue_approved_link_check
  check (status <> 'APPROVED' or canonical_record_id is not null);
alter table public.catalog_review_queue add constraint catalog_review_queue_notes_size_check
  check (length(coalesce(moderation_note,'')) <= 2000 and length(coalesce(user_message,'')) <= 1000);

create index if not exists idx_catalog_review_queue_submitter on public.catalog_review_queue(submitted_by, created_at desc);
create index if not exists idx_catalog_review_queue_community_status on public.catalog_review_queue(source, status, created_at desc);

create or replace function public.is_catalog_admin()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'), false)
$$;
revoke all on function public.is_catalog_admin() from public, anon;
grant execute on function public.is_catalog_admin() to authenticated, service_role;

drop policy if exists catalog_review_queue_own_select on public.catalog_review_queue;
drop policy if exists catalog_review_queue_own_insert on public.catalog_review_queue;
drop policy if exists catalog_review_queue_own_update on public.catalog_review_queue;
drop policy if exists catalog_review_queue_admin_select on public.catalog_review_queue;
create policy catalog_review_queue_own_select on public.catalog_review_queue for select to authenticated
  using (source='user_submission' and submitted_by=(select auth.uid()));
create policy catalog_review_queue_own_insert on public.catalog_review_queue for insert to authenticated
  with check (source='user_submission' and submitted_by=(select auth.uid()) and status='PENDING'
    and reviewed_by is null and reviewed_at is null and canonical_record_id is null);
create policy catalog_review_queue_own_update on public.catalog_review_queue for update to authenticated
  using (source='user_submission' and submitted_by=(select auth.uid()) and status in ('PENDING','NEEDS_CHANGES'))
  with check (source='user_submission' and submitted_by=(select auth.uid()) and status='PENDING'
    and reviewed_by is null and reviewed_at is null and canonical_record_id is null);
create policy catalog_review_queue_admin_select on public.catalog_review_queue for select to authenticated
  using ((select public.is_catalog_admin()));
grant select, insert, update on public.catalog_review_queue to authenticated;

create or replace function public.moderate_catalog_submission(
  p_submission_id uuid, p_action text, p_payload jsonb default null, p_canonical_record_id uuid default null,
  p_moderation_note text default null, p_user_message text default null, p_reviewer_id uuid default null
) returns uuid language plpgsql security definer set search_path=public,auth,extensions,pg_temp as $$
declare q public.catalog_review_queue%rowtype; d jsonb; canonical_id uuid; reviewer uuid := coalesce(auth.uid(),p_reviewer_id);
begin
  if reviewer is null or not (auth.role()='service_role' or public.is_catalog_admin()) then raise exception 'FORBIDDEN'; end if;
  select * into q from public.catalog_review_queue where id=p_submission_id and source='user_submission' FOR UPDATE;
  if not found then raise exception 'SUBMISSION_NOT_FOUND'; end if;
  if q.status not in ('PENDING','NEEDS_CHANGES') then raise exception 'INVALID_STATE'; end if;
  if p_action='REJECT' then
    update public.catalog_review_queue set status='REJECTED', reviewed_by=reviewer, reviewed_at=now(), updated_at=now(), moderation_note=p_moderation_note, user_message=p_user_message where id=q.id;
    return null;
  elsif p_action='NEEDS_CHANGES' then
    update public.catalog_review_queue set status='NEEDS_CHANGES', reviewed_by=reviewer, reviewed_at=now(), updated_at=now(), moderation_note=p_moderation_note, user_message=p_user_message where id=q.id;
    return null;
  elsif p_action not in ('APPROVE','MERGE') then raise exception 'INVALID_ACTION'; end if;
  d := coalesce(p_payload,q.payload);
  if p_action='MERGE' then
    canonical_id := p_canonical_record_id;
    if canonical_id is null then raise exception 'CANONICAL_REQUIRED'; end if;
    if (q.entity_type='church' and not exists(select 1 from public.churches where id=canonical_id))
      or (q.entity_type='location' and not exists(select 1 from public.locations where id=canonical_id))
      or (q.entity_type='supplier' and not exists(select 1 from public.suppliers where id=canonical_id)) then raise exception 'CANONICAL_NOT_FOUND'; end if;
  elsif q.entity_type='church' then
    insert into public.churches(name,place_type,city,province,region,country_code,address_line,postal_code,website,phone,email,description,source,verification_status,confidence_score)
    values(d->>'name',d->>'type',d->>'city',coalesce(d->>'province',''),coalesce(d->>'region',''),lower(d->>'country'),nullif(d->>'address',''),nullif(d->>'postal_code',''),nullif(d->>'website',''),nullif(d->>'phone',''),nullif(d->>'email',''),nullif(d->>'description',''),'user_submission','TO_CHECK',20) returning id into canonical_id;
  elsif q.entity_type='location' then
    insert into public.locations(name,venue_type,city,province,region,country_code,address_line,postal_code,website,phone,email,description,source,verification_status,confidence_score)
    values(d->>'name',d->>'type',d->>'city',d->>'province',d->>'region',lower(d->>'country'),nullif(d->>'address',''),nullif(d->>'postal_code',''),nullif(d->>'website',''),nullif(d->>'phone',''),nullif(d->>'email',''),nullif(d->>'description',''),'user_submission','TO_CHECK',20) returning id into canonical_id;
  else
    insert into public.suppliers(name,category,subcategory,city,province,region,country_code,address_line,postal_code,website,phone,email,description,source,verification_status,confidence_score)
    values(d->>'name',case when d->>'type'='other' then 'other' else d->>'type' end,nullif(d->>'custom_type',''),d->>'city',d->>'province',d->>'region',lower(d->>'country'),nullif(d->>'address',''),nullif(d->>'postal_code',''),nullif(d->>'website',''),nullif(d->>'phone',''),nullif(d->>'email',''),nullif(d->>'description',''),'user_submission','TO_CHECK',20) returning id into canonical_id;
  end if;
  insert into public.catalog_provenance(entity_type,entity_id,source_type,source_name,external_id,raw_fingerprint,metadata)
  values(q.entity_type,canonical_id,'user_submission','Community contribution',q.id::text,q.incoming_fingerprint,jsonb_build_object('submission_id',q.id))
  on conflict(entity_type,source_type,source_name,external_id) do update set entity_id=excluded.entity_id,last_seen_at=now();
  update public.catalog_review_queue set payload=d,status='APPROVED',candidate_entity_id=canonical_id,canonical_record_id=canonical_id,reviewed_by=reviewer,reviewed_at=now(),updated_at=now(),moderation_note=p_moderation_note,user_message=p_user_message where id=q.id;
  return canonical_id;
end $$;
revoke all on function public.moderate_catalog_submission(uuid,text,jsonb,uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.moderate_catalog_submission(uuid,text,jsonb,uuid,text,text,uuid) to service_role;
