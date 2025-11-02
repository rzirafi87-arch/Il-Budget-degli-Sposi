import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceRole) {
    throw new Error(
      `Missing Supabase env vars: ${!url ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${
        !serviceRole ? "SUPABASE_SERVICE_ROLE" : ""
      }`.trim()
    );
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

