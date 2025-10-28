import React from "react";
"use client";
import { useState } from "react";

const EVENT_TYPES = [
  { code: "wedding", label: "Matrimonio" },
  { code: "anniversary", label: "Anniversario" },
  { code: "other", label: "Altro" },
];

export default function SelectEventTypePage() {
  // On mount, se lingua o nazione non sono selezionate, torna agli step precedenti
  // Se tipologia evento già selezionata, vai a dashboard
  React.useEffect(() => {
    const lang = localStorage.getItem("language");
    if (!lang) {
      window.location.href = "/select-language";
      return;
    }
    const country = localStorage.getItem("country");
    if (!country) {
      window.location.href = "/select-country";
      return;
    }
    const eventType = localStorage.getItem("eventType");
    if (eventType) {
      window.location.href = "/dashboard";
    }
  }, []);
  const [selected, setSelected] = useState<string>("");

  function handleSelect(code: string) {
    setSelected(code);
    localStorage.setItem("eventType", code);
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#A3B59D] to-[#e6f2e0]">
      <h1 className="text-3xl font-bold mb-8">Scegli la tipologia di evento</h1>
      <div className="flex gap-6">
        {EVENT_TYPES.map(ev => (
          <button
            key={ev.code}
            className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-md border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === ev.code ? "bg-[#A3B59D] text-white" : ""}`}
            onClick={() => handleSelect(ev.code)}
          >
            {ev.label}
          </button>
        ))}
      </div>
    </div>
  );
}
