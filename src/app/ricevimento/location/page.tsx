"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";

type Location = {
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
  price_range?: string;
  capacity_min?: number;
  capacity_max?: number;
  location_type?: string;
  verified: boolean;
};

const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

const LOCATION_TYPES = [
  "Villa",
  "Castello",
  "Agriturismo",
  "Masseria",
  "Ristorante",
  "Hotel",
  "Resort",
  "Tenuta",
  "Giardino",
  "Spiaggia",
  "Altro"
];

export default function LocationRicevimentoPage() {
  const [locations, setLocations] = useState<Location[]>([]);
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
    price_range: "",
    capacity_min: "",
    capacity_max: "",
    location_type: "",
  });

  useEffect(() => {
    loadLocations();
  }, [selectedRegion, selectedProvince, selectedType]);

  async function loadLocations() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedType) params.append("type", selectedType);

      const res = await fetch(`/api/locations?${params.toString()}`);
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const jwt = localStorage.getItem("sb_jwt");
    if (!jwt) {
      alert("Devi essere autenticato per aggiungere una location");
      return;
    }

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : null,
          capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore durante l'aggiunta");
      }

      alert("Location aggiunta con successo! Sarà visibile dopo la verifica dello staff.");
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
        price_range: "",
        capacity_min: "",
        capacity_max: "",
        location_type: "",
      });
      loadLocations();
    } catch (e: any) {
      alert(e.message || "Errore durante l'aggiunta");
    }
  }

  const provinces = selectedRegion
    ? Array.from(new Set(locations.filter(l => l.region === selectedRegion).map(l => l.province))).sort()
    : [];

  const filteredLocations = locations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3B59D] via-white to-[#A3B59D] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Carosello immagini */}
        <ImageCarousel images={PAGE_IMAGES.location} height="280px" />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Ricevimento · Location</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] transition-colors font-semibold"
          >
            {showAddForm ? "Annulla" : "+ Aggiungi Location"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Aggiungi Nuova Location</h2>
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
                <label className="block text-sm font-semibold mb-1">Tipo Location *</label>
                <select
                  required
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleziona...</option>
                  {LOCATION_TYPES.map(t => (
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
                <label className="block text-sm font-semibold mb-1">Fascia di Prezzo</label>
                <input
                  type="text"
                  placeholder="es. €€€, 50-100€ a persona"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Capacità Minima (persone)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity_min}
                  onChange={(e) => setFormData({ ...formData, capacity_min: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Capacità Massima (persone)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity_max}
                  onChange={(e) => setFormData({ ...formData, capacity_max: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder="Descrivi la location, i servizi offerti, particolarità..."
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#A3B59D] text-white py-3 rounded-lg hover:bg-[#8fa085] font-semibold"
                >
                  Aggiungi Location
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
              <label className="block text-sm font-semibold mb-2">Tipo Location</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tutti</option>
                {LOCATION_TYPES.map(t => (
                  <option key={t} value={t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista Location */}
        {loading ? (
          <div className="text-center py-12">Caricamento...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nessuna location trovata. Prova a cambiare i filtri o aggiungi la prima!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className={clsx(
                  "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                  location.verified && "border-2 border-green-500"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
                  {location.verified && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Verificato
                    </span>
                  )}
                </div>

                {location.location_type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Tipo:</span> {location.location_type.charAt(0).toUpperCase() + location.location_type.slice(1)}
                  </p>
                )}

                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">📍</span> {location.city}, {location.province} ({location.region})
                </p>

                {location.address && (
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                )}

                {(location.capacity_min || location.capacity_max) && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">👥 Capacità:</span>{" "}
                    {location.capacity_min && location.capacity_max
                      ? `${location.capacity_min}-${location.capacity_max} persone`
                      : location.capacity_min
                      ? `da ${location.capacity_min} persone`
                      : `fino a ${location.capacity_max} persone`}
                  </p>
                )}

                {location.price_range && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">💰</span> {location.price_range}
                  </p>
                )}

                {location.description && (
                  <p className="text-sm text-gray-700 mb-3 italic">{location.description}</p>
                )}

                <div className="border-t pt-3 space-y-1">
                  {location.phone && (
                    <p className="text-sm">
                      <span className="font-semibold">📞</span>{" "}
                      <a href={`tel:${location.phone}`} className="text-blue-600 hover:underline">
                        {location.phone}
                      </a>
                    </p>
                  )}
                  {location.email && (
                    <p className="text-sm">
                      <span className="font-semibold">✉️</span>{" "}
                      <a href={`mailto:${location.email}`} className="text-blue-600 hover:underline">
                        {location.email}
                      </a>
                    </p>
                  )}
                  {location.website && (
                    <p className="text-sm">
                      <span className="font-semibold">🌐</span>{" "}
                      <a
                        href={location.website}
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
