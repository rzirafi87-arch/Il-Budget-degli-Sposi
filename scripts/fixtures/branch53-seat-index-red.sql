\ir branch53-seat-conflicts.sql
create unique index branch53_legacy_seat_red_idx on public.table_assignments(table_id,seat_number) where seat_number is not null;
rollback;
