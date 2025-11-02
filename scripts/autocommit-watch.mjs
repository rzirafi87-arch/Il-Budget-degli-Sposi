#!/usr/bin/env node
/**
 * Auto-commit + push watcher (cross-platform, no extra deps)
 * - Polls git working tree every INTERVAL and commits if there are changes
 * - Uses env AUTOCOMMIT_INTERVAL_MS to override interval (default 300000 = 5 min)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(exec);
const INTERVAL = Number(process.env.AUTOCOMMIT_INTERVAL_MS || 300000); // 5 minutes default
let running = false;

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return ts;
}

async function hasChanges() {
  const { stdout } = await pexec('git status --porcelain');
  return stdout.trim().length > 0;
}

async function run(cmd) {
  try {
    const { stdout, stderr } = await pexec(cmd);
    return { ok: true, stdout, stderr };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function commitAndPush() {
  if (running) return;
  running = true;
  try {
    const changed = await hasChanges();
    if (!changed) return; // nothing to do

    await run('git add -A');
    const msg = `auto: save ${now()}`;
    const commitRes = await run(`git commit -m "${msg}"`);

    // If no changes to commit, commitRes.ok may be false; continue to push anyway
    const pushRes = await run('git push');

    // Basic console output for visibility (keep it quiet if clean)
    console.log(`[autocommit] ${now()} → commit: ${commitRes.ok ? 'OK' : 'SKIP'} | push: ${pushRes.ok ? 'OK' : 'OK/UP-TO-DATE'}`);
  } catch (e) {
    console.error('[autocommit] error:', e?.message || e);
  } finally {
    running = false;
  }
}

console.log(`[autocommit] Started. Interval: ${INTERVAL} ms`);

// Kick off immediately, then at interval
commitAndPush();
const timer = setInterval(commitAndPush, INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[autocommit] Stopping...');
  clearInterval(timer);
  process.exit(0);
});
