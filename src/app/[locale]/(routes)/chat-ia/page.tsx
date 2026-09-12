"use client";
import AISuggestionsChat from "@/components/AISuggestionsChat";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import React from "react";
import { useTranslations } from "next-intl";

const supabase = getBrowserClient();

export default function ChatIAPage() {
  const t = useTranslations("milestone9.aiChat");
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
        setMessage(t("invalidAmount"));
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
        throw new Error(err.error || t("saveError", { status: res.status }));
      }
      setMessage(t("saved"));
      setShowBudget(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("unexpectedError");
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pt-6">
      <h1 className="font-serif text-3xl mb-4">{t("title")}</h1>
      <AISuggestionsChat userLang={userLang} userCountry={userCountry} userEventType={userEventType} />
      <div className="max-w-xl mx-auto">
        <button className="mt-2 px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-sage)" }} onClick={() => setShowBudget(true)}>
          {t("enterBudget")}
        </button>
        {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
      </div>

      {showBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-3">{t("setBudget")}</h2>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder={t("budgetPlaceholder")}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setShowBudget(false)} disabled={saving}>{t("cancel")}</button>
              <button className="px-4 py-2 rounded text-white" style={{ background: "var(--color-sage)" }} onClick={saveBudget} disabled={saving}>
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
