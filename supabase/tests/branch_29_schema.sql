\set ON_ERROR_STOP on

begin;

-- Capability columns must exist after the Branch 29 migration.
do $$
declare
  missing_count integer;
begin
  select count(*) into missing_count
  from (values
    ('availability_status'),
    ('enabled_modules'),
    ('ceremony_mode'),
    ('budget_template'),
    ('timeline_template'),
    ('supplier_categories'),
    ('location_roles'),
    ('guest_module'),
    ('document_module'),
    ('church_module')
  ) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'event_types'
      and c.column_name = required.column_name
  );

  if missing_count <> 0 then
    raise exception 'Branch 29 event_types capability columns are incomplete: % missing', missing_count;
  end if;
end $$;

-- Wedding is the only READY type in this branch.
do $$
declare
  ready_count integer;
  wedding_ready_count integer;
  unsafe_non_wedding_count integer;
begin
  select count(*) into ready_count
  from public.event_types
  where availability_status = 'READY';

  select count(*) into wedding_ready_count
  from public.event_types
  where code = 'WEDDING'
    and availability_status = 'READY'
    and church_module
    and guest_module
    and document_module
    and ceremony_mode = 'religious_or_civil'
    and 'churches' = any(enabled_modules)
    and 'location-ceremony' = any(enabled_modules)
    and 'budget' = any(enabled_modules)
    and 'timeline' = any(enabled_modules);

  select count(*) into unsafe_non_wedding_count
  from public.event_types
  where code <> 'WEDDING'
    and (
      availability_status <> 'COMING_SOON'
      or cardinality(enabled_modules) <> 0
      or church_module
      or guest_module
      or document_module
      or budget_template is not null
      or timeline_template is not null
    );

  if ready_count <> 1 or wedding_ready_count <> 1 then
    raise exception 'Branch 29 must expose exactly one READY type and it must be WEDDING';
  end if;

  if unsafe_non_wedding_count <> 0 then
    raise exception 'A non-wedding event type is incorrectly exposed as configured/ready';
  end if;
end $$;

-- The catalog should contain every type surfaced by the application matrix.
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
