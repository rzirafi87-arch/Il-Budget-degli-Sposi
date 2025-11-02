#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testLocalDB() {
  console.log('\n🔌 Connessione al database locale (Docker)...\n');
  const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:5433/ibds',
    ssl: false,
    application_name: 'il-budget-test-connection',
  });

  try {
    await client.connect();
    console.log('✅ DATABASE LOCALE CONNESSO');
    
    const version = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL: ${version.rows[0].version.split(' ')[1]}`);
    
    const dbInfo = await client.query('SELECT current_database(), current_user');
    console.log(`📁 Database: ${dbInfo.rows[0].current_database}`);
    console.log(`👤 User: ${dbInfo.rows[0].current_user}`);
    
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`\n📋 Tabelle nel database (${tables.rows.length}):`);
    if (tables.rows.length > 0) {
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.tablename}`);
      });
    } else {
      console.log('   ⚠️  Nessuna tabella trovata (database vuoto)');
    }
    
    await client.end();
  } catch (err) {
    console.error('❌ ERRORE connessione locale:', err.message);
    throw err;
  }
}

async function testCloudDB() {
  console.log('\n\n🌐 Connessione al database Supabase Cloud...\n');
  
  const cloudUrl = process.env.SUPABASE_DB_URL;
  if (!cloudUrl || cloudUrl.includes('YOUR_PASSWORD')) {
    console.log('⚠️  SUPABASE_DB_URL non configurato o con placeholder');
    return;
  }

  const client = new Client({
    connectionString: cloudUrl,
    ssl: cloudUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    application_name: 'il-budget-test-connection',
  });

  try {
    await client.connect();
    console.log('✅ SUPABASE CLOUD CONNESSO');
    
    const version = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL: ${version.rows[0].version.split(' ')[1]}`);
    
    const dbInfo = await client.query('SELECT current_database(), current_user');
    console.log(`📁 Database: ${dbInfo.rows[0].current_database}`);
    console.log(`👤 User: ${dbInfo.rows[0].current_user}`);
    
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`\n📋 Tabelle nel database (${tables.rows.length}):`);
    if (tables.rows.length > 0) {
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.tablename}`);
      });
    } else {
      console.log('   ⚠️  Nessuna tabella trovata');
    }
    
    await client.end();
  } catch (err) {
    console.error('❌ ERRORE connessione cloud:', err.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 Test Connessioni Database - Il Budget degli Sposi');
  console.log('═══════════════════════════════════════════════════');
  
  await testLocalDB();
  await testCloudDB();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ Test completato!');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('💡 Strumenti disponibili:');
  console.log('   • Adminer (GUI): http://localhost:8080');
  console.log('   • Supabase Dashboard: https://vsguhivizuneylqhygfk.supabase.co');
  console.log('   • Script SQL: npm run sql:exec -- <file.sql>');
  console.log('   • VS Code Tasks: vedi tasks.json\n');
}

main().catch(err => {
  console.error('\n💥 Errore fatale:', err);
  process.exit(1);
});
