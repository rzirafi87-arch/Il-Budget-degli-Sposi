"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { EVENT_CONFIGS } from "@/constants/eventConfigs";

import type { EventConfiguration } from "@/constants/eventConfigs";
const EVENTS = Object.entries(EVENT_CONFIGS).map(([slug, cfg]) => {
  const config = cfg as EventConfiguration;
  return {
    id: slug,
    name: config.name,
    type: slug,
  };
});

export default function SelectEventPage() {
  const router = useRouter();
  const locale = useLocale();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const activeEvent = localStorage.getItem("activeEventId");
    if (activeEvent) {
      setTimeout(() => setSelected(activeEvent), 0);
    }
  }, []);

  function handleSelect(id: string) {
    setSelected(id);
    localStorage.setItem("activeEventId", id);
    localStorage.setItem("eventType", id);
    router.push(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#A3B59D] to-[#e6f2e0]">
      <h1 className="text-3xl font-bold mb-8">Seleziona il tuo evento</h1>
      <div className="flex flex-col gap-4 mb-8">
        {EVENTS.map((ev) => (
          <button
            key={ev.id}
            className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-md border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${
              selected === ev.id ? "bg-[#A3B59D] text-white" : ""
            }`}
            onClick={() => handleSelect(ev.id)}
          >
            {ev.name}
          </button>
        ))}
      </div>
    </div>
  );
}
