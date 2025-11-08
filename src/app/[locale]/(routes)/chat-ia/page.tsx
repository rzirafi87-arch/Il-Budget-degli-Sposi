"use client";
import AISuggestionsChat from "@/components/AISuggestionsChat";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import React from "react";

const supabase = getBrowserClient();

export default function ChatIAPage() {
  const [userLang, setUserLang] = React.useState("it");
  const [userCountry, setUserCountry] = React.useState("it");
  const [userEventType, setUserEventType] = React.useState("wedding");
  const [showBudget, setShowBudget] = React.useState(false);
  const [budget, setBudget] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    try {
      setUserLang(localStorage.getItem("language") || "it");
      setUserCountry(localStorage.getItem("country") || "it");
      setUserEventType(localStorage.getItem("eventType") || "wedding");
    } catch {}
  }, []);

  async function saveBudget() {
    setSaving(true);
    setMessage("");
    try {
      const n = Number(budget.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isFinite(n) || n < 0) {
        setMessage("Inserisci un importo valido");
        setSaving(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      const res = await fetch("/api/event/update-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
        body: JSON.stringify({ total_budget: n })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Errore salvataggio (${res.status})`);
      }
      setMessage("Budget salvato");
      setShowBudget(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Errore imprevisto";
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pt-6">
      <h1 className="font-serif text-3xl mb-4">Chat con Assistente IA</h1>
      <AISuggestionsChat userLang={userLang} userCountry={userCountry} userEventType={userEventType} />
      <div className="max-w-xl mx-auto">
        <button className="mt-2 px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-sage)" }} onClick={() => setShowBudget(true)}>
          Inserisci budget
        </button>
        {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
      </div>

      {showBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-3">Imposta budget totale</h2>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Es. 25000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setShowBudget(false)} disabled={saving}>Annulla</button>
              <button className="px-4 py-2 rounded text-white" style={{ background: "var(--color-sage)" }} onClick={saveBudget} disabled={saving}>
                {saving ? "Salvo..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
