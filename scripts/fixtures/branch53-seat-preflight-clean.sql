\ir branch53-seat-conflicts.sql
-- Only this synthetic fixture receives a reviewed, distinct-seat correction.
update public.table_assignments set seat_number=2 where guest_id='53450000-0000-4000-8000-000000000021';
\ir ../preflight-branch53-seat-integrity.sql
do $$ begin
  if (select count(*) from public.table_assignments where table_id='53450000-0000-4000-8000-000000000030') <> 2 then
    raise exception 'Seating assignments must remain intact';
  end if;
end $$;
rollback;
