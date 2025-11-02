"use client";

import eventsConfig from "@/data/config/events.json";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setErr(null);
    setLoading(true);
    try {
      // Validazione campi budget (se presenti)
      let brideBudget = null;
      let groomBudget = null;
      if (typeof window !== "undefined") {
        const brideBudgetInput = document.querySelector('input[name="brideBudget"]') as HTMLInputElement | null;
        const groomBudgetInput = document.querySelector('input[name="groomBudget"]') as HTMLInputElement | null;
        brideBudget = brideBudgetInput && brideBudgetInput.value ? Number(brideBudgetInput.value.replace(/[^\d.]/g, "")) : null;
        groomBudget = groomBudgetInput && groomBudgetInput.value ? Number(groomBudgetInput.value.replace(/[^\d.]/g, "")) : null;
      }

      type RegisterBody = {
        primaryEmail: string;
        password: string;
        eventType: string;
        partnerEmail?: string;
        weddingDate?: string;
        brideBudget?: number;
        groomBudget?: number;
        totalBudget?: number;
      };
      const body: RegisterBody = {
        primaryEmail: email,
        password,
        eventType,
      };
      if (eventType === "wedding") {
        body.partnerEmail = partnerEmail || undefined;
        body.weddingDate = weddingDate || undefined;
        body.brideBudget = brideBudget !== null && !isNaN(brideBudget) ? brideBudget : undefined;
        body.groomBudget = groomBudget !== null && !isNaN(groomBudget) ? groomBudget : undefined;
      } else {
        body.totalBudget = brideBudget !== null && !isNaN(brideBudget) ? brideBudget : undefined;
      }

      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setErr(j.error || "Registrazione non riuscita");
      } else {
        const { error: autoLoginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (autoLoginErr) {
          setErr(`Registrazione ok, ma login automatico fallito: ${autoLoginErr.message}`);
        } else {
          window.location.assign("/");
          return;
        }
      }
    } catch (e: unknown) {
      console.error("Login error", e);
      const error = e as Error;
      setErr(error.message || "Errore durante il login");
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
      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di evento</label>
      <select
        className="border px-3 py-2 block w-full max-w-sm mb-2"
        value={eventType}
        onChange={e => setEventType(e.target.value)}
      >
        {eventsConfig.filter(ev => ev.available).map(ev => (
          <option key={ev.slug} value={ev.slug}>
            {ev.emoji} {ev.label}
          </option>
        ))}
      </select>
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {eventType === "wedding" && (
        <input
          className="border px-3 py-2 block w-full max-w-sm"
          placeholder="Email partner (opzionale)"
          type="email"
          value={partnerEmail}
          onChange={e => setPartnerEmail(e.target.value)}
        />
      )}
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {eventType === "wedding" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📅 Data Matrimonio</label>
          <input
            className="border px-3 py-2 block w-full max-w-sm rounded"
            type="date"
            value={weddingDate}
            onChange={e => setWeddingDate(e.target.value)}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
        {eventType === "wedding" ? (
          <div className="flex gap-2">
            <input
              name="brideBudget"
              className="border px-3 py-2 block w-full max-w-xs"
              placeholder="Budget sposa (€)"
              type="number"
            />
            <input
              name="groomBudget"
              className="border px-3 py-2 block w-full max-w-xs"
              placeholder="Budget sposo (€)"
              type="number"
            />
          </div>
        ) : (
          <input
            name="brideBudget"
            className="border px-3 py-2 block w-full max-w-sm"
            placeholder="Budget totale (€)"
            type="number"
          />
        )}
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
        {process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && process.env.NEXT_PUBLIC_TEST_EMAIL && process.env.NEXT_PUBLIC_TEST_PASSWORD ? (
          <button
            className="border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
            onClick={async () => {
              setErr(null);
              setLoading(true);
              try {
                const { error } = await supabase.auth.signInWithPassword({
                  email: process.env.NEXT_PUBLIC_TEST_EMAIL as string,
                  password: process.env.NEXT_PUBLIC_TEST_PASSWORD as string,
                });
                if (error) {
                  setErr(error.message);
                } else {
                  window.location.assign("/");
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Login tester
          </button>
        ) : null}
      </div>
      {err && <p className="text-red-600">{err}</p>}
    </main>
  );
}
