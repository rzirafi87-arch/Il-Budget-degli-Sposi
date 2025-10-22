import { createClient } from "@supabase/supabase-js";

// Client per il BROWSER: usa anon key (contesto utente)
export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      `Missing Supabase env vars: ${
        !url ? "NEXT_PUBLIC_SUPABASE_URL " : ""
      }${!anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`.trim()
    );
  }

  return createClient(url, anonKey, { auth: { persistSession: true } });
}

// Client SERVICE (SOLO server): usa service role key (non esce mai sul client)
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceRole) {
    throw new Error(
      `Missing Supabase env vars: ${
        !url ? "NEXT_PUBLIC_SUPABASE_URL " : ""
      }${!serviceRole ? "SUPABASE_SERVICE_ROLE" : ""}`.trim()
    );
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

