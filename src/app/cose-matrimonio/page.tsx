"use client";

import { useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

type EntertainmentItem = {
  id: string;
  name: string;
  category: string;
  forCerimonia: boolean;
  forRicevimento: boolean;
};

type Selection = {
  id: string;
  itemId: string;
  name: string;
  category: string;
  location: "cerimonia" | "ricevimento";
  notes?: string;
};

const ENTERTAINMENT_OPTIONS: EntertainmentItem[] = [
  // Musica e Performance Live
  { id: "mus-1", name: "DJ", category: "Musica e Performance Live", forCerimonia: false, forRicevimento: true },
  { id: "mus-2", name: "Band dal vivo", category: "Musica e Performance Live", forCerimonia: false, forRicevimento: true },
  { id: "mus-3", name: "Cantante solista", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: true },
  { id: "mus-4", name: "Duo acustico", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: true },
  { id: "mus-5", name: "Quartetto d'archi", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: true },
  { id: "mus-6", name: "Pianista", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: true },
  { id: "mus-7", name: "Arpista", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: false },
  { id: "mus-8", name: "Soprano/Tenore", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: false },
  { id: "mus-9", name: "Organista", category: "Musica e Performance Live", forCerimonia: true, forRicevimento: false },
  { id: "mus-10", name: "Jazz band", category: "Musica e Performance Live", forCerimonia: false, forRicevimento: true },
  { id: "mus-11", name: "Orchestra", category: "Musica e Performance Live", forCerimonia: false, forRicevimento: true },

  // Animazione e Spettacolo
  { id: "ani-1", name: "Animatori per bambini", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-2", name: "Mago/Illusionista", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-3", name: "Caricaturista", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-4", name: "Spettacolo fuochi d'artificio", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-5", name: "Ballerini professionisti", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-6", name: "Artista di strada", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-7", name: "Trampolieri", category: "Animazione e Spettacolo", forCerimonia: false, forRicevimento: true },
  { id: "ani-8", name: "Mimi", category: "Animazione e Spettacolo", forCerimonia: true, forRicevimento: true },

  // Coinvolgimento Ospiti/Esperienze
  { id: "exp-1", name: "Photobooth", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-2", name: "Lancio palloncini/lanterne", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: true, forRicevimento: true },
  { id: "exp-3", name: "Confettata", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-4", name: "Candy bar", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-5", name: "Angolo sigari", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-6", name: "Wine tasting corner", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-7", name: "Libro degli ospiti creativo", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: true, forRicevimento: true },
  { id: "exp-8", name: "Stazione cocktail personalizzati", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-9", name: "Area giochi bambini", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: false, forRicevimento: true },
  { id: "exp-10", name: "Riso/petali per lancio", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: true, forRicevimento: false },
  { id: "exp-11", name: "Wedding bag", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: true, forRicevimento: false },
  { id: "exp-12", name: "Ventagli personalizzati", category: "Coinvolgimento Ospiti/Esperienze", forCerimonia: true, forRicevimento: false },

  // Extra/Tecnica
  { id: "tec-1", name: "Videomaker/Drone", category: "Extra/Tecnica", forCerimonia: true, forRicevimento: true },
  { id: "tec-2", name: "Fotografo", category: "Extra/Tecnica", forCerimonia: true, forRicevimento: true },
  { id: "tec-3", name: "Luci sceniche", category: "Extra/Tecnica", forCerimonia: false, forRicevimento: true },
  { id: "tec-4", name: "Impianto audio", category: "Extra/Tecnica", forCerimonia: true, forRicevimento: true },
  { id: "tec-5", name: "Proiezione video", category: "Extra/Tecnica", forCerimonia: false, forRicevimento: true },
  { id: "tec-6", name: "Schermo LED", category: "Extra/Tecnica", forCerimonia: false, forRicevimento: true },
  { id: "tec-7", name: "Noleggio auto d'epoca", category: "Extra/Tecnica", forCerimonia: true, forRicevimento: false },
  { id: "tec-8", name: "Macchina del fumo", category: "Extra/Tecnica", forCerimonia: false, forRicevimento: true },
  { id: "tec-9", name: "Fontana di cioccolato", category: "Extra/Tecnica", forCerimonia: false, forRicevimento: true },
];

const CATEGORIES = [
  "Musica e Performance Live",
  "Animazione e Spettacolo",
  "Coinvolgimento Ospiti/Esperienze",
  "Extra/Tecnica",
];

export default function CoseMatrimonioPage() {
  const [activeTab, setActiveTab] = useState<"cerimonia" | "ricevimento">("cerimonia");
  const [selections, setSelections] = useState<Selection[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredOptions = ENTERTAINMENT_OPTIONS.filter((item) =>
    activeTab === "cerimonia" ? item.forCerimonia : item.forRicevimento
  );

  const addSelection = (item: EntertainmentItem) => {
    const newSelection: Selection = {
      id: `sel-${Date.now()}-${Math.random()}`,
      itemId: item.id,
      name: item.name,
      category: item.category,
      location: activeTab,
      notes: "",
    };
    setSelections([...selections, newSelection]);
  };

  const removeSelection = (id: string) => {
    setSelections(selections.filter((s) => s.id !== id));
  };

  const updateNotes = (id: string, notes: string) => {
    setSelections(selections.map((s) => (s.id === id ? { ...s, notes } : s)));
  };

  const ceremonySelections = selections.filter((s) => s.location === "cerimonia");
  const receptionSelections = selections.filter((s) => s.location === "ricevimento");

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Cose da Matrimonio · Intrattenimento</h2>

      <ImageCarousel images={PAGE_IMAGES["cose-matrimonio"]} height="280px" />

      <div className="my-6 flex gap-3">
        <button
          onClick={() => setActiveTab("cerimonia")}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeTab === "cerimonia"
              ? "bg-[#A3B59D] text-white shadow-lg"
              : "bg-white/70 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ⛪ Cerimonia ({ceremonySelections.length})
        </button>
        <button
          onClick={() => setActiveTab("ricevimento")}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeTab === "ricevimento"
              ? "bg-[#A3B59D] text-white shadow-lg"
              : "bg-white/70 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          🎉 Ricevimento ({receptionSelections.length})
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonna sinistra: selezione per categoria */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-3">
            Scegli per {activeTab === "cerimonia" ? "la Cerimonia" : "il Ricevimento"}
          </h3>
          {CATEGORIES.map((category) => {
            const categoryItems = filteredOptions.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="bg-white rounded-lg shadow border">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-left">{category}</span>
                  <span className="text-gray-500">
                    {isExpanded ? "−" : "+"} ({categoryItems.length})
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 space-y-2 border-t">
                    {categoryItems.map((item) => {
                      const alreadyAdded = selections.some(
                        (s) => s.itemId === item.id && s.location === activeTab
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <span className="text-sm">{item.name}</span>
                          <button
                            onClick={() => addSelection(item)}
                            disabled={alreadyAdded}
                            className={`text-xs px-3 py-1 rounded ${
                              alreadyAdded
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#A3B59D] text-white hover:bg-[#8a9d84]"
                            }`}
                          >
                            {alreadyAdded ? "✓ Aggiunto" : "+ Aggiungi"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Colonna destra: riepilogo selezioni */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-3">
            Selezionati per {activeTab === "cerimonia" ? "la Cerimonia" : "il Ricevimento"}
          </h3>
          {(activeTab === "cerimonia" ? ceremonySelections : receptionSelections).length === 0 ? (
            <div className="p-8 text-center bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500">Nessuna selezione ancora</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(activeTab === "cerimonia" ? ceremonySelections : receptionSelections).map((sel) => (
                <div key={sel.id} className="bg-white rounded-lg shadow p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{sel.name}</div>
                      <div className="text-xs text-gray-500">{sel.category}</div>
                    </div>
                    <button
                      onClick={() => removeSelection(sel.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Note (fornitore, orario, ecc.)"
                    value={sel.notes || ""}
                    onChange={(e) => updateNotes(sel.id, e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Riepilogo complessivo */}
      {selections.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-[#A3B59D]">
          <h3 className="text-xl font-bold mb-4">📊 Riepilogo Totale</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-[#A3B59D]">{ceremonySelections.length}</div>
              <div className="text-sm text-gray-600">Per la Cerimonia</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-[#A3B59D]">{receptionSelections.length}</div>
              <div className="text-sm text-gray-600">Per il Ricevimento</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
