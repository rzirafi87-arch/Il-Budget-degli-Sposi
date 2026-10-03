#!/usr/bin/env bash
set -Eeuo pipefail

database_url="${1:?usage: test-branch53-concurrency.sh DATABASE_URL}"
psql_cmd=(psql "$database_url" --no-psqlrc -v ON_ERROR_STOP=1)
failures=0

record_result() {
  local name="$1"
  local passed="$2"
  local detail="$3"
  if [[ "$passed" == "true" ]]; then
    echo "BRANCH53 CONCURRENCY PASS: $name — $detail"
  else
    echo "BRANCH53 CONCURRENCY FAIL: $name — $detail" >&2
    failures=$((failures + 1))
  fi
}

cleanup() {
  "${psql_cmd[@]}" -c "delete from public.events where id in ('53500000-0000-4000-8000-000000000010','53500000-0000-4000-8000-000000000011','53500000-0000-4000-8000-000000000012','53500000-0000-4000-8000-000000000013'); delete from auth.users where id in ('53500000-0000-4000-8000-000000000001','53500000-0000-4000-8000-000000000002','53500000-0000-4000-8000-000000000003');" >/dev/null 2>&1 || true
}
trap cleanup EXIT
cleanup

"${psql_cmd[@]}" <<'SQL'
insert into auth.users(id,email) values
  ('53500000-0000-4000-8000-000000000001','branch53-owner@example.invalid'),
  ('53500000-0000-4000-8000-000000000002','branch53-legacy@example.invalid'),
  ('53500000-0000-4000-8000-000000000003','branch53-partner@example.invalid');

insert into public.events(id,owner_id,name,event_type,groom_email) values
  ('53500000-0000-4000-8000-000000000010','53500000-0000-4000-8000-000000000001','B53 regenerate','wedding',null),
  ('53500000-0000-4000-8000-000000000011','53500000-0000-4000-8000-000000000001','B53 legacy','wedding','branch53-legacy@example.invalid'),
  ('53500000-0000-4000-8000-000000000012','53500000-0000-4000-8000-000000000001','B53 quota','wedding',null),
  ('53500000-0000-4000-8000-000000000013','53500000-0000-4000-8000-000000000001','B53 capacity','wedding',null);

insert into public.event_members(event_id,user_id,role,status)
values('53500000-0000-4000-8000-000000000010','53500000-0000-4000-8000-000000000003','partner','active')
on conflict(event_id,user_id) do update set role=excluded.role,status=excluded.status;

insert into public.guests(id,event_id,name,guest_type,attending) values
  ('53500000-0000-4000-8000-000000000020','53500000-0000-4000-8000-000000000010','Regenerate guest','common',true),
  ('53500000-0000-4000-8000-000000000021','53500000-0000-4000-8000-000000000013','Capacity guest A','common',true),
  ('53500000-0000-4000-8000-000000000022','53500000-0000-4000-8000-000000000013','Capacity guest B','common',true);
SQL

"${psql_cmd[@]}" -c "select public.save_event_table_plan('53500000-0000-4000-8000-000000000010','53500000-0000-4000-8000-000000000001','[{\"id\":\"53500000-0000-4000-8000-000000000030\",\"tableNumber\":1,\"tableName\":\"Original\",\"tableType\":\"round\",\"totalSeats\":2,\"assignedGuests\":[]}]'::jsonb,true);" >/dev/null
set +e
"${psql_cmd[@]}" -c "select public.save_event_table_plan('53500000-0000-4000-8000-000000000010','53500000-0000-4000-8000-000000000001','[{\"tableNumber\":1,\"tableName\":\"Regenerated\",\"tableType\":\"round\",\"totalSeats\":2,\"assignedGuests\":[]}]'::jsonb,true);" >/tmp/branch53-regenerate.log 2>&1
regenerate_status=$?
set -e
record_result "P1-A regenerated table numbers" "$([[ "$regenerate_status" -eq 0 ]] && echo true || echo false)" "exit=$regenerate_status"

set +e
"${psql_cmd[@]}" -c "select public.save_event_table_plan('53500000-0000-4000-8000-000000000011','53500000-0000-4000-8000-000000000002','[]'::jsonb,true);" >/tmp/branch53-legacy.log 2>&1
legacy_status=$?
set -e
record_result "P1-C legacy collaborator" "$([[ "$legacy_status" -eq 0 ]] && echo true || echo false)" "exit=$legacy_status"

"${psql_cmd[@]}" <<'SQL'
insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size)
select
  '53500000-0000-4000-8000-000000000012',
  '53500000-0000-4000-8000-000000000001',
  'baseline-' || n || '.pdf',
  '53500000-0000-4000-8000-000000000012/baseline-' || n || '/baseline.pdf',
  'generic',
  'application/pdf',
  10485760
from generate_series(1,9) n;
SQL

set +e
"${psql_cmd[@]}" -c "begin; insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53500000-0000-4000-8000-000000000012','53500000-0000-4000-8000-000000000001','concurrent-a.pdf','53500000-0000-4000-8000-000000000012/concurrent-a/file.pdf','generic','application/pdf',6291456); select pg_sleep(2); commit;" >/tmp/branch53-quota-a.log 2>&1 &
quota_a_pid=$!
sleep 0.2
"${psql_cmd[@]}" -c "insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53500000-0000-4000-8000-000000000012','53500000-0000-4000-8000-000000000001','concurrent-b.pdf','53500000-0000-4000-8000-000000000012/concurrent-b/file.pdf','generic','application/pdf',6291456);" >/tmp/branch53-quota-b.log 2>&1
quota_b_status=$?
wait "$quota_a_pid"
quota_a_status=$?
set -e
quota_total=$("${psql_cmd[@]}" -Atc "select coalesce(sum(file_size),0) from public.event_documents where event_id='53500000-0000-4000-8000-000000000012'")
quota_successes=$(( (quota_a_status == 0 ? 1 : 0) + (quota_b_status == 0 ? 1 : 0) ))
record_result "P1-B atomic 100 MB quota" "$([[ "$quota_successes" -eq 1 && "$quota_total" -le 104857600 ]] && echo true || echo false)" "successes=$quota_successes total=$quota_total"

"${psql_cmd[@]}" -c "insert into public.tables(id,event_id,table_number,table_name,total_seats) values('53500000-0000-4000-8000-000000000031','53500000-0000-4000-8000-000000000013',1,'Capacity one',1);" >/dev/null
set +e
"${psql_cmd[@]}" -c "begin; insert into public.table_assignments(table_id,guest_id,seat_number) values('53500000-0000-4000-8000-000000000031','53500000-0000-4000-8000-000000000021',null); select pg_sleep(2); commit;" >/tmp/branch53-capacity-a.log 2>&1 &
capacity_a_pid=$!
sleep 0.2
"${psql_cmd[@]}" -c "insert into public.table_assignments(table_id,guest_id,seat_number) values('53500000-0000-4000-8000-000000000031','53500000-0000-4000-8000-000000000022',null);" >/tmp/branch53-capacity-b.log 2>&1
capacity_b_status=$?
wait "$capacity_a_pid"
capacity_a_status=$?
set -e
capacity_count=$("${psql_cmd[@]}" -Atc "select count(*) from public.table_assignments where table_id='53500000-0000-4000-8000-000000000031'")
capacity_successes=$(( (capacity_a_status == 0 ? 1 : 0) + (capacity_b_status == 0 ? 1 : 0) ))
record_result "P2 serialized table capacity" "$([[ "$capacity_successes" -eq 1 && "$capacity_count" -eq 1 ]] && echo true || echo false)" "successes=$capacity_successes assignments=$capacity_count"

if [[ "$failures" -ne 0 ]]; then
  echo "BRANCH53 CONCURRENCY SUMMARY: FAIL ($failures finding(s))" >&2
  exit 1
fi
echo "BRANCH53 CONCURRENCY SUMMARY: PASS"
