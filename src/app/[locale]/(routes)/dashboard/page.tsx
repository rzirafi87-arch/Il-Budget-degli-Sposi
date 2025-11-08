"use client";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useLocale } from "@/providers/LocaleProvider";

export default function DashboardPage() {
  const { locale, country, eventType } = useLocale();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard Demo</h1>
      <LocaleSwitcher />
      <div className="mt-4">
        <div className="mb-2">Lingua attiva: <b>{locale}</b></div>
        <div className="mb-2">Nazione selezionata: <b>{country || "—"}</b></div>
        <div className="mb-2">Tipo evento: <b>{eventType || "—"}</b></div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
        <p className="mb-2">Questa è una dashboard demo localizzata.<br/>Seleziona lingua, nazione ed evento dallo switcher sopra per vedere i valori aggiornarsi in tempo reale.</p>
        <p className="text-xs opacity-60">(Integra qui la logica di caricamento dati, categorie, timeline, ecc. per Baby Shower/Proposal)</p>
      </div>
    </main>
  );
}
