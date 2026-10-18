-- Branch 55: truthful public supplier catalog.
--   A. one canonical category slug per supplier (alias table + resolver)
--   B. "VERIFIED" only where a real check exists
--   C. non-destructive deduplication (duplicate_of), no DELETE
--   D. country codes consistent with the region
--   E. catalog search filters/returns canonical slugs and hides duplicates
-- Additive schema; data corrections are idempotent and reported by counts.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- A. Category taxonomy -------------------------------------------------------
create table if not exists public.supplier_category_aliases (
  alias text primary key check (alias = lower(btrim(alias)) and alias <> ''),
  slug text not null check (slug ~ '^[a-z]+(-[a-z]+)*$')
);
alter table public.supplier_category_aliases enable row level security;
revoke all on public.supplier_category_aliases from public, anon, authenticated;
grant select on public.supplier_category_aliases to service_role;

insert into public.supplier_category_aliases(alias, slug) values
  -- legacy catalog values
  ('beauty & benessere','beauty'),
  ('make-up & beauty','beauty'),
  ('catering','catering'),
  ('location & catering','location'),
  ('ricevimento location','location'),
  ('sposa','bridal'),
  ('sposo','groom'),
  ('foto & video','photo-video'),
  ('fotografi','photo-video'),
  ('fiori & decor','flowers'),
  ('fiorai','flowers'),
  ('fiori','flowers'),
  ('gioiellerie','jewelry'),
  ('inviti & stationery','stationery'),
  ('trasporti','transport'),
  ('musica & intrattenimento','music'),
  ('musica ricevimento','music'),
  ('viaggio di nozze','honeymoon'),
  ('bomboniere & regali','favors'),
  -- community submission types
  ('photographer','photo-video'),
  ('videomaker','photo-video'),
  ('florist','flowers'),
  ('wedding_planner','wedding-planner'),
  ('makeup_artist','beauty'),
  ('hair_stylist','beauty'),
  ('music','music'),
  ('dj','music'),
  ('entertainment','music'),
  ('transport','transport'),
  ('atelier','bridal'),
  ('favors','favors'),
  ('bakery','catering'),
  ('rental','other'),
  ('lighting','other'),
  ('other','other')
on conflict (alias) do update set slug = excluded.slug;

-- Resolves an alias or an already-canonical slug; unknown values pass through
-- lower-cased so they stay visible in reports instead of disappearing.
create or replace function public.supplier_category_slug(p_value text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when p_value is null or btrim(p_value) = '' then null
    else coalesce(
      (select a.slug from public.supplier_category_aliases a where a.alias = lower(btrim(p_value))),
      lower(btrim(p_value)))
  end
$$;
revoke all on function public.supplier_category_slug(text) from public, anon, authenticated;
grant execute on function public.supplier_category_slug(text) to service_role;

-- C. Non-destructive deduplication --------------------------------------------
alter table public.suppliers add column if not exists duplicate_of uuid
  references public.suppliers(id) on delete set null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'suppliers_duplicate_of_not_self') then
    alter table public.suppliers add constraint suppliers_duplicate_of_not_self
      check (duplicate_of is null or duplicate_of <> id);
  end if;
end $$;
create index if not exists suppliers_duplicate_of_idx on public.suppliers(duplicate_of) where duplicate_of is not null;

-- Certain duplicate: same normalized name + city + canonical category, and no
-- conflicting phone / website / email with the canonical (oldest) record.
-- Anything with a contact conflict is left visible for human review.
with candidates as (
  select s.id, s.phone, s.website, s.email,
    first_value(s.id) over w canonical_id
  from public.suppliers s
  where s.duplicate_of is null
  window w as (
    partition by lower(coalesce(s.normalized_name, s.name)), lower(coalesce(s.city, '')),
      public.supplier_category_slug(s.category)
    order by s.inserted_at nulls last, s.id
  )
)
update public.suppliers target
set duplicate_of = c.canonical_id, updated_at = now()
from candidates c
join public.suppliers canonical on canonical.id = c.canonical_id
where target.id = c.id
  and c.id <> c.canonical_id
  and (nullif(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), '') is null
    or nullif(regexp_replace(coalesce(canonical.phone, ''), '\D', '', 'g'), '') is null
    or regexp_replace(c.phone, '\D', '', 'g') = regexp_replace(canonical.phone, '\D', '', 'g'))
  and (nullif(btrim(c.website), '') is null or nullif(btrim(canonical.website), '') is null
    or lower(regexp_replace(c.website, '^https?://(www\.)?|/+$', '', 'g'))
     = lower(regexp_replace(canonical.website, '^https?://(www\.)?|/+$', '', 'g')))
  and (nullif(btrim(c.email), '') is null or nullif(btrim(canonical.email), '') is null
    or lower(btrim(c.email)) = lower(btrim(canonical.email)));

-- B. Truthful verification ----------------------------------------------------
-- Imported or legacy records were never checked: they are TO_CHECK until a
-- verification (claimed profile, business check) records last_verified_at.
update public.suppliers set verification_status = 'TO_CHECK', updated_at = now()
where verification_status = 'VERIFIED' and user_id is null and last_verified_at is null
  and coalesce(source, 'legacy') in ('legacy', 'google', 'openstreetmap', 'wikidata');
update public.locations set verification_status = 'TO_CHECK', updated_at = now()
where verification_status = 'VERIFIED' and user_id is null and last_verified_at is null
  and coalesce(source, 'legacy') in ('legacy', 'google', 'openstreetmap', 'wikidata');
update public.churches set verification_status = 'TO_CHECK', updated_at = now()
where verification_status = 'VERIFIED' and user_id is null and last_verified_at is null
  and coalesce(source, 'legacy') in ('legacy', 'google', 'openstreetmap', 'wikidata');

-- D. Country consistent with region (Mexican test rows tagged as Italy) ------
update public.suppliers set country_code = 'mx', updated_at = now()
where country_code = 'it' and region in ('CDMX', 'Ciudad de México', 'Jalisco', 'Yucatán');

-- E. Catalog search: canonical supplier slugs, duplicates hidden -------------
create or replace function public.search_global_catalog(
  p_entity_type text,
  p_query text default null,
  p_category text default null,
  p_city text default null,
  p_province text default null,
  p_region text default null,
  p_country text default null,
  p_verification_status text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_radius_km double precision default null,
  p_sort text default 'RELEVANCE',
  p_offset integer default 0,
  p_limit integer default 12
)
returns table (
  id uuid,
  entity_type text,
  name text,
  category text,
  city text,
  province text,
  region text,
  country text,
  latitude numeric,
  longitude numeric,
  distance_km double precision,
  verification_status text,
  confidence_score smallint,
  relevance_score double precision,
  details jsonb,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with catalog as (
    select c.id, 'church'::text entity_type, c.name, c.place_type category,
      c.city, c.province, c.region, c.country_code country, c.latitude, c.longitude,
      c.verification_status, c.confidence_score, c.normalized_name,
      jsonb_build_object('denomination',c.denomination,'religion',c.religion,'subtype',c.subtype,'address_line',c.address_line,'postal_code',c.postal_code,'phone',c.phone,'email',c.email,'website',c.website,'wedding_ceremony_available',c.wedding_ceremony_available,'capacity',c.capacity,'accessibility',c.accessibility,'parking',c.parking,'last_verified_at',c.last_verified_at) details,
      public.normalize_catalog_text(concat_ws(' ', c.name, c.city, c.province, c.region, c.country_code, c.place_type)) search_text
    from public.churches c where p_entity_type = 'church'
    union all
    select l.id, 'location', l.name, l.venue_type, l.city, l.province, l.region,
      l.country_code, l.latitude, l.longitude, l.verification_status,
      l.confidence_score, l.normalized_name,
      jsonb_build_object('subtype',l.subtype,'address_line',l.address_line,'postal_code',l.postal_code,'phone',l.phone,'email',l.email,'website',l.website,'instagram_url',l.instagram_url,'facebook_url',l.facebook_url,'accommodation_available',l.accommodation_available,'catering_internal',l.catering_internal,'catering_external_allowed',l.catering_external_allowed,'parking',l.parking,'accessibility',l.accessibility,'outdoor_space',l.outdoor_space,'indoor_space',l.indoor_space,'capacity_min',l.capacity_min,'capacity_max',l.capacity_max,'last_verified_at',l.last_verified_at),
      public.normalize_catalog_text(concat_ws(' ', l.name, l.city, l.province, l.region, l.country_code, l.venue_type))
    from public.locations l where p_entity_type = 'location'
    union all
    select s.id, 'supplier', s.name, public.supplier_category_slug(s.category), s.city,
      s.province, s.region, s.country_code, s.latitude, s.longitude,
      s.verification_status, s.confidence_score, s.normalized_name,
      jsonb_build_object('subcategory',s.subcategory,'address_line',s.address_line,'postal_code',s.postal_code,'phone',s.phone,'email',s.email,'website',s.website,'instagram_url',s.instagram_url,'facebook_url',s.facebook_url,'service_area',s.service_area,'regions_served',s.regions_served,'travel_available',s.travel_available,'starting_price',s.starting_price,'price_range_min',s.price_range_min,'price_range_max',s.price_range_max,'currency',s.currency,'last_verified_at',s.last_verified_at),
      public.normalize_catalog_text(concat_ws(' ', s.name, s.legal_name, s.city, s.province, s.region, s.country_code, s.category, s.subcategory))
    from public.suppliers s where p_entity_type = 'supplier' and s.duplicate_of is null
  ), scored as (
    select c.*,
      case when p_latitude is not null and p_longitude is not null and c.latitude is not null and c.longitude is not null
        then 6371 * 2 * asin(sqrt(least(1, greatest(0,
          power(sin(radians((c.latitude::double precision - p_latitude) / 2)), 2) +
          cos(radians(p_latitude)) * cos(radians(c.latitude::double precision)) *
          power(sin(radians((c.longitude::double precision - p_longitude) / 2)), 2)
        )))) else null end distance_km,
      case
        when nullif(public.normalize_catalog_text(p_query), '') is null then 0
        when c.normalized_name = public.normalize_catalog_text(p_query) then 100
        when c.normalized_name like public.normalize_catalog_text(p_query) || '%' then 80
        when c.normalized_name like '%' || public.normalize_catalog_text(p_query) || '%' then 60
        when c.search_text like '%' || public.normalize_catalog_text(p_query) || '%' then 40
        else 0
      end::double precision relevance_score
    from catalog c
    where (nullif(public.normalize_catalog_text(p_query), '') is null or c.search_text like '%' || public.normalize_catalog_text(p_query) || '%')
      and (p_category is null or case
        when c.entity_type = 'supplier' then c.category = public.supplier_category_slug(p_category)
        else lower(c.category) = lower(p_category) end)
      and (p_city is null or lower(c.city) = lower(p_city))
      and (p_province is null or lower(c.province) = lower(p_province))
      and (p_region is null or lower(c.region) = lower(p_region))
      and (p_country is null or lower(c.country) = lower(p_country))
      and (p_verification_status is null or c.verification_status = p_verification_status)
  ), filtered as (
    select * from scored
    where p_radius_km is null or (distance_km is not null and distance_km <= p_radius_km)
  )
  select f.id, f.entity_type, f.name, f.category, f.city, f.province, f.region,
    f.country, f.latitude, f.longitude, round(f.distance_km::numeric, 2)::double precision,
    f.verification_status, f.confidence_score, f.relevance_score, f.details, count(*) over()
  from filtered f
  order by
    case when p_sort = 'NEAREST' then f.distance_km end asc nulls last,
    case when p_sort = 'NAME_ASC' then lower(f.name) end asc,
    case when p_sort = 'RELEVANCE' then f.relevance_score end desc,
    case when p_sort in ('RELEVANCE','VERIFIED_FIRST') then
      case f.verification_status when 'VERIFIED' then 3 when 'PROBABLE' then 2 else 1 end
    end desc,
    f.confidence_score desc, lower(f.name) asc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 24)
$$;

revoke all on function public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer) from public, anon, authenticated;
grant execute on function public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer) to service_role;

comment on function public.search_global_catalog is 'Branch 55: shared catalog search; supplier categories are canonical slugs and duplicates (duplicate_of) are hidden.';
comment on column public.suppliers.duplicate_of is 'Branch 55: canonical record this row duplicates. Hidden from public search; never deleted.';

commit;
