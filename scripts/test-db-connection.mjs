#!/usr/bin/env node
import dns from 'node:dns/promises';
import net from 'node:net';

const host = process.env.DB_HOST || 'db.vsguhivizuneylqhygfk.supabase.co';
const ports = (process.env.DB_PORTS || '5432,6543').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);

async function resolveHost(h) {
  try {
    const addrs = await dns.lookup(h, { all: true });
    return addrs.map(a => a.address);
  } catch (e) {
    return { error: e.message };
  }
}

function testPort(h, p, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = (err) => {
      socket.destroy();
      resolve({ port: p, open: false, error: err ? err.message : 'unknown' });
    };
    socket.setTimeout(timeoutMs, () => onError(new Error('timeout')));
    socket.once('error', onError);
    socket.connect(p, h, () => {
      socket.end();
      resolve({ port: p, open: true });
    });
  });
}

(async () => {
  console.log('== DNS resolution ==');
  const resolved = await resolveHost(host);
  console.log(resolved);

  console.log('\n== Port connectivity ==');
  for (const p of ports) {
    const res = await testPort(host, p);
    console.log(res);
  }
})();

