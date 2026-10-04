-- Synthetic legacy data, always inside a transaction rolled back by callers.
begin;
insert into auth.users(id,email) values ('53450000-0000-4000-8000-000000000001','seat-upgrade@example.invalid');
insert into public.events(id,owner_id,event_type) values ('53450000-0000-4000-8000-000000000010','53450000-0000-4000-8000-000000000001','wedding');
insert into public.guests(id,event_id,name,guest_type,attending) values
('53450000-0000-4000-8000-000000000020','53450000-0000-4000-8000-000000000010','Guest A','common',true),
('53450000-0000-4000-8000-000000000021','53450000-0000-4000-8000-000000000010','Guest B','common',true);
insert into public.tables(id,event_id,table_number,table_name,table_type,total_seats) values ('53450000-0000-4000-8000-000000000030','53450000-0000-4000-8000-000000000010',1,'Legacy','round',4);
insert into public.table_assignments(table_id,guest_id,seat_number) values
('53450000-0000-4000-8000-000000000030','53450000-0000-4000-8000-000000000020',1),
('53450000-0000-4000-8000-000000000030','53450000-0000-4000-8000-000000000021',1);
