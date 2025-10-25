"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

type WeddingPlanner = {
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
  services?: string; // es: "Full planning, Partial planning, Consulenza"
  verified: boolean;
  status: "pending" | "approved" | "rejected";
};

const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export default function WeddingPlannerPage() {
  const [planners, setPlanners] = useState<WeddingPlanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
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
    services: "",
  });

  useEffect(() => {
    loadPlanners();
  }, [selectedRegion, selectedProvince]);

  async function loadPlanners() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);

      const res = await fetch(`/api/wedding-planner?${params.toString()}`);
      const data = await res.json();
      setPlanners(data.planners || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/wedding-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Wedding planner inviato! Sarà verificato prima della pubblicazione.");
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
          services: "",
        });
        setShowAddForm(false);
        loadPlanners();
      } else {
        alert("Errore nell'invio");
      }
    } catch (e) {
      console.error(e);
      alert("Errore di rete");
    }
  }

  const approvedPlanners = planners.filter(p => p.status === "approved");

  return (
    <section className="pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-[#A3B59D] transition-colors">
          🏠 Home
        </Link>
        <span>›</span>
        <Link href="/fornitori" className="hover:text-[#A3B59D] transition-colors">
          Fornitori
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Wedding Planner</span>
      </nav>

      {/* Header con bottone Torna a Fornitori */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="font-serif text-3xl mb-2">Wedding Planner</h2>
          <p className="text-sm text-gray-600">
            Trova wedding planner verificati per organizzare il tuo matrimonio perfetto.
            Puoi proporre nuovi professionisti che verranno verificati prima della pubblicazione.
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
      <ImageCarousel images={PAGE_IMAGES["wedding-planner"]} height="280px" />

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
            placeholder="Es: Milano"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
          >
            {showAddForm ? "Annulla" : "+ Proponi un wedding planner"}
          </button>
        </div>
      </div>

      {/* Form aggiunta */}
      {showAddForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">Proponi un nuovo wedding planner</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Studio *</label>
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
                  placeholder="Es: €€-€€€"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Servizi offerti</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Es: Full planning, Partial planning, Consulenza giorno"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
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
      ) : approvedPlanners.length === 0 ? (
        <div className="p-10 text-center text-gray-400 rounded-2xl border border-gray-200 bg-white/70">
          Nessun wedding planner trovato per i filtri selezionati
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedPlanners.map((planner) => (
            <div
              key={planner.id}
              className="p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{planner.name}</h3>
                {planner.verified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">✓ Verificato</span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <div>📍 {planner.city}, {planner.province} ({planner.region})</div>
                {planner.phone && <div>📞 {planner.phone}</div>}
                {planner.email && <div>📧 {planner.email}</div>}
                {planner.website && (
                  <div>
                    🌐 <a href={planner.website} target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] hover:underline">
                      {planner.website}
                    </a>
                  </div>
                )}
                {planner.price_range && <div>💰 {planner.price_range}</div>}
                {planner.services && <div>🎯 {planner.services}</div>}
              </div>
              {planner.description && (
                <p className="text-sm text-gray-700 mt-2">{planner.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
