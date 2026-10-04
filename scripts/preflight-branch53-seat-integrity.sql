-- Read-only mandatory upgrade gate before Branch 53 table migrations.
-- Export these IDs and correct seating through an authorized, reviewed plan.
select t.event_id,a.table_id,a.seat_number,
  array_agg(a.guest_id order by a.guest_id) as conflicting_guest_ids
from public.table_assignments a join public.tables t on t.id=a.table_id
where a.seat_number is not null
group by t.event_id,a.table_id,a.seat_number having count(*) > 1
order by t.event_id,a.table_id,a.seat_number;
do $$
begin
  if exists(select 1 from public.table_assignments
    where seat_number is not null group by table_id,seat_number having count(*) > 1) then
    raise exception using errcode='P0001',
      message='BRANCH53_DUPLICATE_SEATS_REMEDIATION_REQUIRED',
      hint='Stop upgrade; export conflicting IDs above, obtain a reviewed seating correction, then rerun this read-only preflight. See docs/adr/005-branch-53-p1-p2-reimplementation.md. No automatic data deletion.';
  end if;
end;
$$;
