/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Link from "next/link";

function getLang(): "it"|"es"|"en"|"fr"|"de"|"ru"|"zh" {
  if (typeof window === "undefined") return "en";
  const ls = localStorage.getItem("language") as any;
  const cookie = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1] as any;
  return (ls || cookie || "en") as any;
}

function tComingSoon(lang: string) {
  switch (lang) {
    case "it": return "In arrivo";
    case "es": return "PrÃ³ximamente";
    case "fr": return "BientÃ´t disponible";
    case "de": return "DemnÃ¤chst verfÃ¼gbar";
    case "ru": return "Ð¡ÐºÐ¾Ñ€Ð¾";
    case "zh": return "å³å°†æŽ¨å‡º";
    default: return "Coming Soon";
  }
}

const LABELS: Record<string, {it:string; es:string; en:string}> = {
  wedding: { it: "Matrimonio", es: "Boda", en: "Wedding" },
  baptism: { it: "Battesimo", es: "Bautizo", en: "Baptism" },
  "turning-18": { it: "Diciottesimo", es: "18Âº CumpleaÃ±os", en: "18th Birthday" },
  "anniversary-50": { it: "50Âº Anniversario", es: "50Âº Aniversario", en: "50th Anniversary" },
  "turning-50": { it: "50 Anni", es: "50 AÃ±os", en: "50 Years" },
  retirement: { it: "Pensione", es: "JubilaciÃ³n", en: "Retirement" },
  confirmation: { it: "Cresima", es: "ConfirmaciÃ³n", en: "Confirmation" },
  graduation: { it: "Laurea", es: "GraduaciÃ³n", en: "Graduation" },
};

export default function ComingSoonPage() {
  const lang = getLang();
  let eventType: string | null = null;
  if (typeof window !== "undefined") {
    const cookieEvt = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const lsEvt = localStorage.getItem("eventType");
    eventType = cookieEvt || lsEvt || null;
  }
  const eventLabel = eventType ? (LABELS[eventType]?.[lang as "it"|"es"|"en"] || eventType) : "";

  return (
    <main className="min-h-screen flex items-center justify-center" style={{
      background:
        "radial-gradient(1000px 500px at 0% 100%, rgba(163,181,157,0.2), transparent)," +
        "radial-gradient(800px 500px at 100% 0%, rgba(232,240,233,0.6), transparent)," +
        "linear-gradient(180deg, #f8fbf8, #eef5ef)",
    }}>
      <div className="max-w-xl w-full mx-4 p-10 rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-xl text-center">
        <h1 className="text-3xl font-serif font-bold mb-3">{tComingSoon(lang)}</h1>
        {eventLabel ? (
          <p className="text-lg text-gray-700 mb-6">{eventLabel}</p>
        ) : null}
        <p className="text-gray-600 mb-8">
          Questa sezione non Ã¨ ancora pronta per questo tipo di evento.
          Nel frattempo puoi esplorare la nostra demo o creare un evento Matrimonio per usare tutte le funzionalitÃ .
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold">Vai alla Home</Link>
          <button
            onClick={() => {
              localStorage.setItem("eventType", "wedding");
              document.cookie = `eventType=wedding; Path=/; Max-Age=15552000; SameSite=Lax`;
              window.location.href = "/dashboard";
            }}
            className="px-5 py-3 rounded-lg text-white font-semibold"
            style={{ background: "var(--color-sage)" }}
          >
            Passa a Matrimonio
          </button>
        </div>
      </div>
    </main>
  );
}

