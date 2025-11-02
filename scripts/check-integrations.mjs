#!/usr/bin/env node

/**
 * Script di verifica connessioni
 * Controlla che tutte le integrazioni (GitHub, Supabase, Vercel) siano configurate correttamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica variabili d'ambiente da .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(condition) {
  return condition ? '✅' : '❌';
}

async function checkEnvironmentVariables() {
  log('\n📋 Controllo Variabili d\'Ambiente', 'cyan');
  log('━'.repeat(50), 'cyan');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE',
  ];

  const optionalVars = [
    'SUPABASE_DB_URL',
    'NEXT_PUBLIC_SITE_URL',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
  ];

  let allRequired = true;

  for (const varName of requiredVars) {
    const exists = !!process.env[varName];
    log(`${checkMark(exists)} ${varName}`, exists ? 'green' : 'red');
    if (!exists) allRequired = false;
  }

  log('\nOpzionali:', 'yellow');
  for (const varName of optionalVars) {
    const exists = !!process.env[varName];
    log(`${checkMark(exists)} ${varName}`, exists ? 'green' : 'yellow');
  }

  return allRequired;
}

async function checkSupabaseConnection() {
  log('\n🗄️  Controllo Connessione Supabase', 'cyan');
  log('━'.repeat(50), 'cyan');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    log('❌ Credenziali Supabase mancanti', 'red');
    return false;
  }

  try {
    const supabase = createClient(url, anonKey);
    
    // Test connessione
    const { error } = await supabase.from('events').select('count').limit(1);
    
    if (error) {
      log(`❌ Errore connessione: ${error.message}`, 'red');
      return false;
    }

    log('✅ Connessione Supabase OK', 'green');
    log(`   URL: ${url}`, 'blue');
    
    // Verifica tabelle principali
    const tables = ['events', 'categories', 'subcategories', 'expenses', 'incomes'];
    log('\n   Tabelle:', 'yellow');
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1);
      log(`   ${checkMark(!tableError)} ${table}`, tableError ? 'red' : 'green');
    }

    return true;
  } catch (error) {
    log(`❌ Errore: ${error.message}`, 'red');
    return false;
  }
}

async function checkVercelConfiguration() {
  log('\n🚀 Controllo Configurazione Vercel', 'cyan');
  log('━'.repeat(50), 'cyan');

  const vercelProjectPath = path.join(__dirname, '..', '.vercel', 'project.json');
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');

  // Check project.json
  if (fs.existsSync(vercelProjectPath)) {
    try {
      const projectData = JSON.parse(fs.readFileSync(vercelProjectPath, 'utf-8'));
      log('✅ Progetto Vercel linkato', 'green');
      log(`   Project ID: ${projectData.projectId}`, 'blue');
      log(`   Org ID: ${projectData.orgId}`, 'blue');
      log(`   Nome: ${projectData.projectName}`, 'blue');
    } catch {
      log('❌ Errore lettura project.json', 'red');
    }
  } else {
    log('⚠️  Progetto non linkato a Vercel', 'yellow');
    log('   Esegui: vercel link', 'yellow');
  }

  // Check vercel.json
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      log('✅ vercel.json presente', 'green');
      log(`   Framework: ${config.framework}`, 'blue');
      log(`   Regions: ${config.regions?.join(', ')}`, 'blue');
      
      if (config.crons?.length > 0) {
        log(`   Cron jobs: ${config.crons.length} configurati`, 'blue');
      }
    } catch {
      log('❌ Errore lettura vercel.json', 'red');
    }
  } else {
    log('❌ vercel.json non trovato', 'red');
  }

  return fs.existsSync(vercelProjectPath) && fs.existsSync(vercelConfigPath);
}

async function checkGitConfiguration() {
  log('\n🐙 Controllo Configurazione Git/GitHub', 'cyan');
  log('━'.repeat(50), 'cyan');

  const gitPath = path.join(__dirname, '..', '.git');
  
  if (!fs.existsSync(gitPath)) {
    log('❌ Repository Git non inizializzato', 'red');
    return false;
  }

  log('✅ Repository Git inizializzato', 'green');

  // Check .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    const importantIgnores = ['.env.local', 'node_modules', '.next', '.vercel'];
    
    log('\n   File sensibili ignorati:', 'yellow');
    for (const item of importantIgnores) {
      const isIgnored = gitignore.includes(item);
      log(`   ${checkMark(isIgnored)} ${item}`, isIgnored ? 'green' : 'red');
    }
  }

  // Check GitHub workflows
  const workflowsPath = path.join(__dirname, '..', '.github', 'workflows');
  if (fs.existsSync(workflowsPath)) {
    const workflows = fs.readdirSync(workflowsPath);
    log(`\n   GitHub Actions: ${workflows.length} workflow trovati`, 'blue');
    workflows.forEach(w => log(`   • ${w}`, 'blue'));
  } else {
    log('\n   ⚠️  Nessun GitHub Action configurato', 'yellow');
  }

  return true;
}

async function checkVSCodeConfiguration() {
  log('\n💻 Controllo Configurazione VS Code', 'cyan');
  log('━'.repeat(50), 'cyan');

  const vscodeDir = path.join(__dirname, '..', '.vscode');
  
  if (!fs.existsSync(vscodeDir)) {
    log('❌ Cartella .vscode non trovata', 'red');
    return false;
  }

  const requiredFiles = [
    'extensions.json',
    'settings.json',
    'tasks.json',
  ];

  let allPresent = true;
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(vscodeDir, file));
    log(`${checkMark(exists)} ${file}`, exists ? 'green' : 'red');
    if (!exists) allPresent = false;
  }

  // Check estensioni raccomandate
  const extensionsPath = path.join(vscodeDir, 'extensions.json');
  if (fs.existsSync(extensionsPath)) {
    try {
      const extensions = JSON.parse(fs.readFileSync(extensionsPath, 'utf-8'));
      log(`\n   Estensioni raccomandate: ${extensions.recommendations?.length || 0}`, 'blue');
      
      const keyExtensions = [
        'github.copilot',
        'supabase.vscode-supabase-extension',
        'ms-ossdata.vscode-pgsql',
        'frenco.vscode-vercel',
      ];
      
      log('   Estensioni chiave:', 'yellow');
      for (const ext of keyExtensions) {
        const hasExt = extensions.recommendations?.includes(ext);
        log(`   ${checkMark(hasExt)} ${ext}`, hasExt ? 'green' : 'yellow');
      }
    } catch {
      log('   ⚠️  Errore lettura extensions.json', 'yellow');
    }
  }

  return allPresent;
}

async function checkDatabaseSchema() {
  log('\n🏗️  Controllo Schema Database', 'cyan');
  log('━'.repeat(50), 'cyan');

  const sqlFiles = [
    'supabase-COMPLETE-SETUP.sql',
    'supabase-ALL-PATCHES.sql',
    'supabase-seed-functions.sql',
  ];

  let allPresent = true;
  for (const file of sqlFiles) {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    log(`${checkMark(exists)} ${file}`, exists ? 'green' : 'red');
    if (!exists) allPresent = false;
  }

  return allPresent;
}

async function checkDocumentation() {
  log('\n📚 Controllo Documentazione', 'cyan');
  log('━'.repeat(50), 'cyan');

  const docs = [
    { file: 'README.md', name: 'README principale' },
    { file: '.vscode/SETUP-EXTENSIONS.md', name: 'Guida estensioni VS Code' },
    { file: '.github/INTEGRATION-GUIDE.md', name: 'Guida integrazione piattaforme' },
    { file: '.github/GIT-WORKFLOW.md', name: 'Workflow Git' },
    { file: 'DEPLOYMENT-GUIDE.md', name: 'Guida deployment' },
  ];

  for (const doc of docs) {
    const exists = fs.existsSync(path.join(__dirname, '..', doc.file));
    log(`${checkMark(exists)} ${doc.name}`, exists ? 'green' : 'yellow');
  }

  return true;
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'magenta');
  log('║   VERIFICA INTEGRAZIONI - IL BUDGET SPOSI      ║', 'magenta');
  log('╚════════════════════════════════════════════════╝', 'magenta');

  const results = {
    env: await checkEnvironmentVariables(),
    supabase: await checkSupabaseConnection(),
    vercel: await checkVercelConfiguration(),
    git: await checkGitConfiguration(),
    vscode: await checkVSCodeConfiguration(),
    schema: await checkDatabaseSchema(),
    docs: await checkDocumentation(),
  };

  log('\n' + '═'.repeat(50), 'magenta');
  log('📊 RIEPILOGO', 'magenta');
  log('═'.repeat(50), 'magenta');

  log(`\n${checkMark(results.env)} Variabili d'ambiente`, results.env ? 'green' : 'red');
  log(`${checkMark(results.supabase)} Connessione Supabase`, results.supabase ? 'green' : 'red');
  log(`${checkMark(results.vercel)} Configurazione Vercel`, results.vercel ? 'green' : 'yellow');
  log(`${checkMark(results.git)} Git/GitHub`, results.git ? 'green' : 'red');
  log(`${checkMark(results.vscode)} VS Code`, results.vscode ? 'green' : 'yellow');
  log(`${checkMark(results.schema)} Schema database`, results.schema ? 'green' : 'red');
  log(`${checkMark(results.docs)} Documentazione`, results.docs ? 'green' : 'green');

  const allGood = Object.values(results).every(r => r === true);

  if (allGood) {
    log('\n🎉 Tutte le verifiche sono passate!', 'green');
    log('Il progetto è configurato correttamente.\n', 'green');
  } else {
    log('\n⚠️  Alcune verifiche hanno fallito.', 'yellow');
    log('Consulta le guide in .vscode/ e .github/ per risolvere.\n', 'yellow');
  }

  process.exit(allGood ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Errore fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
