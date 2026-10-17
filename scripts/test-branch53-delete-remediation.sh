#!/usr/bin/env bash
set -Eeuo pipefail

database_url="${1:?usage: test-branch53-delete-remediation.sh DATABASE_URL}"
psql_cmd=(psql "$database_url" --no-psqlrc -v ON_ERROR_STOP=1)
log_dir="$(mktemp -d "${TMPDIR:-/tmp}/branch53-delete-remediation.XXXXXX")"
failures=0

record_result() {
  local name="$1"
  local passed="$2"
  local detail="$3"
  if [[ "$passed" == "true" ]]; then
    echo "BRANCH53 DELETE REMEDIATION PASS: $name — $detail"
  else
    echo "BRANCH53 DELETE REMEDIATION FAIL: $name — $detail" >&2
    failures=$((failures + 1))
  fi
}

cleanup() {
  "${psql_cmd[@]}" -c "begin; set local session_replication_role=replica; delete from storage.objects where bucket_id='event-documents' and (name like '53800000-0000-4000-8000-000000000010/%' or name like '53800000-0000-4000-8000-000000000011/%'); commit;" >/dev/null 2>&1 || true
  "${psql_cmd[@]}" -c "delete from public.event_documents where event_id in ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000011'); delete from private.event_document_upload_reservations where event_id in ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000011'); delete from private.event_document_deletions where event_id in ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000011'); delete from public.events where id in ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000011'); delete from auth.users where id in ('53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000002','53800000-0000-4000-8000-000000000003','53800000-0000-4000-8000-000000000004');" >/dev/null 2>&1 || true
  if [[ "$log_dir" == */branch53-delete-remediation.* && -d "$log_dir" ]]; then
    find "$log_dir" -type f -delete
    rmdir "$log_dir"
  fi
}
trap cleanup EXIT
cleanup
log_dir="$(mktemp -d "${TMPDIR:-/tmp}/branch53-delete-remediation.XXXXXX")"

"${psql_cmd[@]}" <<'SQL'
insert into auth.users(id,email) values
  ('53800000-0000-4000-8000-000000000001','delete-owner@example.invalid'),
  ('53800000-0000-4000-8000-000000000002','delete-partner@example.invalid'),
  ('53800000-0000-4000-8000-000000000003','delete-left@example.invalid'),
  ('53800000-0000-4000-8000-000000000004','delete-other@example.invalid');
insert into public.events(id,owner_id,name,event_type) values
  ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','Delete remediation A','wedding'),
  ('53800000-0000-4000-8000-000000000011','53800000-0000-4000-8000-000000000004','Delete remediation B','wedding');
insert into public.event_members(event_id,user_id,role,status) values
  ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000002','partner','active'),
  ('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000003','partner','left');
insert into public.guests(id,event_id,name,guest_type,attending) values
  ('53800000-0000-4000-8000-000000000100','53800000-0000-4000-8000-000000000010','Serialized guest','common',true);
insert into public.tables(id,event_id,table_number,table_name,total_seats) values
  ('53800000-0000-4000-8000-000000000020','53800000-0000-4000-8000-000000000010',1,'Lock probe',1),
  ('53800000-0000-4000-8000-000000000021','53800000-0000-4000-8000-000000000011',1,'Other event',1);
insert into public.event_documents(id,event_id,created_by,original_name,object_path,category,mime_type,file_size) values
  ('53800000-0000-4000-8000-000000000030','53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','concurrent.pdf','53800000-0000-4000-8000-000000000010/delete/concurrent.pdf','generic','application/pdf',1024),
  ('53800000-0000-4000-8000-000000000031','53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','recovery.pdf','53800000-0000-4000-8000-000000000010/delete/recovery.pdf','generic','application/pdf',1024),
  ('53800000-0000-4000-8000-000000000040','53800000-0000-4000-8000-000000000011','53800000-0000-4000-8000-000000000004','other.pdf','53800000-0000-4000-8000-000000000011/delete/other.pdf','generic','application/pdf',1024);
insert into storage.objects(bucket_id,name,metadata) values
  ('event-documents','53800000-0000-4000-8000-000000000010/delete/concurrent.pdf','{"size":1024}'::jsonb),
  ('event-documents','53800000-0000-4000-8000-000000000010/delete/recovery.pdf','{"size":1024}'::jsonb),
  ('event-documents','53800000-0000-4000-8000-000000000011/delete/other.pdf','{"size":1024}'::jsonb);
SQL

has_table_delete_rpc=$("${psql_cmd[@]}" -Atc "select to_regprocedure('public.delete_event_table(uuid,uuid,uuid)') is not null")
has_document_delete_rpc=$("${psql_cmd[@]}" -Atc "select to_regprocedure('public.begin_event_document_delete(uuid,uuid,uuid)') is not null and to_regprocedure('public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)') is not null")
record_result "serialized table delete RPC exists" "$([[ "$has_table_delete_rpc" == "t" ]] && echo true || echo false)" "present=$has_table_delete_rpc"
record_result "recoverable document delete RPCs exist" "$([[ "$has_document_delete_rpc" == "t" ]] && echo true || echo false)" "present=$has_document_delete_rpc"

# This probes the actual route strategy at each revision. On the red baseline the
# route is a direct DELETE and incorrectly succeeds while the event lock is held.
"${psql_cmd[@]}" -c "begin; select 1 from public.events where id='53800000-0000-4000-8000-000000000010' for update; select pg_sleep(1); commit;" >"$log_dir/table-lock-holder.log" 2>&1 &
table_lock_holder=$!
sleep 0.2
set +e
if [[ "$has_table_delete_rpc" == "t" ]]; then
  "${psql_cmd[@]}" -c "set lock_timeout='100ms'; select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000020');" >"$log_dir/table-lock-probe.log" 2>&1
else
  "${psql_cmd[@]}" -c "set lock_timeout='100ms'; delete from public.tables where id='53800000-0000-4000-8000-000000000020' and event_id='53800000-0000-4000-8000-000000000010';" >"$log_dir/table-lock-probe.log" 2>&1
fi
table_lock_probe_status=$?
set -e
wait "$table_lock_holder"
table_lock_serialized=false
if [[ "$table_lock_probe_status" -ne 0 ]] && grep -Eq 'lock timeout' "$log_dir/table-lock-probe.log"; then
  table_lock_serialized=true
fi
record_result "table DELETE waits behind the shared event lock" "$table_lock_serialized" "exit=$table_lock_probe_status"

if [[ "$has_table_delete_rpc" == "t" ]]; then
  "${psql_cmd[@]}" -c "select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000020');" >/dev/null
  record_result "table delete retry after lock timeout" "$([[ "$("${psql_cmd[@]}" -Atc "select count(*) from public.tables where id='53800000-0000-4000-8000-000000000020'")" -eq 0 ]] && echo true || echo false)" "target absent"

  plan='[{"id":"53800000-0000-4000-8000-000000000022","tableNumber":1,"tableName":"Serialized","tableType":"round","totalSeats":1,"assignedGuests":[{"guestId":"53800000-0000-4000-8000-000000000100","seatNumber":1}]}]'
  for iteration in $(seq 1 5); do
    "${psql_cmd[@]}" -c "delete from public.tables where event_id='53800000-0000-4000-8000-000000000010'; insert into public.tables(id,event_id,table_number,table_name,total_seats) values('53800000-0000-4000-8000-000000000022','53800000-0000-4000-8000-000000000010',1,'Before save',1);" >/dev/null
    "${psql_cmd[@]}" -c "begin; select public.save_event_table_plan('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000002','$plan'::jsonb,true); select pg_sleep(0.2); commit;" >"$log_dir/save-first-$iteration.log" 2>&1 &
    save_pid=$!
    sleep 0.05
    "${psql_cmd[@]}" -c "select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000022');" >"$log_dir/delete-after-save-$iteration.log" 2>&1
    wait "$save_pid"
    final_absent=$("${psql_cmd[@]}" -Atc "select count(*)=0 from public.tables where id='53800000-0000-4000-8000-000000000022'")
    record_result "save-before-delete serialization $iteration" "$([[ "$final_absent" == "t" ]] && echo true || echo false)" "table_absent=$final_absent"

    "${psql_cmd[@]}" -c "insert into public.tables(id,event_id,table_number,table_name,total_seats) values('53800000-0000-4000-8000-000000000022','53800000-0000-4000-8000-000000000010',1,'Before delete',1);" >/dev/null
    "${psql_cmd[@]}" -c "begin; select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000022'); select pg_sleep(0.2); commit;" >"$log_dir/delete-first-$iteration.log" 2>&1 &
    delete_pid=$!
    sleep 0.05
    "${psql_cmd[@]}" -c "select public.save_event_table_plan('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000002','$plan'::jsonb,true);" >"$log_dir/save-after-delete-$iteration.log" 2>&1
    wait "$delete_pid"
    final_present=$("${psql_cmd[@]}" -Atc "select count(*)=1 from public.tables where id='53800000-0000-4000-8000-000000000022'")
    record_result "delete-before-save serialization $iteration" "$([[ "$final_present" == "t" ]] && echo true || echo false)" "table_present=$final_present"
  done

  table_integrity=$("${psql_cmd[@]}" -Atc "select not exists (select 1 from public.table_assignments group by table_id,seat_number having seat_number is not null and count(*)>1) and not exists (select 1 from public.tables t where (select count(*) from public.table_assignments a where a.table_id=t.id)>t.total_seats)")
  record_result "serialized races preserve seat uniqueness and capacity" "$([[ "$table_integrity" == "t" ]] && echo true || echo false)" "integrity=$table_integrity"

  set +e
  "${psql_cmd[@]}" -c "select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000003','53800000-0000-4000-8000-000000000022');" >"$log_dir/table-left.log" 2>&1
  left_status=$?
  "${psql_cmd[@]}" -c "select public.delete_event_table('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000021');" >"$log_dir/table-cross.log" 2>&1
  cross_status=$?
  set -e
  record_result "left actor table delete denied" "$([[ "$left_status" -ne 0 ]] && grep -Eq 'EVENT_ACCESS_DENIED' "$log_dir/table-left.log" && echo true || echo false)" "exit=$left_status"
  record_result "cross-event table delete denied" "$([[ "$cross_status" -ne 0 ]] && grep -Eq 'TABLE_EVENT_MISMATCH' "$log_dir/table-cross.log" && echo true || echo false)" "exit=$cross_status"
fi

if [[ "$has_document_delete_rpc" == "t" ]]; then
  begin_pids=()
  for index in $(seq 1 10); do
    "${psql_cmd[@]}" -c "select public.begin_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000030');" >"$log_dir/doc-begin-$index.log" 2>&1 &
    begin_pids+=("$!")
  done
  begin_successes=0
  for pid in "${begin_pids[@]}"; do if wait "$pid"; then begin_successes=$((begin_successes + 1)); fi; done
  operation_id=$("${psql_cmd[@]}" -Atc "select id from private.event_document_deletions where document_id='53800000-0000-4000-8000-000000000030'")
  begin_state=$("${psql_cmd[@]}" -Atc "select count(*) || ':' || min(status) from private.event_document_deletions where document_id='53800000-0000-4000-8000-000000000030'")
  metadata_state=$("${psql_cmd[@]}" -Atc "select deletion_state from public.event_documents where id='53800000-0000-4000-8000-000000000030'")
  record_result "ten-way document delete begin is idempotent" "$([[ "$begin_successes" -eq 10 && "$begin_state" == '1:pending_storage' && "$metadata_state" == 'pending_storage' ]] && echo true || echo false)" "successes=$begin_successes ledger=$begin_state metadata=$metadata_state"

  set +e
  "${psql_cmd[@]}" -c "select public.begin_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000040');" >"$log_dir/doc-cross.log" 2>&1
  doc_cross_status=$?
  "${psql_cmd[@]}" -c "select public.complete_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','$operation_id','53800000-0000-4000-8000-000000000030','53800000-0000-4000-8000-000000000010/manipulated.pdf');" >"$log_dir/doc-key.log" 2>&1
  doc_key_status=$?
  set -e
  record_result "cross-event document delete denied" "$([[ "$doc_cross_status" -ne 0 ]] && grep -Eq 'DOCUMENT_EVENT_MISMATCH' "$log_dir/doc-cross.log" && echo true || echo false)" "exit=$doc_cross_status"
  record_result "manipulated delete object key denied" "$([[ "$doc_key_status" -ne 0 ]] && grep -Eq 'DOCUMENT_DELETE_MISMATCH' "$log_dir/doc-key.log" && echo true || echo false)" "exit=$doc_key_status"

  "${psql_cmd[@]}" -c "begin; set local session_replication_role=replica; delete from storage.objects where bucket_id='event-documents' and name='53800000-0000-4000-8000-000000000010/delete/concurrent.pdf'; commit;" >/dev/null
  complete_pids=()
  for index in $(seq 1 10); do
    "${psql_cmd[@]}" -c "select public.complete_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','$operation_id','53800000-0000-4000-8000-000000000030','53800000-0000-4000-8000-000000000010/delete/concurrent.pdf');" >"$log_dir/doc-complete-$index.log" 2>&1 &
    complete_pids+=("$!")
  done
  complete_successes=0
  for pid in "${complete_pids[@]}"; do if wait "$pid"; then complete_successes=$((complete_successes + 1)); fi; done
  completed_state=$("${psql_cmd[@]}" -Atc "select status || ':' || (select count(*) from public.event_documents d where d.id='53800000-0000-4000-8000-000000000030') from private.event_document_deletions where id='$operation_id'")
  record_result "ten-way document completion converges" "$([[ "$complete_successes" -eq 10 && "$completed_state" == 'completed:0' ]] && echo true || echo false)" "successes=$complete_successes state=$completed_state"

  recovery=$("${psql_cmd[@]}" -Atc "select public.begin_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','53800000-0000-4000-8000-000000000031')")
  recovery_operation=$(printf '%s' "$recovery" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>process.stdout.write(JSON.parse(s).operationId))")
  "${psql_cmd[@]}" -c "begin; set local session_replication_role=replica; delete from storage.objects where bucket_id='event-documents' and name='53800000-0000-4000-8000-000000000010/delete/recovery.pdf'; commit;" >/dev/null
  "${psql_cmd[@]}" -c "begin; select 1 from public.events where id='53800000-0000-4000-8000-000000000010' for update; select pg_sleep(1); commit;" >"$log_dir/doc-lock-holder.log" 2>&1 &
  doc_lock_holder=$!
  sleep 0.2
  set +e
  "${psql_cmd[@]}" -c "set lock_timeout='100ms'; select public.complete_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','$recovery_operation','53800000-0000-4000-8000-000000000031','53800000-0000-4000-8000-000000000010/delete/recovery.pdf');" >"$log_dir/doc-finalize-timeout.log" 2>&1
  finalize_timeout_status=$?
  set -e
  wait "$doc_lock_holder"
  recovery_pending=$("${psql_cmd[@]}" -Atc "select r.status || ':' || d.deletion_state from private.event_document_deletions r join public.event_documents d on d.id=r.document_id where r.id='$recovery_operation'")
  record_result "Storage success plus DB failure remains recoverable" "$([[ "$finalize_timeout_status" -ne 0 && "$recovery_pending" == 'pending_storage:pending_storage' ]] && grep -Eq 'lock timeout' "$log_dir/doc-finalize-timeout.log" && echo true || echo false)" "exit=$finalize_timeout_status state=$recovery_pending"
  "${psql_cmd[@]}" -c "select public.complete_event_document_delete('53800000-0000-4000-8000-000000000010','53800000-0000-4000-8000-000000000001','$recovery_operation','53800000-0000-4000-8000-000000000031','53800000-0000-4000-8000-000000000010/delete/recovery.pdf');" >/dev/null
  recovery_final=$("${psql_cmd[@]}" -Atc "select status || ':' || (select count(*) from public.event_documents where id='53800000-0000-4000-8000-000000000031') from private.event_document_deletions where id='$recovery_operation'")
  record_result "retry completes partial document deletion" "$([[ "$recovery_final" == 'completed:0' ]] && echo true || echo false)" "state=$recovery_final"
fi

if grep -ERq 'deadlock detected|SQLSTATE 40P01| 40P01' "$log_dir"; then deadlock_free=false; else deadlock_free=true; fi
record_result "targeted delete races avoid deadlock" "$deadlock_free" "sqlstate40P01=absent"

if [[ "$failures" -ne 0 ]]; then
  echo "BRANCH53 DELETE REMEDIATION SUMMARY: FAIL ($failures finding(s))" >&2
  exit 1
fi
echo "BRANCH53 DELETE REMEDIATION SUMMARY: PASS"
