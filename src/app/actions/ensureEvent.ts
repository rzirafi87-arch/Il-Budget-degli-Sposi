"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Action: Garantisce che l'utente autenticato abbia un evento di default.
 * Se non esiste, lo crea automaticamente.
 * 
 * @returns {Promise<string>} ID dell'evento (esistente o appena creato)
 * @throws {Error} Se l'utente non è autenticato o creazione fallisce
 */
export async function ensureDefaultEvent(): Promise<string> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return cookieStore.get(key)?.value;
        },
      },
    }
  );

  // Verifica autenticazione
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // Controlla se esiste già un evento per questo utente
  const { data: existing, error: fetchError } = await supabase
    .from("events")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch events: ${fetchError.message}`);
  }

  // Se esiste, ritorna l'ID
  if (existing) {
    return existing.id;
  }

  // Altrimenti, crea un nuovo evento di default
  const public_id = Math.random().toString(36).slice(2, 10);
  
  const { data: newEvent, error: insertError } = await supabase
    .from("events")
    .insert({
      public_id,
      owner_id: user.id,
      name: "Il mio evento",
      event_type: "WEDDING", // Default type
      event_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 anno
      total_budget: 20000, // Budget iniziale suggerito
      bride_initial_budget: 10000,
      groom_initial_budget: 10000,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Failed to create default event: ${insertError.message}`);
  }

  return newEvent.id;
}
