"use client";
import React from "react";
import { useState } from "react";

const LANGUAGES = [
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

export default function SelectLanguagePage() {
  // On mount, se la lingua è già selezionata, vai avanti
  React.useEffect(() => {
    const lang = localStorage.getItem("language");
    if (lang) {
      window.location.href = "/select-country";
    }
  }, []);
  const [selected, setSelected] = useState<string>("");

  function handleSelect(code: string) {
    setSelected(code);
    localStorage.setItem("language", code);
    window.location.href = "/select-country";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#A3B59D] to-[#e6f2e0]">
      <h1 className="text-3xl font-bold mb-8">Scegli la lingua</h1>
      <div className="flex gap-6">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-md border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === lang.code ? "bg-[#A3B59D] text-white" : ""}`}
            onClick={() => handleSelect(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
