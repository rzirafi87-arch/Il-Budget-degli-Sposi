import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance per il browser client
let browserClient: SupabaseClient | null = null;

// Client per il BROWSER: usa anon key (contesto utente)
export function getBrowserClient() {
  // Riutilizza l'istanza esistente se già creata
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      `Missing Supabase env vars: ${
        !url ? "NEXT_PUBLIC_SUPABASE_URL " : ""
      }${!anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`.trim()
    );
  }

  browserClient = createClient(url, anonKey, { 
    auth: { 
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    } 
  });

  return browserClient;
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

