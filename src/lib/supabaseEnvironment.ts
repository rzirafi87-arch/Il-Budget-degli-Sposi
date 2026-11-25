/** Server-side configuration validation. Never include credential values in errors. */
export function assertSupabaseEnvironment(url: string, serviceKey: string, expectedRef?: string) {
  let project: string | undefined;
  try { project = new URL(url).hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1]; }
  catch { throw new Error('SUPABASE_URL_INVALID'); }
  if (expectedRef && project !== expectedRef) throw new Error('SUPABASE_PROJECT_MISMATCH');
  // Legacy service-role JWTs carry their issuing project. Opaque secret keys
  // require the provider's validation and must never be decoded or logged.
  if (serviceKey.split('.').length === 3) {
    let payload: { ref?: string; role?: string };
    try { payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64url').toString('utf8')); }
    catch { throw new Error('SUPABASE_SERVER_KEY_INVALID'); }
    if (payload.role !== 'service_role') throw new Error('SUPABASE_SERVER_KEY_ROLE_INVALID');
    if (project && payload.ref !== project) throw new Error('SUPABASE_SERVER_KEY_PROJECT_MISMATCH');
  }
}
