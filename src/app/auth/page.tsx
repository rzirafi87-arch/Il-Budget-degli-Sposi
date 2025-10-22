"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [brideBudget, setBrideBudget] = useState<number | "">("");
  const [groomBudget, setGroomBudget] = useState<number | "">("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryEmail: email,
          partnerEmail,
          password,
          brideBudget: brideBudget === "" ? 0 : Number(brideBudget),
          groomBudget: groomBudget === "" ? 0 : Number(groomBudget),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setErr(j.error || "Registrazione non riuscita");
      } else {
        // Chiediamo all'utente di controllare le email (attivazione partner)
        window.alert("Registrazione creata. Controlla la tua casella email e quella del partner per attivare il profilo.");
        window.location.assign("/");
      }
    } catch (e: any) {
      setErr(e?.message || "Errore inatteso");
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      window.location.assign("/");
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/");
      }
    });
  }, []);

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Accedi o registrati</h1>
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Email partner"
        type="email"
        value={partnerEmail}
        onChange={e => setPartnerEmail(e.target.value)}
      />
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <div>
          <label className="text-xs text-gray-600">Budget iniziale Sposa (€)</label>
          <input
            className="border px-3 py-2 block w-full"
            placeholder="Es. 10000"
            type="number"
            value={brideBudget}
            onChange={e => setBrideBudget(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Budget iniziale Sposo (€)</label>
          <input
            className="border px-3 py-2 block w-full"
            placeholder="Es. 10000"
            type="number"
            value={groomBudget}
            onChange={e => setGroomBudget(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
          onClick={signIn}
          disabled={loading}
        >
          Accedi
        </button>
        <button
          className="border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
          onClick={signUp}
          disabled={loading}
        >
          Registrati
        </button>
      </div>
      {err && <p className="text-red-600">{err}</p>}
    </main>
  );
}
