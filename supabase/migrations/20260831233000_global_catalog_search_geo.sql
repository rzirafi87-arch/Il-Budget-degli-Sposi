-- Branch 32: shared, read-only catalog search with optional geographic distance.
-- Deliberately uses numeric latitude/longitude and Haversine: production currently
-- has no populated coordinates, so PostGIS/pg_trgm/unaccent would add no benefit.

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
    select s.id, 'supplier', s.name, coalesce(s.subcategory, s.category), s.city,
      s.province, s.region, s.country_code, s.latitude, s.longitude,
      s.verification_status, s.confidence_score, s.normalized_name,
      jsonb_build_object('subcategory',s.subcategory,'address_line',s.address_line,'postal_code',s.postal_code,'phone',s.phone,'email',s.email,'website',s.website,'instagram_url',s.instagram_url,'facebook_url',s.facebook_url,'service_area',s.service_area,'regions_served',s.regions_served,'travel_available',s.travel_available,'starting_price',s.starting_price,'price_range_min',s.price_range_min,'price_range_max',s.price_range_max,'currency',s.currency,'last_verified_at',s.last_verified_at),
      public.normalize_catalog_text(concat_ws(' ', s.name, s.legal_name, s.city, s.province, s.region, s.country_code, s.category, s.subcategory))
    from public.suppliers s where p_entity_type = 'supplier'
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
      and (p_category is null or lower(c.category) = lower(p_category))
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

comment on function public.search_global_catalog is 'Branch 32 read-only shared catalog search. Search relevance is independent from Branch 31 identity matching.';
