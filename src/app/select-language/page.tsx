"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const NATIVE_LABELS: Record<string, string> = {
  it: "Italiano",
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
};

const LANGUAGES = [
  { code: "it", labelKey: "languages.it" },
  { code: "es", labelKey: "languages.es" },
  { code: "en", labelKey: "languages.en" },
  { code: "fr", labelKey: "languages.fr" },
  { code: "de", labelKey: "languages.de" },
  { code: "ru", labelKey: "languages.ru" },
  { code: "zh", labelKey: "languages.zh" },
  { code: "ja", labelKey: "languages.ja" },
  { code: "ar", labelKey: "languages.ar" },
];

const LANGUAGE_ICONS: Record<string, string> = {
  it: "🇮🇹",
  es: "🇪🇸",
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  ru: "🇷🇺",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ar: "🇦🇪",
};

export default function SelectLanguagePage() {
  const t = useTranslations();
  const router = useRouter();
  useEffect(() => {
    try {
      const cookieLang = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      const lsLang = localStorage.getItem("language");
      if (cookieLang || lsLang) {
        if (!cookieLang && lsLang) {
          document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
        }
        router.replace("/select-country");
      }
    } catch {}
  }, []);
  const [selected, setSelected] = useState<string>("");

  function handleSelect(code: string) {
    setSelected(code);
    localStorage.setItem("language", code);
    // Persisti anche nei cookie per middleware/server
    document.cookie = `language=${code}; Path=/; Max-Age=15552000; SameSite=Lax`;
    router.push("/select-country");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(163,181,157,0.25), transparent)," +
          "radial-gradient(900px 500px at 90% 20%, rgba(230,242,224,0.5), transparent)," +
          "linear-gradient(180deg, #f7faf7, #eef5ee)",
        backgroundImage: "url(/backgrounds/select-language.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="max-w-xl w-full mx-4 p-8 rounded-3xl bg-white/80 backdrop-blur border border-gray-200 shadow-xl">
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🌐</span>
          {t("onboarding.selectLanguageTitle", { fallback: "Scegli la lingua" })}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {t("onboarding.selectLanguageDesc", { fallback: "Seleziona la lingua che preferisci per continuare" })}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`px-6 py-4 rounded-xl font-semibold text-base shadow-sm border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === lang.code ? "bg-[#A3B59D] text-white" : ""}`}
              onClick={() => handleSelect(lang.code)}
              aria-label={NATIVE_LABELS[lang.code] || lang.code.toUpperCase()}
            >
              <span aria-hidden="true" className="mr-2 text-lg">
                {LANGUAGE_ICONS[lang.code] || "🌍"}
              </span>
              {NATIVE_LABELS[lang.code] || lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
