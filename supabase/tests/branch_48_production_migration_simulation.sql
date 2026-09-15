begin;
set local role postgres;

-- Recreate the exact pre-migration condition inside a rollback-only fixture.
drop trigger if exists subcategories_enforce_identity on public.subcategories;
drop trigger if exists subcategories_release_identity on public.subcategories;
drop table if exists private.subcategory_identity_reservations;
drop index if exists public.subcategories_category_canonical_lookup_idx;
drop index if exists public.subcategories_category_noncanonical_lookup_idx;

insert into auth.users(id,email) values('48900000-0000-4000-8000-000000000001','branch48-production-sim@example.invalid');
insert into public.events(id,owner_id,event_type) values('48900000-0000-4000-8000-000000000002','48900000-0000-4000-8000-000000000001','wedding');
insert into public.categories(id,event_id,name)
select md5('b48-category-'||g)::uuid,'48900000-0000-4000-8000-000000000002','Categoria '||g
from generate_series(1,18) g;

-- Four canonical duplicate groups and thirteen non-canonical duplicate groups.
insert into public.subcategories(id,category_id,name,is_custom,canonical_key,inserted_at)
select md5('b48-canonical-'||g||'-'||copy)::uuid,md5('b48-category-'||g)::uuid,
       'Etichetta '||g,false,' legacy.canonical.'||g||' ',clock_timestamp()+g*interval '1 second'
from generate_series(1,4) g cross join generate_series(1,2) copy;
insert into public.subcategories(id,category_id,name,is_custom,canonical_key,inserted_at)
select md5('b48-noncanonical-'||g||'-'||copy)::uuid,md5('b48-category-'||(g+4))::uuid,
       case copy when 1 then ' Voce '||g||' ' else lower('VOCE '||g) end,(g%2=0),null,
       clock_timestamp()+g*interval '1 second'+copy*interval '1 millisecond'
from generate_series(1,13) g cross join generate_series(1,2) copy;

create temporary table branch48_before as
select count(*)::bigint row_count,
       md5(string_agg(id::text||':'||category_id::text||':'||coalesce(name,'')||':'||coalesce(canonical_key,'')||':'||is_custom::text,'|' order by id)) checksum
from public.subcategories where id::text like '489%' or id in (
  select md5('b48-canonical-'||g||'-'||copy)::uuid from generate_series(1,4) g cross join generate_series(1,2) copy
  union all
  select md5('b48-noncanonical-'||g||'-'||copy)::uuid from generate_series(1,13) g cross join generate_series(1,2) copy
);

\ir ../migrations/20260915130000_branch_48_subcategory_canonical_identity.sql

do $$
declare b branch48_before%rowtype; a branch48_before%rowtype; v_id uuid;
begin
  select * into b from branch48_before;
  select count(*)::bigint,
         md5(string_agg(id::text||':'||category_id::text||':'||coalesce(name,'')||':'||coalesce(canonical_key,'')||':'||is_custom::text,'|' order by id))
    into a from public.subcategories where id in (
      select md5('b48-canonical-'||g||'-'||copy)::uuid from generate_series(1,4) g cross join generate_series(1,2) copy
      union all select md5('b48-noncanonical-'||g||'-'||copy)::uuid from generate_series(1,13) g cross join generate_series(1,2) copy
    );
  if (a.row_count,a.checksum) is distinct from (b.row_count,b.checksum) then
    raise exception 'legacy rows changed: before %/% after %/%',b.row_count,b.checksum,a.row_count,a.checksum;
  end if;
  raise notice 'BRANCH48_PRODUCTION_SIMULATION legacy_count_before=% legacy_checksum_before=% legacy_count_after=% legacy_checksum_after=%',
    b.row_count,b.checksum,a.row_count,a.checksum;

  begin insert into public.subcategories(category_id,name,canonical_key)
    values(md5('b48-category-1')::uuid,'Nuova etichetta','LEGACY.CANONICAL.1');
    raise exception 'canonical duplicate accepted';
  exception when raise_exception then if sqlerrm<>'SUBCATEGORY_IDENTITY_CONFLICT' then raise; end if; end;
  begin insert into public.subcategories(category_id,name,is_custom)
    values(md5('b48-category-5')::uuid,'voce 1',false);
    raise exception 'noncanonical duplicate accepted';
  exception when raise_exception then if sqlerrm<>'SUBCATEGORY_IDENTITY_CONFLICT' then raise; end if; end;

  insert into public.subcategories(category_id,name,canonical_key)
    values(md5('b48-category-18')::uuid,'Stesso nome','identity.one') returning id into v_id;
  insert into public.subcategories(category_id,name,canonical_key)
    values(md5('b48-category-18')::uuid,'Stesso nome','identity.two');
  insert into public.subcategories(category_id,name,canonical_key)
    values(md5('b48-category-17')::uuid,'Stesso nome','identity.one');
  update public.subcategories set notes='non-identity update' where id=v_id;
  begin update public.subcategories set canonical_key='identity.two' where id=v_id;
    raise exception 'identity-changing update accepted';
  exception when raise_exception then if sqlerrm<>'SUBCATEGORY_IDENTITY_CONFLICT' then raise; end if; end;
end $$;

-- Compatible objects are idempotent.
\ir ../migrations/20260915130000_branch_48_subcategory_canonical_identity.sql
rollback;
