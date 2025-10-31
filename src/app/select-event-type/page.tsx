"use client";
import React from "react";
import { useEffect, useState } from "react";

const EVENT_TYPES = [
  { code: "wedding", labelKey: "events.wedding" },
  { code: "baptism", labelKey: "events.baptism" },
  { code: "turning-18", labelKey: "events.turning18" },
  { code: "anniversary", labelKey: "events.anniversary" },
  { code: "gender-reveal", labelKey: "events.genderReveal" },
  { code: "birthday", labelKey: "events.birthday" },
  { code: "turning-50", labelKey: "events.turning50" },
  { code: "retirement", labelKey: "events.retirement" },
  { code: "confirmation", labelKey: "events.confirmation" },
  { code: "graduation", labelKey: "events.graduation" },
];
import { useTranslations } from "next-intl";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";
import { useRouter } from "next/navigation";

export default function SelectEventTypePage() {
  const t = useTranslations();
  const router = useRouter();
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);
  const [country, setCountry] = useState<string>(typeof window !== 'undefined' ? (localStorage.getItem('country') || (document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1]) || 'it') : 'it');
  useEffect(() => {
    if (!country) return;
    fetch(`/api/traditions?country=${encodeURIComponent(country)}`)
      .then(r => r.json())
      .then(d => setTradition((d.traditions && d.traditions[0]) || null))
      .catch(() => setTradition(null));
  }, [country]);
  // On mount, se lingua o nazione non sono selezionate, torna agli step precedenti
  // Se tipologia evento già selezionata, vai a dashboard
  React.useEffect(() => {
    try {
      const cookieLang = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
      const cookieEventType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const lsLang = localStorage.getItem("language");
      const lsCountry = localStorage.getItem("country");
      const lsEventType = localStorage.getItem("eventType");
      if (!(cookieLang || lsLang)) {
        router.replace("/select-language");
        return;
      }
      if (!(cookieCountry || lsCountry)) {
        router.replace("/select-country");
        return;
      }
      if (lsLang && !cookieLang) document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (lsCountry && !cookieCountry) document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (cookieEventType || lsEventType) {
        if (!cookieEventType && lsEventType) document.cookie = `eventType=${lsEventType}; Path=/; Max-Age=15552000; SameSite=Lax`;
        const ev = cookieEventType || lsEventType;
        router.replace(ev === "wedding" ? "/dashboard" : "/coming-soon");
      }
    } catch {}
  }, []);
  const [selected, setSelected] = useState<string>("");

  function handleSelect(code: string) {
    setSelected(code);
    localStorage.setItem("eventType", code);
    document.cookie = `eventType=${code}; Path=/; Max-Age=15552000; SameSite=Lax`;
    router.push(code === "wedding" ? "/dashboard" : "/coming-soon");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(1100px 500px at 0% 0%, rgba(163,181,157,0.25), transparent)," +
          "radial-gradient(900px 600px at 100% 100%, rgba(230,242,224,0.5), transparent)," +
          "linear-gradient(180deg, #f7faf7, #eef5ee)",
        backgroundImage: "url(/backgrounds/select-event-type.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="max-w-3xl w-full mx-4 p-8 rounded-3xl bg-white/80 backdrop-blur border border-gray-200 shadow-xl">
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🎉</span>
          {t("onboarding.selectEventTypeTitle", { fallback: "Scegli il tipo di evento" })}
        </h1>
        {/* Tradizione preview per il paese selezionato */}
        {tradition && (
          <div className="mb-6">
            <WeddingTraditionInfo tradition={tradition} />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EVENT_TYPES.map((ev) => {
            const icon =
              ev.code === "wedding" ? "💍" :
              ev.code === "baptism" ? "👶" :
              ev.code === "turning-18" ? "🎉" :
              ev.code === "anniversary" ? "💞" :
              ev.code === "gender-reveal" ? "🎈" :
              ev.code === "birthday" ? "🎂" :
              ev.code === "turning-50" ? "🎊" :
              ev.code === "retirement" ? "🧓" :
              ev.code === "confirmation" ? "✝️" :
              ev.code === "graduation" ? "🎓" : "✨";
            return (
              <button
                key={ev.code}
                className={`px-6 py-4 rounded-xl font-semibold text-base shadow-sm border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === ev.code ? "bg-[#A3B59D] text-white" : ""}`}
                onClick={() => handleSelect(ev.code)}
              >
                <span aria-hidden="true" className="mr-2">{icon}</span>
                {t(ev.labelKey, { fallback: ev.code })}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
