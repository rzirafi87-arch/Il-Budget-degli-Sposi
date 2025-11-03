"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ImageCarousel from "@/components/ImageCarousel";
import { getUserCountrySafe } from "@/constants/geo";
import { getPageImages } from "@/lib/pageImages";

type MusicaCerimonia = {
  id: string;
  name: string;
  region: string;
  province: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  price_range?: string;
  music_type?: string; // es: "Coro, Organo, Arpa, Violino, Band"
  verified: boolean;
  status: "pending" | "approved" | "rejected";
};

const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export default function MusicaCerimoniaPage() {
  const [musicians, setMusicians] = useState<MusicaCerimonia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const country = getUserCountrySafe();
  
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    province: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    price_range: "",
    music_type: "",
  });

  useEffect(() => {
    loadMusicians();
  }, [selectedRegion, selectedProvince]);

  async function loadMusicians() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);
      try {
        const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
        const lsCountry = localStorage.getItem("country");
        const country = cookieCountry || lsCountry;
        if (country) params.append("country", country);
      } catch {}

      const res = await fetch(`/api/musica-cerimonia?${params.toString()}`);
      const data = await res.json();
      setMusicians(data.musicians || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/musica-cerimonia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Musica cerimonia inviata! Sarà verificata prima della pubblicazione.");
        setFormData({
          name: "",
          region: "",
          province: "",
          city: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          price_range: "",
          music_type: "",
        });
        setShowAddForm(false);
        loadMusicians();
      } else {
        alert("Errore nell'invio");
      }
    } catch (e) {
      console.error(e);
      alert("Errore di rete");
    }
  }

  const approvedMusicians = musicians.filter(m => m.status === "approved");

  return (
    <section className="pt-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "🏠 Home", href: "/" },
          { label: "Fornitori", href: "/fornitori" },
          { label: "Musica Cerimonia" },
        ]}
      />

      {/* Header con bottone Torna a Fornitori */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="font-serif text-3xl mb-2">Musica Cerimonia</h2>
          <p className="text-sm text-gray-600">
            Trova musicisti e gruppi verificati per la cerimonia nuziale. Puoi proporre nuovi artisti che verranno verificati prima della pubblicazione.
          </p>
        </div>
        <Link
          href="/fornitori"
          className="ml-4 px-4 py-2 bg-white border-2 border-[#A3B59D] text-[#A3B59D] rounded-lg hover:bg-[#A3B59D] hover:text-white transition-colors font-semibold text-sm whitespace-nowrap"
        >
          ← Tutti i Fornitori
        </Link>
      </div>

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("musica-cerimonia", country)} height="280px" />

      {/* Filtri */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Regione</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedProvince("");
            }}
          >
            <option value="">Tutte le regioni</option>
            {ITALIAN_REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Es: Roma"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
          >
            {showAddForm ? "Annulla" : "+ Proponi musicista/gruppo"}
          </button>
        </div>
      </div>

      {/* Form aggiunta */}
      {showAddForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">Proponi musicista/gruppo</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome artista/gruppo *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regione *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                >
                  <option value="">Seleziona...</option>
                  {ITALIAN_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sito web</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fascia di prezzo</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Es: €€"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di musica</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Es: Coro, Organo, Arpa, Violino, Band"
                  value={formData.music_type}
                  onChange={(e) => setFormData({ ...formData, music_type: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84]"
            >
              Invia per approvazione
            </button>
          </form>
        </div>
      )}

      {/* Risultati */}
      {loading ? (
        <div className="text-gray-500">Caricamento...</div>
      ) : approvedMusicians.length === 0 ? (
        <div className="p-10 text-center text-gray-400 rounded-2xl border border-gray-200 bg-white/70">
          Nessun musicista trovato per i filtri selezionati
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedMusicians.map((musician) => (
            <div
              key={musician.id}
              className="p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{musician.name}</h3>
                {musician.verified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">✓ Verificato</span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <div>📍 {musician.city}, {musician.province} ({musician.region})</div>
                {musician.phone && <div>📞 {musician.phone}</div>}
                {musician.email && <div>📧 {musician.email}</div>}
                {musician.website && (
                  <div>
                    🌐 <a href={musician.website} target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] hover:underline">
                      {musician.website}
                    </a>
                  </div>
                )}
                {musician.price_range && <div>💰 {musician.price_range}</div>}
                {musician.music_type && <div>🎵 {musician.music_type}</div>}
              </div>
              {musician.description && (
                <p className="text-sm text-gray-700 mt-2">{musician.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
