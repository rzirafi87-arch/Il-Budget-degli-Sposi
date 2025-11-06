"use client";
import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

// Moved outside component to prevent re-creation on each render
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
    window.location.reload();
  }

  const currentLang = LANGS.find(l => l.slug === lang);
  const currentCountry = COUNTRIES.find(c => c.code === country);
  const currentEvent = EVENTS.find(e => e.slug === eventType);

  return (
    <div className="relative">
      <button
        className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-semibold text-xs sm:text-sm whitespace-nowrap"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {currentLang?.emoji || "ðŸŒ"} {currentLang?.label || lang.toUpperCase()} Â· {currentCountry?.emoji || "ðŸ³ï¸"} {new Intl.DisplayNames([document?.documentElement?.lang || 'it'], { type: 'region' }).of((currentCountry?.code || country).toUpperCase()) || country.toUpperCase()} Â· {currentEvent?.emoji || "ðŸŽ‰"} {t(`events.${currentEvent?.slug ?? eventType}`, { fallback: currentEvent?.label || eventType })}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-3">
            <div className="flex gap-2 items-center px-2 py-2">
              <span className="text-base" aria-hidden>{currentLang?.emoji || "ðŸŒ"}</span>
              <div>
                <div className="text-xs text-gray-500">Lingua</div>
                <select
                  className="text-sm font-semibold text-gray-800 rounded border px-2 py-1"
                  value={lang}
                  onChange={e => handleLangChange(e.target.value)}
                >
                  {LANGS.map(l => (
                    <option key={l.slug} value={l.slug}>{l.emoji} {l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Label title="Nazione" value={currentCountry?.label || country.toUpperCase()} emoji={currentCountry?.emoji || "ðŸ³ï¸"} onClick={() => router.push("/select-country")} />
            <Label
              title="Evento"
              value={`${t(`events.${currentEvent?.slug ?? eventType}`, { fallback: currentEvent?.label || eventType })}${currentEvent?.available === false ? ` Â· ${t("comingSoon", { fallback: "In arrivo" })}` : ""}`}
              emoji={currentEvent?.emoji || "ðŸŽ‰"}
              onClick={() => router.push("/select-event-type")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
