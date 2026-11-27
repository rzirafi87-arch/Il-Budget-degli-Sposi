# Procedura da eseguire solo dopo gate e autorizzazione
Credenziali esclusivamente in ambiente protetto; non copiare password in chat,
URL nei log o dump in repository. Variabili sotto sono segnaposto, non configurate.

```bash
umask 077
pg_dump --version # client PostgreSQL 17
pg_dump --dbname="$RELEASE_SOURCE_DB_URL" --format=custom --file="$RELEASE_BACKUP_DIR/database.dump"
pg_restore --list "$RELEASE_BACKUP_DIR/database.dump" > "$RELEASE_BACKUP_DIR/contents.txt"
sha256sum "$RELEASE_BACKUP_DIR/database.dump" > "$RELEASE_BACKUP_DIR/SHA256SUMS"
# Solo istanza vuota ISOLATA di restore; mai Production come target.
pg_restore --dbname="$RELEASE_RESTORE_DB_URL" --no-owner --exit-on-error "$RELEASE_BACKUP_DIR/database.dump"
```
Un pg_restore --list non dimostra ripristinabilità. Occorre restore reale isolato
con ruoli/estensioni preconfigurati, verifica Auth, RLS/ACL, FK, contatori,
query campione e file Storage. pg_dump non include configurazione SaaS, segreti
Vercel, ruoli globali o byte Storage: acquisirli con procedure separate approvate.
Non avviare restore del progetto Supabase corrente per effettuare un drill.
Controllare quote gratuite e spazio prima; non attivare piani o servizi a pagamento.
