#!/usr/bin/env node
import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

// Load env from .env.local (priority), then fallback to .env
const candidates = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: false });
    break;
  }
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE",
];

let ok = true;
for (const key of required) {
  if (!process.env[key] || String(process.env[key]).trim() === "") {
    console.error(`Missing env: ${key}`);
    ok = false;
  }
}

if (!ok) {
  console.error("\nSet the missing variables in .env.local or Vercel Project Settings.");
  process.exit(1);
} else {
  console.log("All required env vars are set.");
}
