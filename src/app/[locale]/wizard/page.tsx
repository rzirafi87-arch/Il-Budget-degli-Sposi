"use client";
import { useLocale } from "@/providers/LocaleProvider";
import { useRouter } from "next/navigation";

export default function WizardPage() {
  const { locale, country, eventType, setCountry, setEventType } = useLocale();
  const router = useRouter();

  function go() {
    // porta in dashboard/overview con i parametri selezionati
    const q = new URLSearchParams();
    if (country) q.set("country", country);
    if (eventType) q.set("event", eventType);
    router.push(`/${locale}/dashboard?${q.toString()}`);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Configura il tuo evento</h1>
      <p className="opacity-80">Seleziona nazione ed evento per sbloccare categorie, timeline e traduzioni.</p>

      {/* puoi anche riusare LocaleSwitcher qui se vuoi */}
      {/* ...oppure due semplici select mirate */}
      <div className="flex gap-3">
        {/* re-use via dynamic import if needed */}
      </div>

      <button
        onClick={go}
        disabled={!eventType}
        className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-40"
      >Continua</button>
    </main>
  );
}
