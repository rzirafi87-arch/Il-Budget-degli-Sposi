#!/usr/bin/env node

/**
 * Script di verifica applicazione PATCHES 2025-11 (PATCH 16-19)
 *
 * Esegue controlli su Supabase Cloud per verificare se i 4 patches critici
 * sono stati applicati correttamente.
 *
 * Usage:
 *   node scripts/verify-2025-11-patches.mjs
 *
 * Environment:
 *   SUPABASE_DB_URL - Connection string PostgreSQL Supabase Cloud
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { Client } = pg;

const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error('❌ ERRORE: SUPABASE_DB_URL non configurato in .env.local');
  console.error('');
  console.error('Configura la connection string PostgreSQL:');
  console.error('  SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres');
  process.exit(1);
}

console.log('🔍 VERIFICA PATCHES 2025-11 (PATCH 16-19)');
console.log('==========================================');
console.log('');

async function runVerification() {
  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    console.log('✅ Connesso a Supabase Cloud\n');

    // Esegui script SQL di verifica
    const sqlPath = join(dirname(__dirname), 'supabase-verify-2025-11-patches.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Rimuovi comandi \echo che non sono supportati da node-postgres
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('\\echo'))
      .join('\n');

    const result = await client.query(cleanSql);

    // Mostra risultati
    if (result && Array.isArray(result)) {
      result.forEach((res, idx) => {
        if (res.rows && res.rows.length > 0) {
          console.log(`\n📋 Check ${idx + 1}:`);
          console.table(res.rows);
        }
      });
    } else if (result.rows) {
      console.table(result.rows);
    }

    console.log('\n✅ Verifica completata!\n');

  } catch (err) {
    console.error('❌ ERRORE durante la verifica:');
    console.error(err.message);
    console.error('');
    console.error('Possibili cause:');
    console.error('  - Connection string non valida');
    console.error('  - Database non raggiungibile');
    console.error('  - Permessi insufficienti');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Esegui verifica semplificata manuale se pg query non funziona come previsto
async function runSimpleChecks() {
  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    console.log('✅ Connesso a Supabase Cloud\n');

    const checks = [
      {
        name: 'PATCH 16: owner_id NOT NULL',
        query: `
          SELECT is_nullable = 'NO' AS passed
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'owner_id'
        `
      },
      {
        name: 'PATCH 16: RLS abilitato su events',
        query: `
          SELECT relrowsecurity AS passed
          FROM pg_class
          WHERE relname = 'events' AND relnamespace = 'public'::regnamespace
        `
      },
      {
        name: 'PATCH 16: Policy SELECT esistente',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'events'
            AND policyname = 'Users can view their own events'
        `
      },
      {
        name: 'PATCH 17: Funzione set_owner_id_from_jwt()',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM pg_proc
          WHERE proname = 'set_owner_id_from_jwt' AND pronamespace = 'public'::regnamespace
        `
      },
      {
        name: 'PATCH 17: Trigger trg_set_owner_id',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM pg_trigger
          WHERE tgname = 'trg_set_owner_id' AND tgrelid = 'public.events'::regclass
        `
      },
      {
        name: 'PATCH 18: Tabella event_types',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'event_types'
        `
      },
      {
        name: 'PATCH 18: Colonna type_id in categories',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'type_id'
        `
      },
      {
        name: 'PATCH 18: Tabella timeline_items',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'timeline_items'
        `
      },
      {
        name: 'PATCH 19: Funzione auto_populate_event_data()',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM pg_proc
          WHERE proname = 'auto_populate_event_data' AND pronamespace = 'public'::regnamespace
        `
      },
      {
        name: 'PATCH 19: Trigger trg_auto_populate_event',
        query: `
          SELECT COUNT(*) > 0 AS passed
          FROM pg_trigger
          WHERE tgname = 'trg_auto_populate_event' AND tgrelid = 'public.events'::regclass
        `
      }
    ];

    let allPassed = true;
    const results = [];

    for (const check of checks) {
      try {
        const result = await client.query(check.query);
        const passed = result.rows[0]?.passed === true || result.rows[0]?.passed === 't';
        results.push({ check: check.name, status: passed ? '✅ PASS' : '❌ FAIL' });
        if (!passed) allPassed = false;
      } catch (err) {
        results.push({ check: check.name, status: `❌ ERROR: ${err.message}` });
        allPassed = false;
      }
    }

    console.table(results);

    console.log('\n📊 RIEPILOGO:');
    if (allPassed) {
      console.log('✅ TUTTI I PATCHES 2025-11 SONO APPLICATI CORRETTAMENTE!\n');
    } else {
      console.log('⚠️ ALCUNI PATCHES NON SONO APPLICATI\n');
      console.log('Patches da applicare in ordine:');
      console.log('  1. supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql');
      console.log('  2. supabase-2025-11-events-owner-trigger.sql');
      console.log('  3. supabase-2025-11-event-types-schema-v2.sql');
      console.log('  4. supabase-2025-11-auto-populate-triggers.sql\n');

      console.log('Esegui tramite:');
      console.log('  - Supabase Dashboard → SQL Editor (consigliato)');
      console.log('  - Task VS Code: "🤖 Codex: Sync Current SQL to Cloud"\n');
    }

  } catch (err) {
    console.error('❌ ERRORE durante la verifica:');
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Esegui verifica
runSimpleChecks().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
