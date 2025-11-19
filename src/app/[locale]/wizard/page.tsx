"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";

import { BIRTHDAY_META } from "@/features/events/birthday/config";
import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";
import { BABY_SHOWER_META } from "@/features/events/baby-shower/config";

type Props = {
  params: { locale?: string } | Promise<{ locale?: string }>;
};

// Tutti gli eventi disponibili nel wizard (per ora questi 3)
const EVENT_OPTIONS = [
  BIRTHDAY_META,
  ENGAGEMENT_PARTY_META,
  BABY_SHOWER_META,
] as const;

// Per ora mettiamo solo Italia, ma puoi estendere facilmente
const COUNTRY_OPTIONS = [
  { code: "IT", label: "Italia" },
  // { code: "MX", label: "Messico" },
  // { code: "IN", label: "India" },
  // { code: "US", label: "Stati Uniti" },
];

export default function Page({ params }: Props) {
  const t = useTranslations();
  // Support both resolved and Promise params (defensive for Next.js 16)
  let locale = "it";
  if (typeof params === "object" && params !== null && "locale" in params) {
    locale = params.locale || "it";
  }
  const router = useRouter();
  const [country, setCountry] = useState("IT");
  const [eventKey, setEventKey] = useState<string>(EVENT_OPTIONS[0].key);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/${locale}/${eventKey}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-6 border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          {t("onboarding.selectEventTypeTitle")}
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Seleziona lingua, nazione ed evento per iniziare a configurare il
          budget.
        </p>

        {/* Lingua – per ora fissata su locale della URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lingua</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={locale?.toUpperCase?.() || "IT"}
            disabled
          />
        </div>

        {/* Nazione */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nazione</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Evento */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Evento</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={eventKey}
            onChange={(e) => setEventKey(e.target.value)}
          >
            {EVENT_OPTIONS.map((event) => (
              <option key={event.key} value={event.key}>
                {t(`events.${event.key}`)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full mt-4 rounded-xl px-4 py-2 text-white bg-black font-semibold"
        >
          Continua
        </button>
      </form>
    </main>
  );
}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-6 border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          Imposta il tuo evento
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Seleziona lingua, nazione ed evento per iniziare a configurare il
          budget.
        </p>

        {/* Lingua – per ora fissata su locale della URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lingua</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={locale?.toUpperCase?.() || "IT"}
            disabled
          />
            value={locale?.toUpperCase?.() || "IT"}

        {/* Nazione */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nazione</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Evento */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Evento</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={eventKey}
            onChange={(e) => setEventKey(e.target.value)}
          >
            {EVENT_OPTIONS.map((event) => (
              <option key={event.key} value={event.key}>
                {event.name || event.key}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full mt-4 rounded-xl px-4 py-2 text-white bg-black font-semibold"
        >
          Continua
        </button>
      </form>
    </main>
  );
}
