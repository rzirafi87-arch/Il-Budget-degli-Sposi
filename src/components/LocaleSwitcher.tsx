"use client";
import { SUPPORTED_LOCALES, type EventType, type Locale } from "@/lib/i18n";
import { useLocale } from "@/providers/LocaleProvider";
import { usePathname, useRouter } from "next/navigation";

const COUNTRIES = [{ code: "IT", label: "Italia" }, { code: "US", label: "USA" }, { code: "MX", label: "Messico" }];
const EVENTS: { code: EventType; label: string }[] = [
  { code: "WEDDING", label: "Matrimonio" },
  { code: "BABY_SHOWER", label: "Baby Shower" },
  { code: "PROPOSAL", label: "Proposal" },
];

export default function LocaleSwitcher() {
  const { locale, setLocale, country, setCountry, eventType, setEventType } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split("/");
    segments[1] = next;
    setLocale(next);
    router.push(segments.join("/") || "/");
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select value={locale} onChange={(e) => switchLocale(e.target.value as Locale)} className="border rounded-lg px-3 py-2">
        {SUPPORTED_LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
      </select>

      <select value={country ?? ""} onChange={(e) => setCountry(e.target.value || undefined)} className="border rounded-lg px-3 py-2">
        <option value="">— Nazione —</option>
        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>

      <select value={eventType ?? ""} onChange={(e) => setEventType(e.target.value as EventType)} className="border rounded-lg px-3 py-2">
        <option value="">— Evento —</option>
        {EVENTS.map(e => <option key={e.code} value={e.code}>{e.label}</option>)}
      </select>
    </div>
  );
}
