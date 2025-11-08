"use client";

import { locales } from "@/i18n/config";
import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const EVENT_EMOJIS: Record<string, string> = {
  wedding: "💍",
  baptism: "👶",
  eighteenth: "🎉",
  anniversary: "💞",
  "gender-reveal": "🎈",
  birthday: "🎂",
  fifty: "🎊",
  retirement: "🧓",
  confirmation: "🕊️",
  communion: "✝️",
  graduation: "🎓",
  babyshower: "🍼",
  engagement: "💍",
  proposal: "💍",
  "bar-mitzvah": "🕎",
  quinceanera: "👑",
  corporate: "🏢",
  "charity-gala": "🎗️",
};

const LANGUAGE_REGION_FALLBACK: Record<string, string> = {
  it: "IT",
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  pt: "PT",
  ru: "RU",
  zh: "CN",
  ja: "JP",
  ar: "AE",
  hi: "IN",
  id: "ID",
};

const REGIONAL_OFFSET = 0x1f1e6;
const A_CODE = 65;

const toFlag = (code?: string) => {
  if (!code) return "🌐";
  const normalized = code.toUpperCase();
  if (normalized.length !== 2) return "🌐";
  return String.fromCodePoint(
    REGIONAL_OFFSET + normalized.charCodeAt(0) - A_CODE,
    REGIONAL_OFFSET + normalized.charCodeAt(1) - A_CODE,
  );
};

const getLanguageFlag = (langSlug: string, locale?: string) => {
  const region = locale?.split("-")[1] || LANGUAGE_REGION_FALLBACK[langSlug] || langSlug.slice(0, 2);
  return toFlag(region);
};

const getCountryFlag = (code?: string) => toFlag(code);

const Label: React.FC<{ title: string; value: string; onClick: () => void; emoji: string }> = ({
  title,
  value,
  onClick,
  emoji,
}) => (
  <button onClick={onClick} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
    <span className="text-base" aria-hidden>
      {emoji}
    </span>
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  </button>
);

Label.displayName = "Label";

export default function TopBarSelector() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState("it");
  const [country, setCountry] = React.useState("it");
  const [eventType, setEventType] = React.useState("wedding");

  React.useEffect(() => {
    try {
      const c = (name: string) => document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
      const ln = localStorage.getItem("language") || c("language") || "it";
      let ct = localStorage.getItem("country") || c("country") || "it";
      if (ct === "uk") {
        ct = "gb";
        document.cookie = `country=gb; Path=/; Max-Age=15552000; SameSite=Lax`;
        localStorage.setItem("country", "gb");
      }
      const ev = localStorage.getItem("eventType") || c("eventType") || "wedding";
      setLang(ln);
      setCountry(ct);
      setEventType(ev);
    } catch {
      // Ignore errors in SSR
    }
  }, []);

  function handleLangChange(newLang: string) {
    localStorage.setItem("language", newLang);
    document.cookie = `language=${newLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
    setLang(newLang);
    const segments = pathname ? pathname.split("/").filter(Boolean) : [];
    if (segments.length === 0) {
      router.push(`/${newLang}`);
      return;
    }
    if (locales.includes(segments[0] as (typeof locales)[number])) {
      segments[0] = newLang;
    } else {
      segments.unshift(newLang);
    }
    router.push(`/${segments.join("/")}` || `/${newLang}`);
  }

  const currentLang = LANGS.find((l) => l.slug === lang);
  const currentCountry = COUNTRIES.find((c) => c.code === country);
  const currentEvent = EVENTS.find((e) => e.slug === eventType);
  const languageFlag = getLanguageFlag(lang, currentLang?.locale);
  const countryFlag = getCountryFlag(currentCountry?.code || country);
  const eventEmoji = EVENT_EMOJIS[currentEvent?.slug ?? eventType] || "🎉";
  const countryDisplay = React.useMemo(() => {
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of((currentCountry?.code || country).toUpperCase()) ||
        currentCountry?.label ||
        country.toUpperCase()
      );
    } catch {
      return currentCountry?.label || country.toUpperCase();
    }
  }, [locale, currentCountry, country]);

  const eventLabel = t(`events.${currentEvent?.slug ?? eventType}`, {
    fallback: currentEvent?.label || eventType,
  });

  return (
    <div className="relative">
      <button
        className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-semibold text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span aria-hidden>{languageFlag}</span>
        {currentLang?.label || lang.toUpperCase()}
        <span className="text-gray-400">·</span>
        <span aria-hidden>{countryFlag}</span>
        {countryDisplay}
        <span className="text-gray-400">·</span>
        <span aria-hidden>{eventEmoji}</span>
        {eventLabel}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-3">
            <div className="flex gap-2 items-center px-2 py-2">
              <span className="text-base" aria-hidden>
                {languageFlag}
              </span>
              <div>
                <div className="text-xs text-gray-500">Lingua</div>
                <select
                  className="text-sm font-semibold text-gray-800 rounded border px-2 py-1"
                  value={lang}
                  onChange={(e) => handleLangChange(e.target.value)}
                >
                  {LANGS.map((l) => (
                    <option key={l.slug} value={l.slug}>
                      {getLanguageFlag(l.slug, l.locale)} {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Label
              title="Nazione"
              value={currentCountry?.label || country.toUpperCase()}
              emoji={countryFlag}
              onClick={() => router.push(`/${locale}/select-country`)}
            />
            <Label
              title="Evento"
              value={`${eventLabel}${
                currentEvent?.available === false ? ` · ${t("comingSoon", { fallback: "In arrivo" })}` : ""
              }`}
              emoji={eventEmoji}
              onClick={() => router.push(`/${locale}/select-event-type`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
