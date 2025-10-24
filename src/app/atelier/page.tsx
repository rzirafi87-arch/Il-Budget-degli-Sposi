"use client";

import { useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

type AtelierItem = {
  id: string;
  name: string;
  category: string;
  region: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  priceRange?: string;
  styles?: string[];
};

// Dati demo per atelier sposa
const ATELIER_SPOSA_DEMO: AtelierItem[] = [
  {
    id: "1",
    name: "Atelier Aimée",
    category: "Abiti Sposa",
    region: "Lombardia",
    city: "Milano",
    address: "Via Montenapoleone, 8",
    phone: "+39 02 1234567",
    email: "info@atelieraimee.it",
    website: "https://www.atelieraimee.it",
    description: "Collezioni esclusive di abiti da sposa haute couture con tessuti pregiati italiani",
    priceRange: "€€€€",
    styles: ["Classico", "Romantico", "Principessa"]
  },
  {
    id: "2",
    name: "Pronovias",
    category: "Abiti Sposa",
    region: "Lazio",
    city: "Roma",
    address: "Via del Corso, 123",
    phone: "+39 06 9876543",
    email: "roma@pronovias.it",
    website: "https://www.pronovias.it",
    description: "Brand internazionale con collezioni moderne e sofisticate",
    priceRange: "€€€",
    styles: ["Moderno", "Elegante", "Boho"]
  },
  {
    id: "3",
    name: "Atelier Emé",
    category: "Abiti Sposa",
    region: "Veneto",
    city: "Venezia",
    address: "Piazza San Marco, 45",
    phone: "+39 041 5551234",
    email: "venezia@ateliereme.it",
    website: "https://www.ateliereme.it",
    description: "Tradizione artigianale veneziana con dettagli unici",
    priceRange: "€€€",
    styles: ["Vintage", "Romantico", "Raffinato"]
  }
];

// Dati demo per atelier sposo
const ATELIER_SPOSO_DEMO: AtelierItem[] = [
  {
    id: "1",
    name: "Carlo Pignatelli",
    category: "Abiti Sposo",
    region: "Lombardia",
    city: "Milano",
    address: "Corso Venezia, 15",
    phone: "+39 02 7654321",
    email: "milano@carlopignatelli.it",
    website: "https://www.carlopignatelli.it",
    description: "Eccellenza italiana nel menswear formale, smoking e tight",
    priceRange: "€€€€",
    styles: ["Classico", "Elegante", "Sartoriale"]
  },
  {
    id: "2",
    name: "Lubiam",
    category: "Abiti Sposo",
    region: "Lombardia",
    city: "Mantova",
    address: "Via Mantova, 88",
    phone: "+39 0376 123456",
    email: "info@lubiam.it",
    website: "https://www.lubiam.it",
    description: "Sartoria moderna con taglio impeccabile e tessuti pregiati",
    priceRange: "€€€",
    styles: ["Moderno", "Slim Fit", "Business"]
  },
  {
    id: "3",
    name: "Gentlemen's Corner",
    category: "Abiti Sposo",
    region: "Toscana",
    city: "Firenze",
    address: "Via Tornabuoni, 22",
    phone: "+39 055 9988776",
    email: "firenze@gentlemenscorner.it",
    website: "https://www.gentlemenscorner.it",
    description: "Noleggio e vendita di abiti da cerimonia con ampia scelta di accessori",
    priceRange: "€€",
    styles: ["Classico", "Vintage", "Contemporary"]
  }
];

export default function AtelierPage() {
  const [activeTab, setActiveTab] = useState<"sposa" | "sposo">("sposa");
  const [atelierSposa] = useState<AtelierItem[]>(ATELIER_SPOSA_DEMO);
  const [atelierSposo] = useState<AtelierItem[]>(ATELIER_SPOSO_DEMO);

  const currentAteliers = activeTab === "sposa" ? atelierSposa : atelierSposo;

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2">👗🤵 Atelier</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Scopri gli atelier più prestigiosi per l'abito da sposa e da sposo. 
        Trova boutique esclusive, brand internazionali e sartorie artigianali per il tuo look perfetto.
      </p>

      {/* Carosello immagini */}
      <ImageCarousel images={PAGE_IMAGES.atelier || PAGE_IMAGES.dashboard} height="280px" />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("sposa")}
          className={`px-6 py-3 font-semibold text-base transition-all ${
            activeTab === "sposa"
              ? "border-b-4 border-pink-500 text-pink-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          👰 Atelier Sposa
        </button>
        <button
          onClick={() => setActiveTab("sposo")}
          className={`px-6 py-3 font-semibold text-base transition-all ${
            activeTab === "sposo"
              ? "border-b-4 border-blue-500 text-blue-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🤵 Atelier Sposo
        </button>
      </div>

      {/* Atelier List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAteliers.map((atelier) => (
          <div
            key={atelier.id}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-all hover:scale-105 transform"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800">{atelier.name}</h3>
              <span className="text-2xl">{activeTab === "sposa" ? "👰" : "🤵"}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📍</span>
                <span>{atelier.city}, {atelier.region}</span>
              </div>
              {atelier.address && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">🏠</span>
                  <span>{atelier.address}</span>
                </div>
              )}
              {atelier.phone && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">📞</span>
                  <a href={`tel:${atelier.phone}`} className="text-blue-600 hover:underline">
                    {atelier.phone}
                  </a>
                </div>
              )}
              {atelier.email && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">✉️</span>
                  <a href={`mailto:${atelier.email}`} className="text-blue-600 hover:underline">
                    {atelier.email}
                  </a>
                </div>
              )}
              {atelier.website && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">🌐</span>
                  <a
                    href={atelier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visita sito
                  </a>
                </div>
              )}
            </div>

            {atelier.description && (
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {atelier.description}
              </p>
            )}

            {atelier.priceRange && (
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-500">FASCIA PREZZO: </span>
                <span className="text-sm font-bold text-gray-700">{atelier.priceRange}</span>
              </div>
            )}

            {atelier.styles && atelier.styles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {atelier.styles.map((style, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      activeTab === "sposa"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {style}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentAteliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nessun atelier disponibile al momento. Torna presto per nuove aggiunte! ✨
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 p-6 bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl border border-gray-200">
        <h4 className="font-bold text-lg mb-2 text-gray-800">💡 Suggerimenti per la scelta</h4>
        <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
          <li>• Prenota l'appuntamento con almeno 8-12 mesi di anticipo</li>
          <li>• Porta con te scarpe con il tacco che indosserai il giorno del matrimonio</li>
          <li>• Considera almeno 2-3 prove per aggiustamenti e ritocchi</li>
          <li>• Chiedi informazioni su tempi di consegna e modifiche incluse nel prezzo</li>
          <li>• Per lo sposo, valuta sia acquisto che noleggio in base al budget</li>
        </ul>
      </div>
    </section>
  );
}
