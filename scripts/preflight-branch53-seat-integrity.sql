-- Read-only mandatory upgrade gate before Branch 53 table migrations.
-- Export these IDs and correct seating through an authorized, reviewed plan.
select t.event_id,a.table_id,a.seat_number,
  array_agg(a.guest_id order by a.guest_id) as conflicting_guest_ids
from public.table_assignments a join public.tables t on t.id=a.table_id
where a.seat_number is not null
group by t.event_id,a.table_id,a.seat_number having count(*) > 1
order by t.event_id,a.table_id,a.seat_number;
-- Export historical plans that the canonical save validators would reject.
select 'TABLE_RANGE' as violation,t.event_id,t.id as table_id,null::uuid as guest_id,null::integer as seat_number,
  jsonb_build_object('tableNumber',t.table_number,'totalSeats',t.total_seats) as details
from public.tables t where t.table_number not between 1 and 10000 or t.total_seats not between 1 and 100
union all
select 'TABLE_CAPACITY',t.event_id,t.id,null::uuid,null::integer,
  jsonb_build_object('assignedGuests',count(a.id),'totalSeats',t.total_seats)
from public.tables t join public.table_assignments a on a.table_id=t.id
group by t.event_id,t.id,t.total_seats having count(a.id)>t.total_seats
union all
select 'SEAT_RANGE',t.event_id,t.id,a.guest_id,a.seat_number,jsonb_build_object('totalSeats',t.total_seats)
from public.table_assignments a join public.tables t on t.id=a.table_id
where a.seat_number is not null and (a.seat_number<1 or a.seat_number>t.total_seats)
union all
select 'GUEST_EVENT',t.event_id,t.id,a.guest_id,a.seat_number,jsonb_build_object('guestEventId',g.event_id)
from public.table_assignments a join public.tables t on t.id=a.table_id join public.guests g on g.id=a.guest_id
where g.event_id<>t.event_id
union all
select 'TABLE_NOTES',t.event_id,t.id,null::uuid,null::integer,jsonb_build_object('notesLength',length(t.notes))
from public.tables t where length(t.notes)>2000;
do $$
begin
  if exists(select 1 from public.table_assignments
    where seat_number is not null group by table_id,seat_number having count(*) > 1) then
    raise exception using errcode='P0001',
      message='BRANCH53_DUPLICATE_SEATS_REMEDIATION_REQUIRED',
      hint='Stop upgrade; export conflicting IDs above, obtain a reviewed seating correction, then rerun this read-only preflight. See docs/adr/005-branch-53-p1-p2-reimplementation.md. No automatic data deletion.';
  end if;
  if exists(select 1 from public.tables where table_number not between 1 and 10000 or total_seats not between 1 and 100 or length(notes)>2000)
    or exists(select 1 from public.tables t join public.table_assignments a on a.table_id=t.id group by t.id,t.total_seats having count(a.id)>t.total_seats)
    or exists(select 1 from public.table_assignments a join public.tables t on t.id=a.table_id where a.seat_number is not null and (a.seat_number<1 or a.seat_number>t.total_seats))
    or exists(select 1 from public.table_assignments a join public.tables t on t.id=a.table_id join public.guests g on g.id=a.guest_id where g.event_id<>t.event_id) then
    raise exception using errcode='P0001',message='BRANCH53_TABLE_PLAN_REMEDIATION_REQUIRED',
      hint='Stop upgrade; export range/capacity/context violations above, obtain an owner-approved valid seating plan, then rerun the read-only preflight. No automatic truncation or assignment deletion.';
  end if;
end;
$$;
