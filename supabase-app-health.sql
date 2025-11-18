-- =====================================================================
-- App Health monitoring (snapshots, latest view, refresh function)
-- =====================================================================
-- This script is idempotent and can be re-run safely.

create table if not exists public.app_health_snapshots (
  id bigserial primary key,
  ts timestamptz not null default now(),
  event_type text not null,
  locale text not null,
  categories_expected int not null default 0,
  categories_actual int not null default 0,
  subcategories_expected int not null default 0,
  subcategories_actual int not null default 0,
  timeline_expected int not null default 0,
  timeline_actual int not null default 0,
  images_expected int not null default 0,
  images_actual int not null default 0,
  notes text,
  ok boolean generated always as (
    categories_actual >= categories_expected
    and subcategories_actual >= subcategories_expected
    and timeline_actual >= timeline_expected
  ) stored
);

create index if not exists idx_app_health_snapshots_ts on public.app_health_snapshots(ts desc);
create index if not exists idx_app_health_snapshots_key on public.app_health_snapshots(event_type, locale, ts desc);

create or replace view public.app_health_latest as
select distinct on (event_type, locale)
  id, ts, event_type, locale,
  categories_expected, categories_actual,
  subcategories_expected, subcategories_actual,
  timeline_expected, timeline_actual,
  images_expected, images_actual,
  notes, ok
from public.app_health_snapshots
order by event_type, locale, ts desc;

create or replace function public.app_health_refresh()
returns void
language plpgsql
as $$
declare
  v_use_app_i18n boolean := to_regclass('app_i18n.event_types') is not null;
  v_event record;
  v_loc record;
  v_event_query text;
  v_locale_query text;
  v_categories_table text;
  v_subcategories_table text;
  v_timelines_table text;
  v_cat_translations_table text;
  v_sub_translations_table text;
  v_timeline_translations_table text;
  cat_expected int;
  sub_expected int;
  time_expected int;
  cat_actual int;
  sub_actual int;
  time_actual int;
  img_actual int := 0;
  v_locale_table regclass;
  v_locale_schema text;
  v_locale_name text;
  v_has_enabled boolean;
  v_has_is_active boolean;
begin
  if v_use_app_i18n then
    v_categories_table := 'app_i18n.categories';
    v_subcategories_table := 'app_i18n.subcategories';
    v_timelines_table := 'app_i18n.event_timelines';
    v_cat_translations_table := 'app_i18n.category_translations';
    v_sub_translations_table := 'app_i18n.subcategory_translations';
    v_timeline_translations_table := 'app_i18n.event_timeline_translations';
    v_event_query := 'select id, code as event_key from app_i18n.event_types order by code';
    v_locale_table := to_regclass('app_i18n.locales');
  elsif to_regclass('public.event_types') is not null then
    v_categories_table := 'public.categories';
    v_subcategories_table := 'public.subcategories';
    v_timelines_table := 'public.event_timelines';
    v_cat_translations_table := 'public.category_translations';
    v_sub_translations_table := 'public.subcategory_translations';
    v_timeline_translations_table := 'public.event_timeline_translations';

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'event_types' and column_name = 'code'
    ) then
      v_event_query := 'select id, code as event_key from public.event_types order by code';
    elsif exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'event_types' and column_name = 'slug'
    ) then
      v_event_query := 'select id, slug as event_key from public.event_types order by slug';
    else
      v_event_query := 'select id, id::text as event_key from public.event_types order by id';
    end if;

    v_locale_table := to_regclass('public.i18n_locales');
  else
    raise notice 'app_health_refresh: no event_types table found';
    return;
  end if;

  if v_locale_table is null then
    raise notice 'app_health_refresh: no locales table found';
    return;
  end if;

  select n.nspname, c.relname
  into v_locale_schema, v_locale_name
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.oid = v_locale_table;

  if v_locale_schema is null or v_locale_name is null then
    raise notice 'app_health_refresh: unable to resolve locales table metadata';
    return;
  end if;

  v_has_enabled := exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'enabled'
  );

  v_has_is_active := exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'is_active'
  );

  v_has_active := exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'active'
  );

  if exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'code'
  ) then
    v_locale_code_column := 'code';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'locale_code'
  ) then
    v_locale_code_column := 'locale_code';
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = v_locale_schema and table_name = v_locale_name and column_name = 'locale'
  ) then
    v_locale_code_column := 'locale';
  else
    raise notice 'app_health_refresh: unable to detect locale code column for %.%', v_locale_schema, v_locale_name;
    return;
  end if;

  v_locale_query := format('select %I as locale from %I.%I', v_locale_code_column, v_locale_schema, v_locale_name);

  if v_has_enabled then
    v_locale_query := v_locale_query || ' where coalesce(enabled, true)';
  elsif v_has_is_active then
    v_locale_query := v_locale_query || ' where coalesce(is_active, true)';
  elsif v_has_active then
    v_locale_query := v_locale_query || ' where coalesce(active, true)';
  end if;

  v_locale_query := v_locale_query || format(' order by %I', v_locale_code_column);

  v_categories_schema := split_part(v_categories_table, '.', 1);
  v_categories_name := split_part(v_categories_table, '.', 2);
  if v_categories_name = '' then
    v_categories_name := v_categories_schema;
    v_categories_schema := 'public';
  end if;

  v_timelines_schema := split_part(v_timelines_table, '.', 1);
  v_timelines_name := split_part(v_timelines_table, '.', 2);
  if v_timelines_name = '' then
    v_timelines_name := v_timelines_schema;
    v_timelines_schema := 'public';
  end if;

  select column_name
  into v_category_fk_column
  from information_schema.columns
  where table_schema = v_categories_schema
    and table_name = v_categories_name
    and column_name in ('event_type_id', 'type_id', 'event_id')
  order by case column_name when 'event_type_id' then 1 when 'type_id' then 2 else 3 end
  limit 1;

  if v_category_fk_column is null then
    raise notice 'app_health_refresh: unable to detect event foreign key column for %', v_categories_table;
    return;
  end if;

  select column_name
  into v_timeline_fk_column
  from information_schema.columns
  where table_schema = v_timelines_schema
    and table_name = v_timelines_name
    and column_name in ('event_type_id', 'type_id', 'event_id')
  order by case column_name when 'event_type_id' then 1 when 'type_id' then 2 else 3 end
  limit 1;

  if v_timeline_fk_column is null then
    raise notice 'app_health_refresh: unable to detect event foreign key column for %', v_timelines_table;
    return;
  end if;

  v_has_cat_translations := to_regclass(v_cat_translations_table) is not null;
  v_has_sub_translations := to_regclass(v_sub_translations_table) is not null;
  v_has_timeline_translations := to_regclass(v_timeline_translations_table) is not null;

  for v_event in execute v_event_query loop
    execute format('select count(*) from %s where %I = $1', v_categories_table, v_category_fk_column)
      into cat_expected using v_event.id;

    execute format('select count(*) from %s s join %s c on c.id = s.category_id where c.%I = $1',
                   v_subcategories_table, v_categories_table, v_category_fk_column)
      into sub_expected using v_event.id;

    execute format('select count(*) from %s where %I = $1', v_timelines_table, v_timeline_fk_column)
      into time_expected using v_event.id;

    for v_loc in execute v_locale_query loop
      if v_has_cat_translations then
        execute format('select count(*) from %s ct join %s c on c.id = ct.category_id where c.%I = $1 and ct.locale = $2',
                       v_cat_translations_table, v_categories_table, v_category_fk_column)
          into cat_actual using v_event.id, v_loc.locale;
      else
        cat_actual := 0;
      end if;

      if v_has_sub_translations then
        execute format('select count(*) from %s st join %s s on s.id = st.subcategory_id join %s c on c.id = s.category_id where c.%I = $1 and st.locale = $2',
                       v_sub_translations_table, v_subcategories_table, v_categories_table, v_category_fk_column)
          into sub_actual using v_event.id, v_loc.locale;
      else
        sub_actual := 0;
      end if;

      if v_has_timeline_translations then
        execute format('select count(*) from %s tt join %s t on t.id = tt.timeline_id where t.%I = $1 and tt.locale = $2',
                       v_timeline_translations_table, v_timelines_table, v_timeline_fk_column)
          into time_actual using v_event.id, v_loc.locale;
      else
        time_actual := 0;
      end if;

      insert into public.app_health_snapshots(
        event_type, locale,
        categories_expected, categories_actual,
        subcategories_expected, subcategories_actual,
        timeline_expected, timeline_actual,
        images_expected, images_actual,
        notes
      ) values (
        v_event.event_key, v_loc.locale,
        coalesce(cat_expected, 0), coalesce(cat_actual, 0),
        coalesce(sub_expected, 0), coalesce(sub_actual, 0),
        coalesce(time_expected, 0), coalesce(time_actual, 0),
        img_expected, img_actual,
        null
      );
    end loop;
  end loop;
end;
$$;

grant select on public.app_health_latest to anon;
