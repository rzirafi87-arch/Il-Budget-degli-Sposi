\set ON_ERROR_STOP on

begin;

-- The DB catalog contains every type surfaced by the typed application matrix.
-- Product READY/COMING_SOON state intentionally remains in application code so
-- there is only one mutable source of capability truth.
do $$
declare
  catalog_count integer;
begin
  select count(*) into catalog_count
  from public.event_types
  where code in (
    'WEDDING','BAPTISM','EIGHTEENTH','GRADUATION','CONFIRMATION','COMMUNION',
    'ANNIVERSARY','BIRTHDAY','FIFTY','GENDER_REVEAL','RETIREMENT','BABY_SHOWER',
    'ENGAGEMENT_PARTY','PROPOSAL','CORPORATE','BAR_MITZVAH','QUINCEANERA','CHARITY_GALA'
  );

  if catalog_count <> 18 then
    raise exception 'Expected 18 registered event types, found %', catalog_count;
  end if;

  if not exists (select 1 from public.event_types where code = 'WEDDING' and name = 'Matrimonio') then
    raise exception 'WEDDING catalog entry is missing or changed unexpectedly';
  end if;
end $$;

-- Branch 29 must not populate unsupported taxonomies merely to mark an event
-- type as available. On the canonical rebuild baseline these template tables
-- remain empty until dedicated future branches provide validated datasets.
do $$
declare
  category_templates integer;
  timeline_templates integer;
begin
  select count(*) into category_templates from public.event_type_categories;
  select count(*) into timeline_templates from public.event_timelines;

  if category_templates <> 0 then
    raise exception 'Branch 29 unexpectedly invented event_type_categories (% rows)', category_templates;
  end if;
  if timeline_templates <> 0 then
    raise exception 'Branch 29 unexpectedly invented event_timelines (% rows)', timeline_templates;
  end if;
end $$;

-- Location roles are extended non-destructively; legacy `party` remains valid.
do $$
declare
  role_constraint text;
begin
  select pg_get_constraintdef(oid)
  into role_constraint
  from pg_constraint
  where conrelid = 'public.saved_locations'::regclass
    and conname = 'saved_locations_location_role_check';

  if role_constraint is null
     or position('main_event' in role_constraint) = 0
     or position('after_party' in role_constraint) = 0
     or position('party' in role_constraint) = 0
     or position('ceremony' in role_constraint) = 0
     or position('reception' in role_constraint) = 0 then
    raise exception 'saved_locations.location_role constraint does not contain the required Branch 29 roles';
  end if;
end $$;

rollback;
