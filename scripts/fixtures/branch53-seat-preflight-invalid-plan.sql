\ir branch53-seat-conflicts.sql
update public.table_assignments set seat_number=2 where guest_id='53450000-0000-4000-8000-000000000021';
select set_config('branch53.test_violation', :'violation',true);
do $$ begin
  case current_setting('branch53.test_violation')
    when 'capacity' then update public.tables set total_seats=1 where id='53450000-0000-4000-8000-000000000030';
    when 'seat-high' then update public.table_assignments set seat_number=5 where guest_id='53450000-0000-4000-8000-000000000021';
    when 'seat-negative' then update public.table_assignments set seat_number=-1 where guest_id='53450000-0000-4000-8000-000000000021';
    when 'capacity-upper' then update public.tables set total_seats=101 where id='53450000-0000-4000-8000-000000000030';
    when 'table-number' then update public.tables set table_number=0 where id='53450000-0000-4000-8000-000000000030';
    when 'guest-event' then
      insert into public.events(id,owner_id,event_type) values('53450000-0000-4000-8000-000000000011','53450000-0000-4000-8000-000000000001','wedding');
      update public.guests set event_id='53450000-0000-4000-8000-000000000011' where id='53450000-0000-4000-8000-000000000021';
    when 'notes' then update public.tables set notes=repeat('x',2001) where id='53450000-0000-4000-8000-000000000030';
    else raise exception 'Unknown fixture violation';
  end case;
end $$;
\ir ../preflight-branch53-seat-integrity.sql
rollback;
