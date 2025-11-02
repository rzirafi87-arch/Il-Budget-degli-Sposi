import React from "react";

type Props = {
  userLang: string;
  userCountry: string;
  userEventType: string;
  onQuickChange: (type: "language" | "country" | "eventType") => void;
};

export default function UserSummary({ userLang, userCountry, userEventType, onQuickChange }: Props) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
        <span className="text-xl">🌐</span>
        <span className="font-semibold">Lingua:</span>
        <span>{userLang === "it" ? "Italiano" : userLang === "es" ? "Español" : userLang === "en" ? "English" : userLang}</span>
        <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>onQuickChange("language")}>Cambia</button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
        <span className="text-xl">📍</span>
        <span className="font-semibold">Nazione:</span>
        <span>{userCountry === "mx" ? "Messico" : userCountry === "it" ? "Italia" : userCountry.toUpperCase()}</span>
        <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>onQuickChange("country")}>Cambia</button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
        <span className="text-xl">🎉</span>
        <span className="font-semibold">Evento:</span>
        <span>
          {userEventType === "wedding"
            ? (userLang === "es" ? "Boda" : userLang === "it" ? "Matrimonio" : "Wedding")
            : userEventType === "anniversary"
            ? (userLang === "es" ? "Aniversario" : userLang === "it" ? "Anniversario" : "Anniversary")
            : userEventType === "graduation"
            ? (userLang === "es" ? "Graduación" : userLang === "it" ? "Laurea" : "Graduation")
            : "Altro"}
        </span>
        <button className="ml-2 px-2 py-1 text-xs bg-[#A3B59D] text-white rounded" onClick={()=>onQuickChange("eventType")}>Cambia</button>
      </div>
    </div>
  );
}
