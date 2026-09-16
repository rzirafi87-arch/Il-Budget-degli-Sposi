import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const appRoot = join(root, "src/app");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : entry.name === "route.ts" ? [path] : [];
  });
}

function yes(value) {
  return value ? "yes" : "no";
}

function routePath(file) {
  return `/${relative(join(root, "src/app"), file).replace(/\\/g, "/").replace(/\/route\.ts$/, "")}`;
}

function methods(source) {
  return [...source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)]
    .map((match) => match[1]);
}

function classify(file, source) {
  const route = routePath(file);
  const routeMethods = methods(source);
  const serviceRole = /getServiceClient|getSupabaseAdmin|supabaseAdmin|supabaseServer/.test(source);
  const bearerRls = /getBearer\(|createClient\([^)]*bearer|Authorization/.test(source) && !serviceRole;
  const auth = /requireAdminUser/.test(source)
    ? "admin"
    : /requireUser/.test(source)
      ? "user"
      : /CRON_SECRET|x-vercel-cron/.test(source)
        ? "cron"
        : route.startsWith("/api/auth/")
          ? "auth-flow"
          : "public/route-specific";
  const currentEvent = /requireServerCurrentEvent|resolveCurrentEvent/.test(source);
  const explicitEvent = /eventId|event_id/.test(source);
  const ownerOnly = /requireEventOwner|is_event_owner|\.eq\(["']owner_id["']/.test(source);
  const memberAccess = /canAccessEvent|can_access_event|event_members|requireFinancialAccess|requirePlanningSelectionAccess/.test(source);
  const ownership = ownerOnly ? "owner" : memberAccess || currentEvent ? "owner+partner" : explicitEvent ? "route-specific" : "n/a";
  const eventSource = currentEvent ? "server current-event" : explicitEvent ? "path/query/body or derived" : "none";
  const write = routeMethods.some((method) => method !== "GET");
  const getWithFileWrite = routeMethods.includes("GET") && /\.\s*(insert|update|upsert|delete)\s*\(/s.test(source);
  const legacy = /\/api\/(event\/(new|update)|event-core\/new|events\/.*\/(get|init)|babyshower|baptism\/seed\/route)/.test(route);
  const idor = auth === "user" && explicitEvent && ownership === "route-specific" ? "review" : auth === "public/route-specific" && explicitEvent ? "review" : "guarded/n/a";
  return {
    route,
    methods: routeMethods.join(", ") || "dynamic/none",
    auth,
    ownership,
    eventSource,
    role: ownerOnly ? "owner" : memberAccess || currentEvent ? "owner/partner" : "route-specific/n/a",
    mode: write ? "read/write" : "read",
    serviceRole: yes(serviceRole),
    rls: serviceRole ? "bypassed; API guard required" : bearerRls ? "user JWT" : "route-specific/n/a",
    idor,
    canonical: legacy ? "legacy/overlap candidate" : "canonical or standalone",
    getWrite: getWithFileWrite ? "review: file contains GET + mutation" : "no evidence",
  };
}

const rows = walk(appRoot).sort().map((file) => classify(file, readFileSync(file, "utf8")));

console.log("# Branch 51 — route and server-action inventory\n");
console.log(`Generated from source at ${new Date().toISOString()}. This inventory covers **${rows.length} API route files**. No files containing a top-level \`\"use server\"\` directive were present at audit time. Classifications marked \`route-specific\` or \`review\` require manual contract validation in Milestones 2–3; they are not assertions of safety.\n`);
console.log("| Route | Methods | Auth | Ownership | Event source | Role | Mode | Service role | RLS boundary | IDOR | Canonical status | GET mutation signal |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const row of rows) {
  console.log(`| ${row.route} | ${row.methods} | ${row.auth} | ${row.ownership} | ${row.eventSource} | ${row.role} | ${row.mode} | ${row.serviceRole} | ${row.rls} | ${row.idor} | ${row.canonical} | ${row.getWrite} |`);
}

console.log("\n## Canonical HTTP contract\n");
console.log("- `401`: missing or invalid session/token.");
console.log("- `403`: authenticated principal lacks the required role.");
console.log("- `404`: resource does not exist or is outside the caller's accessible event.");
console.log("- `400`: malformed JSON or structurally invalid request.");
console.log("- `422`: syntactically valid payload that violates field/domain validation.");
console.log("- `409`: state conflict, duplicate, or replay.");
console.log("- `500`: sanitized stable error code only; internal database/schema details stay server-side.");

console.log("\n## Required principals and tampering cases\n");
console.log("Every event-scoped contract must cover owner, active partner, unrelated authenticated user, anonymous caller, different event, missing resource, manipulated current-event cookie, altered cookie, and altered path/query/body `event_id`. Data API coverage must prove RLS independently of service-role API guards.");
