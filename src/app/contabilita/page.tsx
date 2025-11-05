"use client";

import React, { useState } from "react";
import SpesePage from "../spese/page";
import EntratePage from "../entrate/page";
import { useTranslations } from "next-intl";

export default function ContabilitaPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"spese" | "entrate">("spese");

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2 text-gray-800">{t("accounting")}</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Gestisci tutte le transazioni economiche del tuo matrimonio in un unico posto:
        spese sostenute e entrate ricevute. Tieni traccia di preventivi, pagamenti confermati e contributi.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-1" style={{ borderColor: "var(--border-soft)" }}>
        <button
          onClick={() => setActiveTab("spese")}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all flex-1 sm:flex-none rounded-t-xl border focus-ring-sage ${
            activeTab === "spese" ? "text-white shadow-soft" : "shadow-soft-sm"
          }`}
          style={
            activeTab === "spese"
              ? {
                  background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
                  borderColor: "var(--accent-sage-600)",
                }
              : {
                  background: "var(--surface-elevated)",
                  borderColor: "var(--border-soft)",
                  color: "var(--text-secondary)",
                }
          }
        >
          Spese
        </button>
        <button
          onClick={() => setActiveTab("entrate")}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all flex-1 sm:flex-none rounded-t-xl border focus-ring-sage ${
            activeTab === "entrate" ? "text-white shadow-soft" : "shadow-soft-sm"
          }`}
          style={
            activeTab === "entrate"
              ? {
                  background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
                  borderColor: "var(--accent-sage-600)",
                }
              : {
                  background: "var(--surface-elevated)",
                  borderColor: "var(--border-soft)",
                  color: "var(--text-secondary)",
                }
          }
        >
          Entrate
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
