#!/usr/bin/env node
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(exec);

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function hasChanges() {
  const { stdout } = await pexec('git status --porcelain');
  return stdout.trim().length > 0;
}

async function run(cmd) {
  try {
    const { stdout, stderr } = await pexec(cmd);
    return { ok: true, stdout, stderr };
  } catch (error) {
    return { ok: false, error };
  }
}

(async () => {
  try {
    const changed = await hasChanges();
    if (changed) {
      await run('git add -A');
      const msg = `auto: save ${now()}`;
      await run(`git commit -m "${msg}"`);
    }
    const pushRes = await run('git push');
    if (!pushRes.ok) {
      console.error('[autocommit-once] push failed:', pushRes.error?.message || pushRes.error);
    }
  } catch (e) {
    console.error('[autocommit-once] error:', e?.message || e);
  } finally {
    // Always exit 0 so chained npm scripts continue
    process.exit(0);
  }
})();
