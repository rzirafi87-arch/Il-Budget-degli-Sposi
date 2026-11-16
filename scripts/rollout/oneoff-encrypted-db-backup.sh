#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

if [[ -z "${BACKUP_DATABASE_URL:-}" ]]; then
  echo "::error::BACKUP_DATABASE_URL secret missing. No production connection attempted." >&2
  exit 10
fi
case "$BACKUP_DATABASE_URL" in
  postgresql://*|postgres://*) ;;
  *) echo "::error::BACKUP_DATABASE_URL must be a PostgreSQL connection string." >&2; exit 11 ;;
esac

# Never print connection credentials, SQL content, or environment variables.
private_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/controlled-dump.XXXXXXXX")"
encrypted_dir="${RUNNER_TEMP:-/tmp}/controlled-production-backup"
mkdir -p "$encrypted_dir"
chmod 700 "$encrypted_dir"
cleanup() {
  rm -rf -- "$private_dir"
}
trap cleanup EXIT

supabase db dump --db-url "$BACKUP_DATABASE_URL" --role-only -f "$private_dir/roles.sql" >/dev/null
supabase db dump --db-url "$BACKUP_DATABASE_URL" -f "$private_dir/schema.sql" >/dev/null
supabase db dump --db-url "$BACKUP_DATABASE_URL" --use-copy --data-only -f "$private_dir/data.sql" >/dev/null
# Preserve migration metadata separately (Supabase excludes system-managed schemas by default).
supabase db dump --db-url "$BACKUP_DATABASE_URL" --schema supabase_migrations -f "$private_dir/migration_schema.sql" >/dev/null
supabase db dump --db-url "$BACKUP_DATABASE_URL" --schema supabase_migrations --use-copy --data-only -f "$private_dir/migration_data.sql" >/dev/null

for file in roles.sql schema.sql data.sql migration_schema.sql migration_data.sql; do
  if [[ ! -s "$private_dir/$file" ]]; then
    echo "::error::Missing or empty backup component: $file" >&2
    exit 12
  fi
done

(
 cd "$private_dir"
 sha256sum roles.sql schema.sql data.sql migration_schema.sql migration_data.sql > SHA256SUMS.txt
 tar -czf "$encrypted_dir/plaintext-bundle.tar.gz" roles.sql schema.sql data.sql migration_schema.sql migration_data.sql SHA256SUMS.txt
)
tar -tzf "$encrypted_dir/plaintext-bundle.tar.gz" > /dev/null
openssl cms -encrypt -binary -aes-256-cbc \
  -in "$encrypted_dir/plaintext-bundle.tar.gz" \
  -out "$encrypted_dir/production-backup.cms" -outform DER \
  scripts/rollout/controlled-backup-public-cert.pem
openssl cms -cmsout -inform DER -in "$encrypted_dir/production-backup.cms" > /dev/null
rm -f -- "$encrypted_dir/plaintext-bundle.tar.gz"
test -s "$encrypted_dir/production-backup.cms"

{
  echo '### Encrypted Production backup prepared (NOT yet restore-certified)'
  echo '- Source: configured BACKUP_DATABASE_URL secret; never written to logs.'
  echo '- Export: roles, schema, data, migration schema, migration data via Supabase CLI.'
  echo '- Protection: OpenSSL CMS AES-256 encrypted for private offline recovery key.'
  echo '- Artifact contains only encrypted CMS, 30-day retention.'
  echo '- Verification: SQL components nonempty, tar valid, encrypted CMS valid.'
  echo '- Actual restore, Storage objects, completeness and durable offsite copy: NOT YET VERIFIED.'
  echo '- Production SQL writes, merges, deployments: NONE.'
  echo '- Encrypted artifact SHA256:'
  sha256sum "$encrypted_dir/production-backup.cms" | cut -d' ' -f1
} >> "$GITHUB_STEP_SUMMARY"
echo 'ENCRYPTED_BACKUP_PREPARED; RESTORE_CERTIFICATION_PENDING'
