#!/usr/bin/env bash
set -Eeuo pipefail

database_url="${1:?usage: test-branch53-red-team.sh DATABASE_URL}"
psql_cmd=(psql "$database_url" --no-psqlrc -v ON_ERROR_STOP=1)
log_dir="$(mktemp -d "${TMPDIR:-/tmp}/branch53-red-team.XXXXXX")"
failures=0

record_result() {
  local name="$1"
  local passed="$2"
  local detail="$3"
  if [[ "$passed" == "true" ]]; then
    echo "BRANCH53 RED TEAM PASS: $name — $detail"
  else
    echo "BRANCH53 RED TEAM FAIL: $name — $detail" >&2
    failures=$((failures + 1))
  fi
}

cleanup() {
  "${psql_cmd[@]}" -c "delete from public.events where id in ('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000011','53600000-0000-4000-8000-000000000012'); delete from auth.users where id in ('53600000-0000-4000-8000-000000000001','53600000-0000-4000-8000-000000000002','53600000-0000-4000-8000-000000000003');" >/dev/null 2>&1 || true
  if [[ "$log_dir" == */branch53-red-team.* && -d "$log_dir" ]]; then
    find "$log_dir" -type f -delete
    rmdir "$log_dir"
  fi
}
trap cleanup EXIT
cleanup
log_dir="$(mktemp -d "${TMPDIR:-/tmp}/branch53-red-team.XXXXXX")"

"${psql_cmd[@]}" <<'SQL'
insert into auth.users(id,email) values
  ('53600000-0000-4000-8000-000000000001','branch53-red-owner@example.invalid'),
  ('53600000-0000-4000-8000-000000000002','branch53-red-left@example.invalid'),
  ('53600000-0000-4000-8000-000000000003','branch53-red-other@example.invalid');
insert into public.events(id,owner_id,name,event_type) values
  ('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','B53 red quota','wedding'),
  ('53600000-0000-4000-8000-000000000011','53600000-0000-4000-8000-000000000001','B53 red tables','wedding'),
  ('53600000-0000-4000-8000-000000000012','53600000-0000-4000-8000-000000000003','B53 red other','wedding');
insert into public.event_members(event_id,user_id,role,status)
values('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000002','partner','left');
insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size)
select '53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001',
  'baseline-' || n || '.pdf','53600000-0000-4000-8000-000000000010/baseline-' || n || '/file.pdf',
  'generic','application/pdf',10485760
from generate_series(1,9) n;
insert into public.guests(id,event_id,name,guest_type,attending)
select ('53600000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  '53600000-0000-4000-8000-000000000011','Guest ' || n,'common',true
from generate_series(100,109) n;
insert into public.tables(id,event_id,table_number,table_name,total_seats)
values('53600000-0000-4000-8000-000000000030','53600000-0000-4000-8000-000000000011',1,'Last seat',1);
SQL

quota_pids=()
for index in $(seq 1 10); do
  key=$(printf '53600000-0000-4000-8001-%012d' "$index")
  "${psql_cmd[@]}" -c "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$key',2097152,'parallel-$index.pdf','application/pdf','generic',null,900);" >"$log_dir/quota-$index.log" 2>&1 &
  quota_pids+=("$!")
done
quota_successes=0
for pid in "${quota_pids[@]}"; do
  if wait "$pid"; then quota_successes=$((quota_successes + 1)); fi
done
quota_usage=$("${psql_cmd[@]}" -Atc "select coalesce((select sum(file_size) from public.event_documents where event_id='53600000-0000-4000-8000-000000000010'),0)+coalesce((select sum(file_size) from private.event_document_upload_reservations where event_id='53600000-0000-4000-8000-000000000010' and status='active' and expires_at>now()),0)")
record_result "ten-way quota race" "$([[ "$quota_successes" -eq 5 && "$quota_usage" -eq 104857600 ]] && echo true || echo false)" "successes=$quota_successes usage=$quota_usage"

"${psql_cmd[@]}" -c "delete from private.event_document_upload_reservations where event_id='53600000-0000-4000-8000-000000000010';" >/dev/null
duplicate_pids=()
for index in $(seq 1 10); do
  "${psql_cmd[@]}" -c "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','53600000-0000-4000-8002-000000000001',1048576,'retry.pdf','application/pdf','generic',null,900);" >"$log_dir/idempotent-$index.log" 2>&1 &
  duplicate_pids+=("$!")
done
duplicate_successes=0
for pid in "${duplicate_pids[@]}"; do
  if wait "$pid"; then duplicate_successes=$((duplicate_successes + 1)); fi
done
duplicate_rows=$("${psql_cmd[@]}" -Atc "select count(*) from private.event_document_upload_reservations where event_id='53600000-0000-4000-8000-000000000010' and idempotency_key='53600000-0000-4000-8002-000000000001'")
record_result "duplicate idempotency retry" "$([[ "$duplicate_successes" -eq 10 && "$duplicate_rows" -eq 1 ]] && echo true || echo false)" "successes=$duplicate_successes rows=$duplicate_rows"

set +e
"${psql_cmd[@]}" -c "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','53600000-0000-4000-8002-000000000001',1048577,'retry.pdf','application/pdf','generic',null,900);" >"$log_dir/idempotency-mutation.log" 2>&1
mutation_status=$?
"${psql_cmd[@]}" -c "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000002','53600000-0000-4000-8002-000000000002',1,'left.pdf','application/pdf','generic',null,900);" >"$log_dir/left.log" 2>&1
left_status=$?
"${psql_cmd[@]}" -c "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000003','53600000-0000-4000-8002-000000000003',1,'cross.pdf','application/pdf','generic',null,900);" >"$log_dir/cross.log" 2>&1
cross_status=$?
set -e
record_result "mutated idempotency key" "$([[ "$mutation_status" -ne 0 ]] && rg -q 'DOCUMENT_IDEMPOTENCY_CONFLICT' "$log_dir/idempotency-mutation.log" && echo true || echo false)" "exit=$mutation_status"
record_result "left member denial" "$([[ "$left_status" -ne 0 ]] && rg -q 'EVENT_ACCESS_DENIED' "$log_dir/left.log" && echo true || echo false)" "exit=$left_status"
record_result "cross-event JWT actor denial" "$([[ "$cross_status" -ne 0 ]] && rg -q 'EVENT_ACCESS_DENIED' "$log_dir/cross.log" && echo true || echo false)" "exit=$cross_status"

reservation_id=$("${psql_cmd[@]}" -Atc "select id from private.event_document_upload_reservations where idempotency_key='53600000-0000-4000-8002-000000000001'")
object_path=$("${psql_cmd[@]}" -Atc "select object_path from private.event_document_upload_reservations where id='$reservation_id'")
set +e
"${psql_cmd[@]}" -c "select public.finalize_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$reservation_id','53600000-0000-4000-8000-000000000010/manipulated/file.pdf',1048576);" >"$log_dir/object-path.log" 2>&1
object_status=$?
set -e
record_result "manipulated object key" "$([[ "$object_status" -ne 0 ]] && rg -q 'DOCUMENT_RESERVATION_MISMATCH' "$log_dir/object-path.log" && echo true || echo false)" "exit=$object_status"
"${psql_cmd[@]}" -c "select public.release_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$reservation_id','$object_path'); select public.release_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$reservation_id','$object_path');" >/dev/null
release_status=$("${psql_cmd[@]}" -Atc "select status from private.event_document_upload_reservations where id='$reservation_id'")
record_result "idempotent release after failed upload" "$([[ "$release_status" == released ]] && echo true || echo false)" "status=$release_status"

"${psql_cmd[@]}" -c "begin; select 1 from public.events where id='53600000-0000-4000-8000-000000000010' for update; select pg_sleep(1); commit;" >"$log_dir/lock-holder.log" 2>&1 &
lock_holder_pid=$!
sleep 0.2
set +e
"${psql_cmd[@]}" -c "set lock_timeout='100ms'; select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','53600000-0000-4000-8002-000000000005',1048576,'timeout-retry.pdf','application/pdf','generic',null,900);" >"$log_dir/lock-timeout.log" 2>&1
lock_timeout_status=$?
set -e
wait "$lock_holder_pid"
set +e
"${psql_cmd[@]}" -c "set lock_timeout='5s'; select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','53600000-0000-4000-8002-000000000005',1048576,'timeout-retry.pdf','application/pdf','generic',null,900);" >"$log_dir/lock-retry.log" 2>&1
lock_retry_status=$?
set -e
timeout_retry_rows=$("${psql_cmd[@]}" -Atc "select count(*) from private.event_document_upload_reservations where idempotency_key='53600000-0000-4000-8002-000000000005' and status='active'")
record_result "lock timeout fails without partial state" "$([[ "$lock_timeout_status" -ne 0 ]] && rg -q 'lock timeout' "$log_dir/lock-timeout.log" && echo true || echo false)" "exit=$lock_timeout_status"
record_result "retry after lock timeout" "$([[ "$lock_retry_status" -eq 0 && "$timeout_retry_rows" -eq 1 ]] && echo true || echo false)" "exit=$lock_retry_status rows=$timeout_retry_rows"
timeout_reservation_id=$("${psql_cmd[@]}" -Atc "select id from private.event_document_upload_reservations where idempotency_key='53600000-0000-4000-8002-000000000005'")
timeout_object_path=$("${psql_cmd[@]}" -Atc "select object_path from private.event_document_upload_reservations where id='$timeout_reservation_id'")
"${psql_cmd[@]}" -c "select public.release_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$timeout_reservation_id','$timeout_object_path');" >/dev/null

cleanup_reservation=$("${psql_cmd[@]}" -Atc "select public.reserve_event_document_upload('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','53600000-0000-4000-8002-000000000006',1048576,'cleanup.pdf','application/pdf','generic',null,900)")
cleanup_reservation_id=$(printf '%s' "$cleanup_reservation" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>process.stdout.write(JSON.parse(s).reservationId))")
cleanup_object_path=$(printf '%s' "$cleanup_reservation" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>process.stdout.write(JSON.parse(s).objectPath))")
"${psql_cmd[@]}" -c "insert into storage.objects(bucket_id,name,metadata) values('event-documents','$cleanup_object_path',jsonb_build_object('size',1048576)); update private.event_document_upload_reservations set expires_at=now()-interval '1 second' where id='$cleanup_reservation_id'; select public.claim_expired_event_document_uploads('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001',20);" >/dev/null
set +e
"${psql_cmd[@]}" -c "select public.complete_event_document_upload_cleanup('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$cleanup_reservation_id','$cleanup_object_path');" >"$log_dir/cleanup-object-present.log" 2>&1
cleanup_guard_status=$?
set -e
"${psql_cmd[@]}" -c "delete from storage.objects where bucket_id='event-documents' and name='$cleanup_object_path'; select public.complete_event_document_upload_cleanup('53600000-0000-4000-8000-000000000010','53600000-0000-4000-8000-000000000001','$cleanup_reservation_id','$cleanup_object_path');" >/dev/null
cleanup_final_state=$("${psql_cmd[@]}" -Atc "select r.status || ':' || count(o.id) from private.event_document_upload_reservations r left join storage.objects o on o.bucket_id='event-documents' and o.name=r.object_path where r.id='$cleanup_reservation_id' group by r.status")
record_result "cleanup waits for Storage deletion" "$([[ "$cleanup_guard_status" -ne 0 ]] && rg -q 'DOCUMENT_OBJECT_STILL_PRESENT' "$log_dir/cleanup-object-present.log" && echo true || echo false)" "exit=$cleanup_guard_status"
record_result "cleanup after Storage error is coherent" "$([[ "$cleanup_final_state" == 'expired:0' ]] && echo true || echo false)" "state=$cleanup_final_state"

assignment_pids=()
for index in $(seq 100 109); do
  guest=$(printf '53600000-0000-4000-8000-%012d' "$index")
  "${psql_cmd[@]}" -c "select set_config('lock_timeout','5s',false); insert into public.table_assignments(table_id,guest_id) values('53600000-0000-4000-8000-000000000030','$guest');" >"$log_dir/seat-$index.log" 2>&1 &
  assignment_pids+=("$!")
done
assignment_successes=0
for pid in "${assignment_pids[@]}"; do
  if wait "$pid"; then assignment_successes=$((assignment_successes + 1)); fi
done
assignment_count=$("${psql_cmd[@]}" -Atc "select count(*) from public.table_assignments where table_id='53600000-0000-4000-8000-000000000030'")
record_result "ten-way last-seat race" "$([[ "$assignment_successes" -eq 1 && "$assignment_count" -eq 1 ]] && echo true || echo false)" "successes=$assignment_successes assignments=$assignment_count"

plan='[{"id":"53600000-0000-4000-8000-000000000031","tableNumber":1,"tableName":"Deterministic","tableType":"round","totalSeats":2,"assignedGuests":[]}]'
plan_pids=()
for index in $(seq 1 10); do
  "${psql_cmd[@]}" -c "select set_config('lock_timeout','5s',false); select public.save_event_table_plan('53600000-0000-4000-8000-000000000011','53600000-0000-4000-8000-000000000001','$plan'::jsonb,true);" >"$log_dir/plan-$index.log" 2>&1 &
  plan_pids+=("$!")
done
plan_successes=0
for pid in "${plan_pids[@]}"; do
  if wait "$pid"; then plan_successes=$((plan_successes + 1)); fi
done
final_plan=$("${psql_cmd[@]}" -Atc "select count(*) || ':' || min(table_number) || ':' || min(table_name) from public.tables where event_id='53600000-0000-4000-8000-000000000011'")
record_result "ten-way table-plan serialization" "$([[ "$plan_successes" -eq 10 && "$final_plan" == '1:1:Deterministic' ]] && echo true || echo false)" "successes=$plan_successes final=$final_plan"
if rg -q 'deadlock detected|SQLSTATE 40P01| 40P01' "$log_dir"; then
  deadlock_free=false
else
  deadlock_free=true
fi
record_result "parallel requests avoid deadlock" "$deadlock_free" "sqlstate40P01=absent"

set +e
"${psql_cmd[@]}" -c "select public.save_event_table_plan('53600000-0000-4000-8000-000000000011','53600000-0000-4000-8000-000000000001','[{\"tableNumber\":1,\"totalSeats\":1,\"assignedGuests\":[]},{\"tableNumber\":1,\"totalSeats\":1,\"assignedGuests\":[]}]'::jsonb,true);" >"$log_dir/duplicate-plan.log" 2>&1
duplicate_plan_status=$?
set -e
record_result "duplicate table payload" "$([[ "$duplicate_plan_status" -ne 0 ]] && rg -q 'DUPLICATE_TABLE_NUMBER' "$log_dir/duplicate-plan.log" && echo true || echo false)" "exit=$duplicate_plan_status"

if [[ "$failures" -ne 0 ]]; then
  echo "BRANCH53 RED TEAM SUMMARY: FAIL ($failures finding(s))" >&2
  exit 1
fi
echo "BRANCH53 RED TEAM SUMMARY: PASS"
