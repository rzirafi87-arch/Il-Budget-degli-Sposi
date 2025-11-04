#!/usr/bin/env node
/**
 * Script per sincronizzare modifiche SQL da Codex a Supabase Cloud
 * Uso: node scripts/codex-sync-db.mjs <file.sql>
 */

import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const pexec = promisify(exec);

function log(msg, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('it-IT');
  const prefix = {
    info: '🔄',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${msg}`);
}

async function run(cmd, description) {
  log(description, 'info');
  try {
    const { stdout, stderr } = await pexec(cmd);
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('WARNING')) {
      log(`stderr: ${stderr}`, 'warning');
    }
    return { ok: true, stdout, stderr };
  } catch (error) {
    log(`Errore: ${error.message}`, 'error');
    return { ok: false, error };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Uso: node scripts/codex-sync-db.mjs <file.sql>', 'error');
    log('Esempio: node scripts/codex-sync-db.mjs supabase-quick-check.sql', 'info');
    process.exit(1);
  }

  const sqlFile = args[0];
  const sqlPath = path.isAbsolute(sqlFile) ? sqlFile : path.join(process.cwd(), sqlFile);

  // Verifica che il file esista
  if (!fs.existsSync(sqlPath)) {
    log(`File non trovato: ${sqlFile}`, 'error');
    process.exit(1);
  }

  log('═══════════════════════════════════════════════════════', 'info');
  log('CODEX → SUPABASE → GITHUB → VERCEL SYNC', 'info');
  log('═══════════════════════════════════════════════════════', 'info');
  log('', 'info');

  // Step 1: Esegui lo script SQL su Supabase Cloud
  log(`📁 File: ${path.basename(sqlFile)}`, 'info');
  const result = await run(
    `node scripts/run-sql.mjs "${sqlPath}"`,
    '1️⃣ Esecuzione SQL su Supabase Cloud...'
  );

  if (!result.ok) {
    log('', 'info');
    log('⚠️ ERRORE: Impossibile eseguire SQL su Supabase Cloud', 'error');
    log('', 'info');
    log('Possibili cause:', 'warning');
    log('  1. Database Supabase in pausa (vai su app.supabase.com per riattivarlo)', 'warning');
    log('  2. Problema di rete/firewall', 'warning');
    log('  3. Credenziali SUPABASE_DB_URL errate in .env.local', 'warning');
    log('', 'info');
    log('💡 ALTERNATIVE:', 'info');
    log('  ✅ Esegui lo script manualmente nel SQL Editor di Supabase:', 'info');
    log(`     1. Vai su https://app.supabase.com`, 'info');
    log(`     2. SQL Editor → New Query`, 'info');
    log(`     3. Copia/incolla il contenuto di: ${path.basename(sqlFile)}`, 'info');
    log(`     4. Run`, 'info');
    log('', 'info');
    log('Procedo comunque con commit e push del file...', 'info');
    log('', 'info');
  } else {
    log('SQL eseguito con successo!', 'success');
    log('', 'info');
  }

  // Step 2: Git add + commit
  const gitResult = await run(
    'git add -A && git status --porcelain',
    '2️⃣ Verifico modifiche Git...'
  );

  if (!gitResult.ok) {
    log('Errore Git. Continuo comunque...', 'warning');
  } else if (gitResult.stdout.trim()) {
    log(`Modifiche rilevate:\n${gitResult.stdout}`, 'info');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const commitMsg = `auto: sync ${path.basename(sqlFile)} from Codex ${timestamp}`;
    
    const commitResult = await run(
      `git commit -m "${commitMsg}"`,
      '3️⃣ Commit modifiche...'
    );

    if (commitResult.ok) {
      log('Commit creato!', 'success');
    }
  } else {
    log('Nessuna modifica da committare.', 'info');
  }

  log('', 'info');

  // Step 3: Push a GitHub
  const pushResult = await run(
    'git push',
    '4️⃣ Push su GitHub...'
  );

  if (pushResult.ok) {
    log('Push completato!', 'success');
    log('', 'info');
    log('🎯 Vercel riceverà automaticamente il trigger di deploy.', 'success');
  } else {
    log('Push fallito. Verifica la connessione o le credenziali Git.', 'error');
    process.exit(1);
  }

  log('', 'info');
  log('═══════════════════════════════════════════════════════', 'info');
  log('✅ SYNC COMPLETATO CON SUCCESSO!', 'success');
  log('═══════════════════════════════════════════════════════', 'info');
  log('', 'info');
  log('📊 Prossimi passi:', 'info');
  log('   1. Controlla Supabase Dashboard per verificare le modifiche DB', 'info');
  log('   2. Controlla GitHub per il nuovo commit', 'info');
  log('   3. Monitora Vercel per il deploy automatico', 'info');
}

main().catch(err => {
  log(`Errore inaspettato: ${err.message}`, 'error');
  process.exit(1);
});
