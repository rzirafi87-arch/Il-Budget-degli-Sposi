"use client";

import { useState } from "react";
import SpesePage from "../spese/page";
import EntratePage from "../entrate/page";

export default function ContabilitaPage() {
  const [activeTab, setActiveTab] = useState<"spese" | "entrate">("spese");

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2">💼 Contabilità</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Gestisci tutte le transazioni economiche del tuo matrimonio in un unico posto: 
        spese sostenute e entrate ricevute. Tieni traccia di preventivi, pagamenti confermati e contributi.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("spese")}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all flex-1 sm:flex-none ${
            activeTab === "spese"
              ? "text-white border-b-4 rounded-t-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
          }`}
          style={activeTab === "spese" ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          💸 Spese
        </button>
        <button
          onClick={() => setActiveTab("entrate")}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all flex-1 sm:flex-none ${
            activeTab === "entrate"
              ? "text-white border-b-4 rounded-t-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
          }`}
          style={activeTab === "entrate" ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          💵 Entrate
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "spese" && <SpesePage />}
        {activeTab === "entrate" && <EntratePage />}
      </div>
    </section>
  );
}
