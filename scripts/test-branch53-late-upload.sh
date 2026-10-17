#!/usr/bin/env bash
set -euo pipefail
database_url="${1:?isolated database URL required}"
work_dir="$(mktemp -d)"
cleanup() {
  psql "$database_url" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
delete from private.event_document_upload_reservations where event_id='53420000-0000-4000-8000-000000000010';
delete from public.events where id='53420000-0000-4000-8000-000000000010';
delete from auth.users where id='53420000-0000-4000-8000-000000000001';
SQL
  rm -rf -- "$work_dir"
}
trap cleanup EXIT
psql "$database_url" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into auth.users(id,email) values('53420000-0000-4000-8000-000000000001','late-race@example.invalid');
insert into public.events(id,owner_id,event_type) values('53420000-0000-4000-8000-000000000010','53420000-0000-4000-8000-000000000001','wedding');
insert into private.event_document_upload_reservations(id,event_id,actor_id,idempotency_key,object_path,original_name,mime_type,file_size,category,expires_at) values('53420000-0000-4000-8000-000000000020','53420000-0000-4000-8000-000000000010','53420000-0000-4000-8000-000000000001',gen_random_uuid(),'53420000-0000-4000-8000-000000000010/53420000-0000-4000-8000-000000000020/race.pdf','race.pdf','application/pdf',1,'generic',now()+interval '2 seconds');
SQL
psql "$database_url" -v ON_ERROR_STOP=1 <<'SQL' >"$work_dir/lock.log" &
begin;
select id from public.events where id='53420000-0000-4000-8000-000000000010' for update;
select 'EVENT_LOCK_ACQUIRED';
select pg_sleep(3);
commit;
SQL
lock_pid=$!
for attempt in {1..30}; do
  if grep -q EVENT_LOCK_ACQUIRED "$work_dir/lock.log"; then break; fi
  sleep 0.1
done
grep -q EVENT_LOCK_ACQUIRED "$work_dir/lock.log"
if psql "$database_url" -v ON_ERROR_STOP=1 >"$work_dir/insert.log" 2>&1 <<'SQL'
begin;
do $$ begin
  if now() >= (select expires_at from private.event_document_upload_reservations where id='53420000-0000-4000-8000-000000000020') then
    raise exception 'TEST_STARTED_TOO_LATE';
  end if;
end $$;
insert into storage.objects(bucket_id,name) values('event-documents','53420000-0000-4000-8000-000000000010/53420000-0000-4000-8000-000000000020/race.pdf');
commit;
SQL
then
  echo "Late Storage write unexpectedly succeeded" >&2
  exit 1
fi
wait "$lock_pid"
grep -q DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE "$work_dir/insert.log"
test "$(psql "$database_url" -Atc "select count(*) from storage.objects where bucket_id='event-documents' and name='53420000-0000-4000-8000-000000000010/53420000-0000-4000-8000-000000000020/race.pdf'")" = 0
echo "PASS late upload queued before TTL expires is rejected after event lock"
