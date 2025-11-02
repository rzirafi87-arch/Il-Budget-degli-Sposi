#!/usr/bin/env node
/**
 * 🔌 Quick Database Connection Launcher
 * Apre le connessioni PostgreSQL in VS Code
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const CONNECTIONS = {
  local: {
    name: '🐘 Local PostgreSQL (Docker)',
    connectionString: 'postgres://postgres:postgres@localhost:5433/ibds',
    ssl: false,
    color: '🟢',
  },
  cloud: {
    name: '☁️ Supabase Cloud',
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: process.env.SUPABASE_DB_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
    color: '🔵',
  },
};

async function testConnection(name, connString, ssl) {
  const client = new Client({
    connectionString: connString,
    ssl: ssl,
    application_name: 'il-budget-connection-launcher',
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT 
        current_database() as db,
        current_user as user,
        version() as version,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
    `);
    await client.end();
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🗄️  DATABASE CONNECTION LAUNCHER                        ║');
  console.log('║  Il Budget degli Sposi - PostgreSQL Connections          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  for (const [, config] of Object.entries(CONNECTIONS)) {
    if (!config.connectionString || config.connectionString.includes('YOUR_PASSWORD')) {
      console.log(`${config.color} ${config.name}`);
      console.log(`   ⚠️  Non configurato\n`);
      continue;
    }

    console.log(`${config.color} ${config.name}`);
    console.log(`   🔄 Connessione in corso...`);
    
    const result = await testConnection(config.name, config.connectionString, config.ssl);
    
    if (result.success) {
      console.log(`   ✅ CONNESSO`);
      console.log(`   📁 Database: ${result.data.db}`);
      console.log(`   👤 User: ${result.data.user}`);
      console.log(`   📊 Tabelle: ${result.data.table_count}`);
      console.log(`   🔧 Versione: PostgreSQL ${result.data.version.split(' ')[1]}`);
    } else {
      console.log(`   ❌ ERRORE: ${result.error}`);
    }
    console.log('');
  }

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  📚 STRUMENTI DISPONIBILI                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('🌐 Interfacce Web:');
  console.log('   • Adminer (locale):    http://localhost:8080');
  console.log('     Server: db | User: postgres | Password: postgres | DB: ibds');
  console.log('   • Supabase Dashboard:  https://vsguhivizuneylqhygfk.supabase.co\n');
  
  console.log('📝 VS Code Extensions:');
  console.log('   • PostgreSQL (ms-ossdata.vscode-pgsql)');
  console.log('   • SQL Server (ms-mssql.mssql)');
  console.log('   • Database Projects (ms-mssql.sql-database-projects-vscode)\n');
  
  console.log('⚡ Quick Commands:');
  console.log('   • Test connessioni:    node test-db-connection.mjs');
  console.log('   • Esegui SQL:          node scripts/run-sql.mjs <file.sql>');
  console.log('   • Init schema locale:  npm run task (scegli init task)\n');
  
  console.log('🗂️ Database Project:');
  console.log('   • Location: ./database/il-budget-sposi.sqlproj');
  console.log('   • Schema: ./database/README.md\n');
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
