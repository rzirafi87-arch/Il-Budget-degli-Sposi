"use client";

import Link from "next/link";
import { useState } from "react";

// Supplier categories with their routes
const SUPPLIER_CATEGORIES = [
  { href: "/atelier", label: "Atelier", icon: "👗", description: "Abiti sposa e cerimonia" },
  { href: "/fotografi", label: "Fotografi", icon: "📸", description: "Servizi foto e video" },
  { href: "/fiorai", label: "Fiorai", icon: "💐", description: "Bouquet e allestimenti floreali" },
  { href: "/catering", label: "Catering", icon: "🍽️", description: "Banqueting e ristorazione" },
  { href: "/beauty", label: "Make-up & Beauty", icon: "💄", description: "Trucco, acconciatura e benessere" },
  { href: "/gioiellerie", label: "Gioiellerie", icon: "💍", description: "Fedi, anelli e gioielli" },
  { href: "/wedding-planner", label: "Wedding Planner", icon: "📋", description: "Organizzazione completa matrimonio" },
  { href: "/musica-cerimonia", label: "Musica Cerimonia", icon: "🎵", description: "Musicisti per la cerimonia" },
  { href: "/musica-ricevimento", label: "Musica Ricevimento", icon: "🎶", description: "DJ, band e intrattenimento" },
];

export default function FornitoriHubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = SUPPLIER_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2">🏢 Fornitori</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        Esplora e gestisci i fornitori per ogni aspetto del tuo matrimonio. 
        Trova professionisti nella tua zona, confronta preventivi e salva i tuoi preferiti.
      </p>

      {/* Search bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Cerca categoria fornitore..."
          className="w-full max-w-xl px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#A3B59D] focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group p-6 rounded-2xl border-2 border-gray-200 bg-white/70 hover:border-[#A3B59D] hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#A3B59D] transition-colors">
                  {category.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.description}
                </p>
                <div className="mt-3 text-sm font-semibold text-[#A3B59D] group-hover:underline">
                  Esplora →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Nessuna categoria trovata per "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-[#A3B59D] hover:underline font-semibold"
          >
            Mostra tutte le categorie
          </button>
        </div>
      )}

      {/* Additional info */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#A3B59D]/10 to-[#A3B59D]/5 border border-[#A3B59D]/30">
        <h3 className="font-bold text-lg mb-3">💡 Suggerimento</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Per ogni categoria potrai cercare fornitori nella tua zona, filtrare per prezzo e servizi,
          confrontare preventivi e salvare i tuoi preferiti. Ogni fornitore può essere aggiunto direttamente
          alle spese del tuo budget.
        </p>
      </div>
    </section>
  );
}
