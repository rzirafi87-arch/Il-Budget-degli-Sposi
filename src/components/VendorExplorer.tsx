"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  name: string;
  type: string;
  rating?: number;
  ratingCount?: number;
  priceRange?: string;
  verified: boolean;
  description?: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location: {
    lat: number;
    lng: number;
    address?: string;
    city: string;
    province: string;
    region: string;
  } | null;
  source: {
    type: string;
    googlePlaceId?: string;
    osmId?: string;
  };
}

interface VendorExplorerProps {
  initialType?: string;
  initialRegion?: string;
}

const VENDOR_TYPES = [
  { value: "location", label: "Location Ricevimento" },
  { value: "church", label: "Chiese" },
  { value: "planner", label: "Wedding Planner" },
  { value: "band", label: "Band/Musica" },
  { value: "dj", label: "DJ" },
  { value: "photographer", label: "Fotogralo" },
  { value: "videographer", label: "Videomaker" },
  { value: "florist", label: "Fiorista" },
  { value: "caterer", label: "Catering" },
];

const ITALIAN_REGIONS = [
  "Sicilia", "Lombardia", "Lazio", "Toscana", "Campania",
  "Veneto", "Piemonte", "Emilia-Romagna", "Puglia", "Calabria",
  "Sardegna", "Liguria", "Marche", "Umbria", "Abruzzo",
  "Basilicata", "Molise", "Friuli-Venezia Giulia",
  "Trentino-Alto Adige", "Valle d'Aosta",
];

// Stati/regioni del Messico
const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

export default function VendorExplorer({
  initialType = "location",
  initialRegion,
}: VendorExplorerProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [type, setType] = useState(initialType);
  const [region, setRegion] = useState(initialRegion || "");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  const [priceRange, setPriceRange] = useState("");

  // Pagination
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);

  useEffect(() => {
    fetchVendors();
  }, [type, region, city, minRating, verified, priceRange, offset]);

  async function fetchVendors() {
    setLoading(true);

    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (minRating) params.set("minRating", minRating.toString());
    if (verified) params.set("verified", "true");
    if (priceRange) params.set("priceRange", priceRange);

    try {
      const response = await fetch(`/api/vendors?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setVendors(result.data);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setRegion("");
    setCity("");
    setMinRating(undefined);
    setVerified(false);
    setPriceRange("");
    setOffset(0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Esplora Fornitori Matrimonio
          </h1>
          <p className="text-gray-600">
            Trova i migliori fornitori per il tuo evento da fonti verificate
            (Google Places, OpenStreetMap)
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Fornitore
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setOffset(0);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent"
              >
                {VENDOR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regione
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setOffset(0);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent"
              >
                <option value="">Tutte le regioni</option>
                {(
                  (typeof window !== 'undefined' && (localStorage.getItem('country') || 'it')) === 'mx'
                    ? MEXICAN_STATES
                    : ITALIAN_REGIONS
                ).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Città
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setOffset(0);
                }}
                placeholder="Es: Palermo"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valutazione Minima
              </label>
              <select
                value={minRating || ""}
                onChange={(e) => {
                  setMinRating(e.target.value ? parseFloat(e.target.value) : undefined);
                  setOffset(0);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent"
              >
                <option value="">Qualsiasi</option>
                <option value="3.0">3.0+</option>
                <option value="3.5">3.5+</option>
                <option value="4.0">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fascia Prezzo
              </label>
              <select
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(e.target.value);
                  setOffset(0);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent"
              >
                <option value="">Qualsiasi</option>
                <option value="€">€ - Economico</option>
                <option value="€€">€€ - Medio</option>
                <option value="€€€">€€€ - Alto</option>
                <option value="€€€€">€€€€ - Lusso</option>
              </select>
            </div>

            {/* Verified */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => {
                    setVerified(e.target.checked);
                    setOffset(0);
                  }}
                  className="w-5 h-5 text-[#A3B59D] border-gray-300 rounded focus:ring-[#A3B59D]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo Verificati
                </span>
              </label>
            </div>

            {/* Reset */}
            <div className="flex items-end lg:col-span-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Reset Filtri
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {loading ? (
            <span>Caricamento...</span>
          ) : (
            <span>
              Trovati <strong>{total}</strong> fornitori
            </span>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B59D] mx-auto"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Nessun fornitore trovato con i filtri selezionati.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Precedente
            </button>
            
            <span className="text-gray-600">
              Pagina {Math.floor(offset / limit) + 1} di {Math.ceil(total / limit)}
            </span>
            
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with badge */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800 flex-1">
            {vendor.name}
          </h3>
          {vendor.verified && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✓ Verificato
            </span>
          )}
        </div>

        {/* Rating */}
        {vendor.rating && (
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 font-bold text-lg">
              {"★".repeat(Math.round(vendor.rating))}
              {"☆".repeat(5 - Math.round(vendor.rating))}
            </span>
            <span className="ml-2 text-gray-600 text-sm">
              {vendor.rating.toFixed(1)} ({vendor.ratingCount} recensioni)
            </span>
          </div>
        )}

        {/* Price Range */}
        {vendor.priceRange && (
          <div className="mb-3">
            <span className="text-gray-600 font-medium">{vendor.priceRange}</span>
          </div>
        )}

        {/* Description */}
        {vendor.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {vendor.description}
          </p>
        )}

        {/* Location */}
        {vendor.location && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">📍</span>{" "}
            {vendor.location.city}, {vendor.location.province}
            {vendor.location.address && (
              <div className="text-xs text-gray-500 mt-1">
                {vendor.location.address}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="space-y-2 mb-4">
          {vendor.contact.phone && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Tel:</span>{" "}
              <a href={`tel:${vendor.contact.phone}`} className="text-[#A3B59D] hover:underline">
                {vendor.contact.phone}
              </a>
            </div>
          )}
          {vendor.contact.email && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Email:</span>{" "}
              <a href={`mailto:${vendor.contact.email}`} className="text-[#A3B59D] hover:underline">
                {vendor.contact.email}
              </a>
            </div>
          )}
          {vendor.contact.website && (
            <div className="text-sm">
              <a
                href={vendor.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3B59D] hover:underline font-medium"
              >
                Visita il sito →
              </a>
            </div>
          )}
        </div>

        {/* Source badge */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Dati da{" "}
            {vendor.source.type === "google" ? "Google Places" : 
             vendor.source.type === "osm" ? "OpenStreetMap" : 
             vendor.source.type}
          </span>
        </div>
      </div>
    </div>
  );
}
