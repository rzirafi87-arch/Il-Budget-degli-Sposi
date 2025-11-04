#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import tty from 'node:tty';
import { Client } from 'pg';

// Load env from .env.local (fall back to .env)
const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
const envDefault = path.join(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

function printUsage() {
  console.log('Usage: npm run sql:exec -- <file.sql> [more.sql ...]');
  console.log('Env:   set SUPABASE_DB_URL in .env.local to your Supabase connection string');
}

async function executeSqlFile(client, filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  const sql = fs.readFileSync(abs, 'utf8');
  const start = Date.now();
  
  // Check if it's a verification/read-only script (no need for transaction)
  const isVerificationScript = /verify|check|diagnostics|monitor|report/i.test(path.basename(filePath));
  
  try {
    if (isVerificationScript) {
      // Execute without transaction for verification scripts
      const result = await client.query(sql);
      const ms = Date.now() - start;
      console.log(`✔ Executed ${path.basename(filePath)} in ${ms}ms`);
      // Show NOTICE messages if any
      if (result && result.rows && result.rows.length > 0) {
        console.log('Results:', result.rows.length, 'rows');
      }
    } else {
      // Use transaction for modification scripts
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      const ms = Date.now() - start;
      console.log(`✔ Executed ${path.basename(filePath)} in ${ms}ms`);
    }
  } catch (err) {
    if (!isVerificationScript) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error(`✖ Failed executing ${path.basename(filePath)}:`);
    console.error(err.message);
    if (err.stack) {
      console.error('Stack:', err.stack.split('\n').slice(0, 3).join('\n'));
    }
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }
  let url = DB_URL;
  
  console.log('🔍 Starting SQL execution...');
  console.log('📁 Files to execute:', args);
  console.log('🔗 DB URL configured:', url ? 'Yes' : 'No');
  
  if (!url) {
    console.error('❌ Missing SUPABASE_DB_URL (or DATABASE_URL) in .env.local');
    console.error('Get it from Supabase Dashboard → Project Settings → Database → Connection string');
    process.exit(1);
  }

  // If the URL contains a YOUR_PASSWORD or YOUR_DB_PASSWORD placeholder, prompt interactively (without saving it to disk)
  if (url.includes('YOUR_PASSWORD') || url.includes('YOUR_DB_PASSWORD')) {
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: isTTY });
    let pwd;
    if (isTTY && process.stdout instanceof tty.WriteStream) {
      // Try no-echo prompt
      process.stdout.write('Enter database password: ');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      pwd = '';
      await new Promise((resolve) => {
        process.stdin.on('data', (chunk) => {
          const ch = chunk.toString('utf8');
          if (ch === '\r' || ch === '\n') {
            process.stdout.write('\n');
            process.stdin.setRawMode(false);
            process.stdin.pause();
            resolve();
          } else if (ch === '\u0003') { // Ctrl+C
            process.stdout.write('\n');
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.exit(1);
          } else if (ch === '\u0008' || ch === '\u007f') { // Backspace
            if (pwd.length > 0) pwd = pwd.slice(0, -1);
          } else {
            pwd += ch;
          }
        });
      });
    } else {
      pwd = await rl.question('Enter database password: ');
      rl.close();
    }
    const enc = encodeURIComponent(pwd);
    url = url.replace('YOUR_PASSWORD', enc).replace('YOUR_DB_PASSWORD', enc);
  }

  // Choose SSL settings: disable for localhost/127.0.0.1, enable (no verify) otherwise
  let sslOption = { rejectUnauthorized: false };
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      sslOption = false;
    }
  } catch {}

  const client = new Client({
    connectionString: url,
    ssl: sslOption,
    application_name: 'il-budget-degli-sposi-sql-runner',
  });
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');
    for (const f of args) {
      await executeSqlFile(client, f);
    }
    console.log('✅ All done.');
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error('❌ Unhandled error in main():', err?.message || err);
  process.exitCode = 1;
});
