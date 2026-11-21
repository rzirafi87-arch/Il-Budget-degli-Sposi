"use client";

import { localizedHref, pushLocalizedRoute } from "@/i18n/runtimeRouting";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("runtimeUi.shared");
  const pathname = usePathname();
  const router = useRouter();

  const [locales, setLocales] = useState<{ code: string; name: string; native_name: string; rtl?: boolean; selectable: boolean; status: string }[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string; native_name: string; region?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");

  useEffect(() => {
    setCountry(localStorage.getItem("country") || "");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [loc, ctry] = await Promise.all([
          fetch("/api/locales").then(r => r.json()).then(d => d.locales || []),
          fetch("/api/countries").then(r => r.json()).then(d => d.countries || []),
        ]);
        if (!active) return;
        setLocales(loc);
        setCountries(ctry);
        setError(null);
      } catch {
        if (!active) return;
        setError(t("optionsLoadFailed"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [t]);

  function persistPreference(name: "country", value: string) {
    localStorage.setItem(name, value);
    document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  function switchLocale(next: string) {
    if (!locales.some((candidate) => candidate.code === next && candidate.selectable)) return;
    if (next === locale) return;
    localStorage.setItem("language", next);
    document.cookie = `language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    pushLocalizedRoute(router, pathname || "/", next as Parameters<typeof localizedHref>[1], window.location.search, window.location.hash);
  }

  if (loading) return <div className="text-sage-600">{t("loadingOptions")}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select aria-label={t("language")} value={locale} onChange={(e) => switchLocale(e.target.value)} className="min-h-11 max-w-full border rounded-lg px-3 py-2">
        {locales.map((l) => (
          <option key={l.code} value={l.code} dir={l.rtl ? "rtl" : undefined} disabled={!l.selectable}>
            {l.native_name || l.name || l.code.toUpperCase()}{!l.selectable ? ` (${t("comingSoon")})` : ""}
          </option>
        ))}
      </select>

      <select aria-label={t("country")} value={country} onChange={(e) => { setCountry(e.target.value); persistPreference("country", e.target.value); }} className="min-h-11 max-w-full border rounded-lg px-3 py-2">
        <option value="">— {t("country")} —</option>
        {countries.map(c => (
          <option key={c.code} value={c.code}>
            {c.native_name || c.name || c.code}
          </option>
        ))}
      </select>


    </div>
  );
}
