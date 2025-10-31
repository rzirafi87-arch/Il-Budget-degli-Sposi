"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function TopBarSelector() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState("it");
  const [country, setCountry] = React.useState("it");
  const [eventType, setEventType] = React.useState("wedding");

  React.useEffect(() => {
    try {
      const c = (name: string) => document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
      setLang(localStorage.getItem("language") || c("language") || "it");
      setCountry(localStorage.getItem("country") || c("country") || "it");
      setEventType(localStorage.getItem("eventType") || c("eventType") || "wedding");
    } catch {}
  }, []);

  const Label: React.FC<{ title: string; value: string; onClick: () => void; emoji: string }>
    = ({ title, value, onClick, emoji }) => (
    <button onClick={onClick} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
      <span className="text-base" aria-hidden>{emoji}</span>
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-sm font-semibold text-gray-800">{value}</div>
      </div>
    </button>
  );

  function handleLangChange(newLang: string) {
    localStorage.setItem("language", newLang);
    document.cookie = `language=${newLang};path=/`;
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-semibold text-xs sm:text-sm whitespace-nowrap"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        🌐 {lang.toUpperCase()} · {country.toUpperCase()} · {eventType === "wedding" ? "Matrimonio" : eventType}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-2">
            <div className="flex gap-2 items-center px-3 py-2">
              <span className="text-base" aria-hidden>🗣️</span>
              <div>
                <div className="text-xs text-gray-500">Lingua</div>
                <select
                  className="text-sm font-semibold text-gray-800 rounded border px-2 py-1"
                  value={lang}
                  onChange={e => handleLangChange(e.target.value)}
                >
                  <option value="it">IT</option>
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                  <option value="ru">RU</option>
                  <option value="zh">ZH</option>
                </select>
              </div>
            </div>
            <Label title="Nazione" value={country.toUpperCase()} emoji="📍" onClick={() => router.push("/select-country")} />
            <Label title="Evento" value={eventType === "wedding" ? "Matrimonio" : eventType} emoji="🎉" onClick={() => router.push("/select-event-type")} />
          </div>
        </div>
      )}
    </div>
  );
}

