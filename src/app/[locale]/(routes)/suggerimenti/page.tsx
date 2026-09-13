"use client";

import { flags } from "@/config/flags";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuggerimentiPage() {
  const t = useTranslations();
  const rt = useTranslations("milestone9.runtime.suggestions");
  const suggestionsEnabled = flags.ai_suggestions;
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!suggestionsEnabled) return;
    const country = typeof window !== "undefined" ? localStorage.getItem("country") || "it" : "it";
    // Schedule setState to avoid synchronous setState within effect
    setTimeout(() => {
      if (country === "mx") {
        setSuggestions([
          rt("mexico.mariachi"),
          rt("mexico.venue"),
          rt("mexico.photoBooth"),
          rt("mexico.documents"),
        ]);
      } else {
        setSuggestions([
          rt("general.photographer"),
          rt("general.guestList"),
          rt("general.traditions"),
        ]);
      }
    }, 0);
  }, [suggestionsEnabled, rt]);

  if (!suggestionsEnabled) {
    return (
      <section className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">
          {t("suggestions")}
        </h1>
        <p className="mb-4 text-gray-700 text-base">
          {t("featureDisabled")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          {t("backToDashboard")}
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-serif text-3xl mb-4 text-[#A3B59D] font-bold">
        {t("suggestions")}
      </h1>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          {t("backToDashboard")}
        </Link>
      </div>
      <div className="mb-6">
        <Link
          href="/chat-ia"
          className="inline-block px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          {rt("chatWithAi")}
        </Link>
      </div>
      <p className="mb-4 text-gray-700 text-base">
        {rt("introduction")}
      </p>
      <ul className="space-y-4">
        {suggestions.map((s, i) => (
          <li key={i} className="bg-white border-l-4 border-[#A3B59D] shadow rounded-xl p-4 text-gray-800 font-medium">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-[#A3B59D] bg-[#F7FBF7]">
        <h2 className="font-semibold text-lg mb-2">{rt("uploadTitle")}</h2>
        <p className="text-gray-700 mb-3">
          {rt("uploadDescription")}
        </p>
        <label className="inline-block px-4 py-2 rounded-full text-white cursor-pointer" style={{ background: "var(--color-sage)" }}>
          {rt("selectFile")}
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
    </section>
  );
}
