-- Branch 53 / Milestone 3: transactional table plans on the existing
-- guests, tables and table_assignments schema. No duplicate tables are added.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tables_positive_number_check' and conrelid = 'public.tables'::regclass) then
    alter table public.tables add constraint tables_positive_number_check check (table_number > 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tables_capacity_check' and conrelid = 'public.tables'::regclass) then
    alter table public.tables add constraint tables_capacity_check check (total_seats between 1 and 100) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'table_assignments_positive_seat_check' and conrelid = 'public.table_assignments'::regclass) then
    alter table public.table_assignments add constraint table_assignments_positive_seat_check check (seat_number is null or seat_number > 0) not valid;
  end if;
end $$;

create or replace function public.validate_table_assignment_event_capacity()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_table_event uuid;
  v_guest_event uuid;
  v_total_seats integer;
  v_assigned integer;
begin
  select t.event_id, t.total_seats into v_table_event, v_total_seats
  from public.tables t where t.id = new.table_id;
  select g.event_id into v_guest_event
  from public.guests g where g.id = new.guest_id;

  if v_table_event is null or v_guest_event is null then
    raise exception using errcode = '23503', message = 'TABLE_OR_GUEST_NOT_FOUND';
  end if;
  if v_table_event <> v_guest_event then
    raise exception using errcode = '23514', message = 'TABLE_GUEST_EVENT_MISMATCH';
  end if;
  if new.seat_number is not null and new.seat_number > v_total_seats then
    raise exception using errcode = '23514', message = 'TABLE_SEAT_OUT_OF_RANGE';
  end if;
  if new.seat_number is not null and exists (
    select 1 from public.table_assignments a
    where a.table_id = new.table_id
      and a.seat_number = new.seat_number
      and a.id <> new.id
  ) then
    raise exception using errcode = '23514', message = 'TABLE_SEAT_DUPLICATE';
  end if;

  select count(*)::integer into v_assigned
  from public.table_assignments a
  where a.table_id = new.table_id and a.id <> new.id;
  if v_assigned >= v_total_seats then
    raise exception using errcode = '23514', message = 'TABLE_CAPACITY_EXCEEDED';
  end if;
  return new;
end;
$$;

drop trigger if exists table_assignments_validate_event_capacity on public.table_assignments;
create trigger table_assignments_validate_event_capacity
before insert or update of table_id, guest_id, seat_number on public.table_assignments
for each row execute function public.validate_table_assignment_event_capacity();

create or replace function public.prevent_table_capacity_underflow()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_assigned integer;
begin
  select count(*)::integer into v_assigned
  from public.table_assignments a where a.table_id = new.id;
  if new.total_seats < v_assigned then
    raise exception using errcode = '23514', message = 'TABLE_CAPACITY_BELOW_ASSIGNMENTS';
  end if;
  return new;
end;
$$;

drop trigger if exists tables_prevent_capacity_underflow on public.tables;
create trigger tables_prevent_capacity_underflow
before update of total_seats on public.tables
for each row execute function public.prevent_table_capacity_underflow();

create or replace function public.save_event_table_plan(
  p_event_id uuid,
  p_actor_id uuid,
  p_tables jsonb,
  p_replace boolean default true
)
returns jsonb
language plpgsql
set search_path = public, auth, pg_catalog
as $$
declare
  v_table jsonb;
  v_assignment jsonb;
  v_table_id uuid;
  v_guest_id uuid;
  v_seen_ids uuid[] := array[]::uuid[];
  v_count integer := 0;
begin
  if not exists (
    select 1 from public.event_members m
    where m.event_id = p_event_id and m.user_id = p_actor_id and m.status = 'active'
  ) and not exists (
    select 1 from public.events e where e.id = p_event_id and e.owner_id = p_actor_id
  ) then
    raise exception using errcode = '42501', message = 'EVENT_ACCESS_DENIED';
  end if;

  perform 1 from public.events e where e.id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_NOT_FOUND';
  end if;
  if jsonb_typeof(p_tables) <> 'array' or jsonb_array_length(p_tables) > 200 then
    raise exception using errcode = '22023', message = 'TABLE_PLAN_INVALID';
  end if;

  for v_table in select value from jsonb_array_elements(p_tables)
  loop
    if jsonb_typeof(v_table) <> 'object' then
      raise exception using errcode = '22023', message = 'TABLE_INVALID';
    end if;
    v_table_id := case
      when nullif(v_table ->> 'id', '') is null then gen_random_uuid()
      else (v_table ->> 'id')::uuid
    end;

    if exists (select 1 from public.tables t where t.id = v_table_id and t.event_id <> p_event_id) then
      raise exception using errcode = '42501', message = 'TABLE_EVENT_MISMATCH';
    end if;

    -- Assignment replacement happens inside this function's transaction. If
    -- any later validation fails, PostgreSQL restores the previous plan.
    delete from public.table_assignments where table_id = v_table_id;

    if exists (select 1 from public.tables t where t.id = v_table_id and t.event_id = p_event_id) then
      update public.tables
      set table_number = (v_table ->> 'tableNumber')::integer,
          table_name = nullif(btrim(v_table ->> 'tableName'), ''),
          table_type = coalesce(nullif(btrim(v_table ->> 'tableType'), ''), 'round'),
          total_seats = (v_table ->> 'totalSeats')::integer,
          notes = nullif(v_table ->> 'notes', '')
      where id = v_table_id and event_id = p_event_id;
    else
      insert into public.tables(id,event_id,table_number,table_name,table_type,total_seats,notes)
      values(
        v_table_id,
        p_event_id,
        (v_table ->> 'tableNumber')::integer,
        nullif(btrim(v_table ->> 'tableName'), ''),
        coalesce(nullif(btrim(v_table ->> 'tableType'), ''), 'round'),
        (v_table ->> 'totalSeats')::integer,
        nullif(v_table ->> 'notes', '')
      );
    end if;

    if jsonb_typeof(coalesce(v_table -> 'assignedGuests', '[]'::jsonb)) <> 'array' then
      raise exception using errcode = '22023', message = 'TABLE_ASSIGNMENTS_INVALID';
    end if;
    for v_assignment in select value from jsonb_array_elements(coalesce(v_table -> 'assignedGuests', '[]'::jsonb))
    loop
      v_guest_id := (v_assignment ->> 'guestId')::uuid;
      insert into public.table_assignments(table_id,guest_id,seat_number)
      values(v_table_id, v_guest_id, nullif(v_assignment ->> 'seatNumber', '')::integer);
    end loop;

    v_seen_ids := array_append(v_seen_ids, v_table_id);
    v_count := v_count + 1;
  end loop;

  if p_replace then
    delete from public.tables t
    where t.event_id = p_event_id
      and not (t.id = any(v_seen_ids));
  end if;

  return jsonb_build_object('savedTables', v_count);
end;
$$;

revoke all on function public.validate_table_assignment_event_capacity() from public, anon, authenticated;
revoke all on function public.prevent_table_capacity_underflow() from public, anon, authenticated;
revoke all on function public.save_event_table_plan(uuid,uuid,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.save_event_table_plan(uuid,uuid,jsonb,boolean) to service_role;

comment on function public.save_event_table_plan(uuid,uuid,jsonb,boolean) is
  'Atomically upserts an event table plan and its assignments after server-verified actor access.';
