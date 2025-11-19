"use client";

import { type EventType, type Locale } from "@/lib/i18n";
import { useAppContext } from "@/providers/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LocaleSwitcher() {
  const { locale, setLocale, countryCode, setCountryCode, eventType, setEventType } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const [locales, setLocales] = useState<{ code: string; name: string; native_name: string; rtl?: boolean }[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string; native_name: string; region?: string }[]>([]);
  const [events, setEvents] = useState<{ code: string; name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [loc, ctry, ev] = await Promise.all([
          fetch("/api/locales").then((r) => r.json()).then((d) => d.locales || []),
          fetch("/api/countries").then((r) => r.json()).then((d) => d.countries || []),
          fetch("/api/events").then((r) => r.json()).then((d) => d.events || []),
        ]);
        if (!active) return;
        setLocales(loc);
        setCountries(ctry);
        setEvents(ev);
        setError(null);
      } catch {
        if (!active) return;
        setError("Errore nel caricamento delle opzioni");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function switchLocale(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split("/");
    segments[1] = next;
    setLocale(next);
    router.push(segments.join("/") || "/");
  }

  if (loading) return <div className="text-sage-600">Caricamento opzioni…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        className="border rounded-lg px-3 py-2"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code} dir={l.rtl ? "rtl" : undefined}>
            {l.native_name || l.name || l.code.toUpperCase()}
          </option>
        ))}
      </select>

      <select
        value={countryCode ?? ""}
        onChange={(e) => setCountryCode(e.target.value || undefined)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="">🌍 Nazione 🌍</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.native_name || c.name || c.code}
          </option>
        ))}
      </select>

      <select
        value={eventType ?? ""}
        onChange={(e) => setEventType(e.target.value as EventType)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="">🎉 Evento 🎉</option>
        {events.map((e) => (
          <option key={e.code} value={e.code}>
            {e.name}
          </option>
        ))}
      </select>
    </div>
  );
}
