"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

type Church = {
  id: string;
  name: string;
  region: string;
  province: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  church_type?: string;
  capacity?: number;
  requires_baptism: boolean;
  requires_marriage_course: boolean;
  verified: boolean;
};

const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

const CHURCH_TYPES = [
  "Cattolica",
  "Ortodossa",
  "Protestante",
  "Evangelica",
  "Anglicana",
  "Sinagoga",
  "Moschea",
  "Altro"
];

export default function CerimoniaChiesaPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    province: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    church_type: "",
    capacity: "",
    requires_baptism: false,
    requires_marriage_course: false,
  });

  const loadChurches = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedType) params.append("type", selectedType);

      const res = await fetch(`/api/churches?${params.toString()}`);
      const data = await res.json();
      setChurches(data.churches || []);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedProvince, selectedType]);

  useEffect(() => {
    loadChurches();
  }, [loadChurches]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const jwt = localStorage.getItem("sb_jwt");
    if (!jwt) {
      alert("Devi essere autenticato per aggiungere una chiesa");
      return;
    }

    try {
      const res = await fetch("/api/churches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore durante l'aggiunta");
      }

      alert("Chiesa aggiunta con successo! Sarà visibile dopo la verifica dello staff.");
      setShowAddForm(false);
      setFormData({
        name: "",
        region: "",
        province: "",
        city: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        church_type: "",
        capacity: "",
        requires_baptism: false,
        requires_marriage_course: false,
      });
      loadChurches();
    } catch (e) {
      const error = e as Error;
      alert(error.message || "Errore durante l'aggiunta");
    }
  }

  const provinces = selectedRegion
    ? Array.from(new Set(churches.filter(c => c.region === selectedRegion).map(c => c.province))).sort()
    : [];

  const filteredChurches = churches;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A3B59D] via-white to-[#A3B59D] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Carosello immagini */}
        <ImageCarousel images={PAGE_IMAGES.chiese} height="280px" />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Cerimonia · Chiesa</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] transition-colors font-semibold"
          >
            {showAddForm ? "Annulla" : "+ Aggiungi Chiesa"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Aggiungi Nuova Chiesa</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Tipo *</label>
                <select
                  required
                  value={formData.church_type}
                  onChange={(e) => setFormData({ ...formData, church_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleziona...</option>
                  {CHURCH_TYPES.map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Regione *</label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleziona...</option>
                  {ITALIAN_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Provincia *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Roma, Milano, Napoli"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Città *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Indirizzo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Sito Web</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Capacità (persone)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder="Descrivi la chiesa, caratteristiche, servizi..."
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_baptism}
                    onChange={(e) => setFormData({ ...formData, requires_baptism: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Richiede Battesimo</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_marriage_course}
                    onChange={(e) => setFormData({ ...formData, requires_marriage_course: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Richiede Corso Prematrimoniale</span>
                </label>
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#A3B59D] text-white py-3 rounded-lg hover:bg-[#8fa085] font-semibold"
                >
                  Aggiungi Chiesa
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtri */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Filtri</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Regione</label>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedProvince("");
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tutte</option>
                {ITALIAN_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Provincia</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                disabled={!selectedRegion}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Tutte</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tutti</option>
                {CHURCH_TYPES.map(t => (
                  <option key={t} value={t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista Chiese */}
        {loading ? (
          <div className="text-center py-12">Caricamento...</div>
        ) : filteredChurches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nessuna chiesa trovata. Prova a cambiare i filtri o aggiungi la prima!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church) => (
              <div
                key={church.id}
                className={clsx(
                  "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                  church.verified && "border-2 border-green-500"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{church.name}</h3>
                  {church.verified && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Verificato
                    </span>
                  )}
                </div>

                {church.church_type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Tipo:</span> {church.church_type.charAt(0).toUpperCase() + church.church_type.slice(1)}
                  </p>
                )}

                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">📍</span> {church.city}, {church.province} ({church.region})
                </p>

                {church.address && (
                  <p className="text-sm text-gray-600 mb-2">{church.address}</p>
                )}

                {church.capacity && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">👥 Capacità:</span> {church.capacity} persone
                  </p>
                )}

                {(church.requires_baptism || church.requires_marriage_course) && (
                  <div className="mb-3 space-y-1">
                    {church.requires_baptism && (
                      <p className="text-xs text-orange-600">⚠️ Richiede Battesimo</p>
                    )}
                    {church.requires_marriage_course && (
                      <p className="text-xs text-orange-600">⚠️ Richiede Corso Prematrimoniale</p>
                    )}
                  </div>
                )}

                {church.description && (
                  <p className="text-sm text-gray-700 mb-3 italic">{church.description}</p>
                )}

                <div className="border-t pt-3 space-y-1">
                  {church.phone && (
                    <p className="text-sm">
                      <span className="font-semibold">📞</span>{" "}
                      <a href={`tel:${church.phone}`} className="text-blue-600 hover:underline">
                        {church.phone}
                      </a>
                    </p>
                  )}
                  {church.email && (
                    <p className="text-sm">
                      <span className="font-semibold">✉️</span>{" "}
                      <a href={`mailto:${church.email}`} className="text-blue-600 hover:underline">
                        {church.email}
                      </a>
                    </p>
                  )}
                  {church.website && (
                    <p className="text-sm">
                      <span className="font-semibold">🌐</span>{" "}
                      <a
                        href={church.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sito Web
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
