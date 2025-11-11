# Indice Script SQL - Il Budget degli Sposi

## 📂 Script di Verifica e Monitoraggio (Read-Only)

Tutti questi script possono essere eseguiti direttamente nel **SQL Editor di Supabase** senza modificare dati.

### 🏥 Health Check & Diagnostica

| File | Scopo | Tempo | Quando Usarlo |
|------|-------|-------|---------------|
| `supabase-quick-check.sql` | ✅ Verifica rapida con health score | < 3s | Check giornaliero, pre-deploy |
| `supabase-diagnostics-complete.sql` | 🔍 Diagnostica completa all-in-one | ~10s | Setup iniziale, troubleshooting |
| `supabase-verify-config.sql` | ⚙️ Verifica configurazione base | ~2s | Post-setup, dopo migrations |
| `supabase-verify-data-integrity.sql` | 🔗 Controllo integrità dati | ~5s | Periodico, post-import |
| `supabase-verify-performance.sql` | ⚡ Analisi performance e indici | ~3s | Troubleshooting lentezza |

### 📊 Monitoring & Analytics

| File | Scopo | Tempo | Quando Usarlo |
|------|-------|-------|---------------|
| `supabase-monitor-activity.sql` | 📈 Monitoraggio attività recente | ~5s | Analytics, trend analysis |
| `supabase-generate-reports.sql` | 📋 Generazione report CSV | ~10s | Export dati, presentazioni |

---

## 📚 Documentazione Collegata

- 📖 **[SUPABASE-SQL-VERIFICATION-GUIDE.md](./SUPABASE-SQL-VERIFICATION-GUIDE.md)** - Guida completa all'uso degli script
- 🚀 **[SQL-SCRIPTS-QUICK-REFERENCE.md](./SQL-SCRIPTS-QUICK-REFERENCE.md)** - Quick reference con esempi pratici
- 📘 **[README.md](./README.md)** - Setup generale del progetto

---

## 🗄️ Script di Setup e Seed (Modificano il Database)

⚠️ **ATTENZIONE:** Questi script modificano lo schema o i dati. Usare con cautela!

### Schema & Migrations

| File | Scopo | Esecuzione |
|------|-------|------------|
| `supabase-COMPLETE-SETUP.sql` | 🏗️ Setup completo schema | Prima installazione |
| `supabase-ALL-PATCHES.sql` | 🔄 Tutte le patch cumulative | Dopo setup, prima di seed |

### Seed Data

| File | Scopo | Dati |
|------|-------|------|
| `supabase-suppliers-seed.sql` | 🏢 Seed fornitori | ~200+ fornitori per regione |
| `supabase-locations-seed.sql` | 🏰 Seed location | ~300+ location matrimoni |
| `supabase-churches-seed.sql` | ⛪ Seed chiese | ~400+ chiese per regione |
| `supabase-events-seed.sql` | 📅 Seed eventi base | Template eventi |
| `supabase-wedding-cards-table.sql` | 💌 Tabella partecipazioni | Schema inviti |

### Seed Aggiuntivi (Multi-Country)

| File | Scopo | Paese/Evento |
|------|-------|--------------|
| `supabase-50th-birthday-seed.sql` | 🎂 50° Compleanno | Italia |
| `supabase-india-seed.sql` | 🇮🇳 Seed India | India (locations, suppliers) |
| `supabase-mexico-seed.sql` | 🇲🇽 Seed Messico | Messico (base) |
| `supabase-mx-seed-locations.sql` | 🏖️ Location Messico | Messico (dettagliato) |
| `supabase-mx-seed-suppliers.sql` | 🌮 Fornitori Messico | Messico (dettagliato) |
| `supabase-traditions-extend-and-seed.sql` | 🎭 Tradizioni (schema) | Multi-country |
| `supabase-traditions-seed-more.sql` | 🎭 Tradizioni (dati) | Multi-country |
| `supabase-traditions-policies.sql` | 🔐 Policies tradizioni | RLS policies |

---

## 🔧 Script di Utility e Fix

| File | Scopo |
|------|-------|
| `supabase-add-unique-constraint.sql` | Aggiunge constraint univoci |

---

## 🚀 Esecuzione Rapida

### Opzione 1: Supabase SQL Editor (Consigliato per Read-Only)

```
1. Apri https://app.supabase.com
2. Seleziona progetto
3. SQL Editor → New Query
4. Copia/incolla contenuto script
5. Run (Ctrl+Enter)
```

### Opzione 2: Script Locale (Node.js)

```bash
# Setup completo
node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql supabase-ALL-PATCHES.sql

# Verifica configurazione
node scripts/run-sql.mjs supabase-verify-config.sql

# Quick check
node scripts/run-sql.mjs supabase-quick-check.sql
```

### Opzione 3: VS Code Tasks

```
Ctrl+Shift+P → Tasks: Run Task → Seleziona:
- Run SQL: Init schema + patches (local PG)
- Run SQL: Init schema + patches (Supabase Cloud)
- Run SQL: Seeds (local PG – multi)
```

---

## 📋 Checklist Setup Iniziale

- [ ] 1. Esegui `supabase-COMPLETE-SETUP.sql`
- [ ] 2. Esegui `supabase-ALL-PATCHES.sql`
- [ ] 3. Verifica con `supabase-verify-config.sql` (✅ tutto OK)
- [ ] 4. Esegui seed necessari (suppliers, locations, churches)
- [ ] 5. Verifica integrità con `supabase-verify-data-integrity.sql`
- [ ] 6. Quick check finale con `supabase-quick-check.sql` (Health Score > 90)

---

## 🔄 Checklist Manutenzione Periodica

### Giornaliera
- [ ] `supabase-quick-check.sql` - Health check rapido

### Settimanale
- [ ] `supabase-verify-data-integrity.sql` - Controllo integrità
- [ ] `supabase-monitor-activity.sql` - Analytics settimanale

### Mensile
- [ ] `supabase-verify-performance.sql` - Performance audit
- [ ] `supabase-diagnostics-complete.sql` - Full diagnostics
- [ ] `supabase-generate-reports.sql` - Export report mensili

---

## 🆘 Troubleshooting Quick Reference

| Problema | Script da Eseguire |
|----------|-------------------|
| "Database lento" | `supabase-verify-performance.sql` |
| "Dati strani" | `supabase-verify-data-integrity.sql` |
| "Post-deploy check" | `supabase-quick-check.sql` |
| "Setup non funziona" | `supabase-verify-config.sql` |
| "Voglio statistiche" | `supabase-monitor-activity.sql` |
| "Report per cliente" | `supabase-generate-reports.sql` |

---

## 📞 Link Utili

- 📖 [Guida Setup Database](./DATABASE-CONNECTIONS.md)
- 🔗 [Pipeline Deployment](./DEPLOY-TIMELINE-GUIDE.md)
- 🔐 [Security Best Practices](./SECURITY-AND-SEO.md)
- 📝 [Changelog](./CHANGELOG_CURRENT.md)

---

**Ultimo aggiornamento:** 4 Novembre 2025  
**Versione:** 1.0.0  
**Compatibilità:** PostgreSQL 12+, Supabase Cloud/Local
