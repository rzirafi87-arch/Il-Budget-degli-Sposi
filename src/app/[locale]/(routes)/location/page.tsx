"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { GB_HIERARCHY } from "@/constants/gbHierarchy";
import { GEO, getUserCountrySafe } from "@/constants/geo";
import { getGeographyLevels } from "@/lib/geographyFilters";
import { getPageImages } from "@/lib/pageImages";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export default function LocationiPage() {
  // TODO: Sostituire con logica reale per capire se l'utente è il fornitore
  const isSupplierView = false;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [country] = useState<string>(getUserCountrySafe());
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const geographyLevels = useMemo(() => getGeographyLevels(country), [country]);

  // Utility per ottenere le opzioni per ogni livello geografico (generica)
  function getOptionsForLevel(levelKey: string): string[] {
    const cc = country.toLowerCase();
    // UK: nation > region > county
    if (cc === "gb") {
      if (levelKey === "nation") return Object.keys(GB_HIERARCHY);
      if (levelKey === "region" && filterValues.nation) {
        const nation = GB_HIERARCHY[filterValues.nation];
        return nation ? Object.keys(nation.regions) : [];
      }
      if (levelKey === "county" && filterValues.nation && filterValues.region) {
        const nation = GB_HIERARCHY[filterValues.nation];
        return nation?.regions?.[filterValues.region] || [];
      }
    }
    // Common: region/state
    if ((levelKey === "region" || levelKey === "state") && GEO[cc]) {
      return (GEO[cc]?.regions ?? []).map((r: { name: string; provinces?: string[] }) => r.name);
    }
    // Province under selected region
    if (levelKey === "province" && filterValues.region && GEO[cc]) {
      const regionObj = (GEO[cc]?.regions ?? []).find((r: { name: string; provinces?: string[] }) => r.name === filterValues.region);
      return regionObj?.provinces ?? [];
    }
    // Fallback: empty
    if (levelKey === "type") return LOCATION_TYPES;
    return [];
  }

  // Form dinamico per tutti i livelli geografici
  const [formData, setFormData] = useState(() => {
    const initial: Record<string, string> = {
      name: "",
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
    };
    geographyLevels.forEach(lvl => { initial[lvl.key] = ""; });
    return initial;
  });

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => {
        const next = { ...prev, [key]: value };
        const levelIndex = geographyLevels.findIndex((level) => level.key === key);
        if (levelIndex >= 0) {
          for (let i = levelIndex + 1; i < geographyLevels.length; i += 1) {
            delete next[geographyLevels[i].key];
          }
        }
        if (value === "") {
          delete next[key];
        }
        return next;
      });
    },
    [geographyLevels]
  );

  const fetchLocations = useCallback(
    async (currentFilters: Record<string, string>, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      const normalizedCountry = (country || "").toLowerCase();
      if (normalizedCountry) {
        params.set("country", normalizedCountry);
      }
      const region = currentFilters.region?.trim();
      const province = currentFilters.province?.trim();
      const locationType = currentFilters.type?.trim().toLowerCase();
      if (region) params.set("region", region);
      if (province) params.set("province", province);
      if (locationType) params.set("type", locationType);

      try {
        const response = await fetch(`/api/locations?${params.toString()}`, { signal });
        if (!response.ok) {
          throw new Error("Impossibile recuperare le location");
        }
        const json = await response.json();
        if (signal?.aborted) return;
        setLocations(Array.isArray(json?.locations) ? (json.locations as Location[]) : []);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Errore nel caricamento delle location", err);
        setError("Non è stato possibile caricare le location. Riprova più tardi.");
        setLocations([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [country]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchLocations(filterValues, controller.signal);
    return () => controller.abort();
  }, [fetchLocations, filterValues]);

  return (
  <div className="min-h-screen bg-linear-to-br from-[#A3B59D] via-white to-[#A3B59D] p-8">
      <div className="max-w-7xl mx-auto">
        <ImageCarousel images={getPageImages("location", country)} height="280px" />
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800">🏛️ Location Ricevimento</h1>
          <p className="text-gray-700 text-sm sm:text-base max-w-3xl mt-2">
            Scopri e proponi ville, castelli, agriturismi e altri spazi dedicati al ricevimento. Filtra per area geografica e
            tipologia per trovare la location perfetta.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Filtri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {geographyLevels.map((level: { key: string; label: string }, idx: number) => {
              const options = getOptionsForLevel(level.key);
              const isDisabled = idx > 0 && !filterValues[geographyLevels[idx - 1].key];
              return (
                <div key={level.key}>
                  <label className="block text-sm font-semibold mb-2">{level.label}</label>
                  <select
                    value={filterValues[level.key] || ""}
                    onChange={(e) => handleFilterChange(level.key, e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={isDisabled}
                  >
                    <option value="">Tutte</option>
                    {options.map((opt: string) => {
                      const optionValue = level.key === "type" ? opt.toLowerCase() : opt;
                      return (
                        <option key={opt} value={optionValue}>{opt}</option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
        <form className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Aggiungi Location Ricevimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tipo Location *</label>
              <select
                required
                value={formData.location_type}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleziona...</option>
                {LOCATION_TYPES.map((t: string) => (
                  <option key={t} value={t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>
            {/* Geography levels dynamic fields */}
            {geographyLevels.map((level, idx) => {
              const options = getOptionsForLevel(level.key);
              const isDisabled = idx > 0 && !formData[geographyLevels[idx - 1].key];
              return (
                <div key={level.key}>
                  <label className="block text-sm font-semibold mb-1">{level.label} *</label>
                  <select
                    required
                    value={formData[level.key] || ""}
                    onChange={e => setFormData({ ...formData, [level.key]: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    disabled={isDisabled}
                  >
                    <option value="">Seleziona...</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}
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
                Aggiungi Location Ricevimento
              </button>
            </div>
          </div>
        </form>
        <div>
          {loading ? (
            <div className="text-center py-12">Caricamento...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nessuna location trovata. Prova a cambiare i filtri o aggiungi la prima!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location: Location) => (
                <div
                  key={location.id}
                  className={clsx(
                    "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                    location.verified && "border-2 border-green-500"
                  )}
                >
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
                    {/* Badge Preferiti */}
                    <button
                      className="bg-white border border-[#A3B59D] text-[#A3B59D] text-xs px-2 py-1 rounded hover:bg-[#A3B59D] hover:text-white transition-colors font-semibold ml-2"
                      title="Aggiungi ai preferiti"
                      // onClick={() => handleFavorite(location.id)}
                    >
                      Preferiti
                    </button>
                    {/* Badge Verificato solo se fornitore loggato e location verificata */}
                    {location.verified && isSupplierView && (
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
                      <span className="font-semibold">� Prezzo:</span> {location.price_range}
                    </p>
                  )}
                  {location.description && (
                    <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                  )}
                  {location.website && (
                    <a
                      href={location.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A3B59D] underline text-sm"
                    >
                      Sito web
                    </a>
                  )}
                  {/* ...altri dettagli... */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
