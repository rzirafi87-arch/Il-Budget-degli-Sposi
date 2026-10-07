#!/usr/bin/env bash
set -Eeuo pipefail
# DESTRUCTIVE isolated rebuild. Refuse non-loopback targets; never source .env.
db="${1:?isolated loopback DATABASE_URL required}"
[[ "$db" =~ @127\.0\.0\.1:[0-9]+/ ]] || { echo 'ISOLATED_LOOPBACK_REQUIRED' >&2; exit 1; }
manifest=scripts/rollout/branch53-certified-migrations.sha256
sha256sum --strict -c "$manifest"
mapfile -t certified < <(awk '{print $2}' "$manifest")
test "${#certified[@]}" -eq 12
p=(psql "$db" --no-psqlrc -v ON_ERROR_STOP=1)
apply() { "${p[@]}" -f "$1"; }
apply supabase/baseline/production_pre_branch_25.sql
mapfile -t migrations < <(grep -E '^  [0-9]{14}_[a-z0-9_]+\.sql' scripts/rebuild-local-supabase.sh | awk '{print $1}')
for m in "${migrations[@]}"; do
  [[ "$m" == *branch_53* ]] && break
  apply "supabase/migrations/$m"
done
apply scripts/fixtures/branch53-seating-writes-available.sql
if apply scripts/fixtures/branch53-seating-truncate-blocked.sql; then
  echo 'Expected TRUNCATE RED before suspension' >&2; exit 1
fi
if apply scripts/rollout/branch53-verify-seating-suspended.sql; then
  echo 'Expected initial RED without suspension' >&2; exit 1
fi
# Activation must fail atomically if an in-flight writer cannot drain in time.
"${p[@]}" -c "SET application_name='branch53-test-lock'; BEGIN; UPDATE public.tables SET id=id WHERE false; SELECT pg_sleep(15); COMMIT;" &
writer=$!
for attempt in {1..50}; do
  [[ "$("${p[@]}" -Atc "SELECT count(*) FROM pg_stat_activity WHERE application_name='branch53-test-lock' AND wait_event='PgSleep'")" == 1 ]] && break
  sleep 0.1
done
if apply scripts/rollout/branch53-suspend-seating-writes.sql; then
  echo 'Expected lock timeout with writer in flight' >&2; exit 1
fi
wait "$writer"
apply scripts/rollout/branch53-verify-seating-resumed.sql
apply scripts/rollout/branch53-suspend-seating-writes.sql
apply scripts/rollout/branch53-suspend-seating-writes.sql
apply scripts/rollout/branch53-verify-seating-suspended.sql
apply scripts/fixtures/branch53-seating-truncate-blocked.sql
# A disconnected client must leave the committed freeze active. Every apply is
# a fresh connection. Corrupt state must be rejected without removing objects.
"${p[@]}" -c 'ALTER TABLE public.tables DISABLE TRIGGER branch53_rollout_seating_freeze'
if apply scripts/rollout/branch53-resume-seating-writes.sql; then
  echo 'Expected fail-closed identity rejection' >&2; exit 1
fi
"${p[@]}" -c 'ALTER TABLE public.tables ENABLE ALWAYS TRIGGER branch53_rollout_seating_freeze'
apply scripts/rollout/branch53-verify-seating-suspended.sql
"${p[@]}" -c 'SET ROLE service_role' -f scripts/rollout/branch53-verify-seating-suspended.sql
"${p[@]}" -c 'SET ROLE authenticated' -f scripts/rollout/branch53-verify-seating-suspended.sql
apply scripts/preflight-branch53-seat-integrity.sql
n=0
for m in "${certified[@]}"; do
  apply "$m"
  apply scripts/rollout/branch53-verify-seating-suspended.sql
  n=$((n+1))
done
test "$n" -eq 12
apply scripts/fixtures/branch53-seating-rpc-freeze.sql
apply scripts/fixtures/branch53-seating-truncate-blocked.sql
"${p[@]}" -c 'SET ROLE service_role' -f scripts/rollout/branch53-verify-seating-suspended.sql
apply scripts/rollout/branch53-resume-seating-writes.sql
apply scripts/rollout/branch53-resume-seating-writes.sql
apply scripts/rollout/branch53-verify-seating-resumed.sql
apply scripts/rollout/branch53-verify-final-seating-contract.sql
apply scripts/fixtures/branch53-seating-writes-available.sql
before=$(mktemp)
after=$(mktemp)
trap 'rm -f "$before" "$after"' EXIT
catalog="SELECT jsonb_agg(row_to_json(p) ORDER BY p.oid) FROM pg_proc p WHERE pronamespace IN ('public'::regnamespace,'private'::regnamespace); SELECT jsonb_agg(row_to_json(c) ORDER BY c.oid) FROM pg_class c WHERE c.relnamespace IN ('public'::regnamespace,'private'::regnamespace); SELECT jsonb_agg(row_to_json(t) ORDER BY t.oid) FROM pg_trigger t WHERE tgrelid IN ('public.tables'::regclass,'public.table_assignments'::regclass);"
"${p[@]}" -Atc "$catalog" > "$before"
apply scripts/rollout/branch53-suspend-seating-writes.sql
apply scripts/rollout/branch53-resume-seating-writes.sql
"${p[@]}" -Atc "$catalog" > "$after"
diff -u "$before" "$after"
bash scripts/test-branch53-concurrency.sh "$db"
echo 'BASELINE -> SUSPEND -> PREFLIGHT -> 12 MIGRATIONS -> RESUME = PASS'
