const SERVER_ONLY_ENV_KEYS = new Set([
  "PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
]);

/**
 * Playwright's Node test runner may administer marked QA fixtures, but the
 * Chromium child process must never inherit a Supabase service-role secret.
 */
export function browserProcessEnv(source: NodeJS.ProcessEnv = process.env): Record<string, string> {
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] => Boolean(entry[1]) && !SERVER_ONLY_ENV_KEYS.has(entry[0]),
    ),
  );
}
