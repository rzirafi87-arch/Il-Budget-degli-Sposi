"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

export default function Home() {
  const [status, setStatus] = useState<"idle" | "checking" | "creating" | "redirect">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Senza autenticazione, redirect diretto al budget con dati demo
        setStatus("redirect");
        window.location.assign("/budget");
        return;
      }

      setStatus("checking");

      const jwt = data.session.access_token;
      const res = await fetch("/api/event/ensure-default", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` }
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error || `HTTP ${res.status}`);
        setStatus("idle");
        return;
      }

      const j = await res.json();
      if (j?.ok && j?.eventId) {
        setStatus("redirect");
        window.location.assign("/budget");
      } else {
        setError("Impossibile determinare l'evento");
        setStatus("idle");
      }
    })();
  }, []);

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-3xl font-bold">Il Budget degli Sposi</h1>
      <p>Controllo il tuo evento…</p>
      {status === "checking" && <p>Verifica in corso…</p>}
      {status === "redirect" && <p>Reindirizzo al budget…</p>}
      {error && <p className="text-red-600">Errore: {error}</p>}
    </main>
  );
}
