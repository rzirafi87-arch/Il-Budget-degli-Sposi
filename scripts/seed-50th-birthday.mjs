#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
const envDefault = path.join(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const SQL_FILENAME = 'supabase-50th-birthday-seed.sql';
const PLACEHOLDER = 'UUID_50TH_EVENT';

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function loadSqlTemplate() {
  const abs = path.join(cwd, SQL_FILENAME);
  if (!fs.existsSync(abs)) {
    fail(`File SQL non trovato: ${SQL_FILENAME}`);
  }
  return fs.readFileSync(abs, 'utf8');
}

async function executeSql(client, sql) {
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function getLatestEventId(client) {
  const { rows } = await client.query(
    "SELECT id FROM events WHERE event_type = 'birthday-50' ORDER BY created_at DESC LIMIT 1;"
  );
  if (!rows.length) {
    fail("Impossibile recuperare l'ID dell'evento 'birthday-50'.");
  }
  return rows[0].id;
}

async function main() {
  if (!DB_URL) {
    fail('Devi impostare SUPABASE_DB_URL (o DATABASE_URL) in .env.local');
  }

  const sqlTemplate = loadSqlTemplate();
  const hasPlaceholder = sqlTemplate.includes(PLACEHOLDER);

  let sslOption = { rejectUnauthorized: false };
  try {
    const u = new URL(DB_URL);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      sslOption = false;
    }
  } catch {}

  const client = new Client({
    connectionString: DB_URL,
    ssl: sslOption,
    application_name: 'il-budget-degli-sposi-50th-seed',
  });

  try {
    await client.connect();

    console.log('▶️ Passo 1/2: creazione (o verifica) evento 50° compleanno...');
    await executeSql(client, sqlTemplate);
    const eventId = await getLatestEventId(client);
    console.log(`   → ID evento: ${eventId}`);

    if (hasPlaceholder) {
      console.log('▶️ Passo 2/2: popolamento categorie e sottocategorie...');
      const sqlWithId = sqlTemplate.replaceAll(PLACEHOLDER, eventId);
      await executeSql(client, sqlWithId);
      console.log('   → Popolamento completato.');
    } else {
      console.log('ℹ️ Il file SQL non contiene il placeholder, salto il secondo passaggio.');
    }

    console.log('\n✔ Seed 50° compleanno eseguito con successo.');
  } catch (err) {
    console.error('\n✖ Errore durante l\'esecuzione del seed:');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
