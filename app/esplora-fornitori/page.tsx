"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Vendor {
  id: string;
  name: string;
  type: string;
  rating: number | null;
  ratingCount: number;
  priceRange: string | null;
  verified: boolean;
  description: string | null;
  contact: {
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  location: {
    city: string;
    province: string;
    region: string;
    address: string | null;
  } | null;
  source: {
    type: string;
  };
}

const VENDOR_TYPES = [
  { value: "location", label: "Location & Ricevimenti" },
  { value: "church", label: "Chiese" },
  { value: "photographer", label: "Fotografi" },
  { value: "videographer", label: "Videomaker" },
  { value: "caterer", label: "Catering" },
  { value: "florist", label: "Fioristi" },
  { value: "band", label: "Band & Musica" },
  { value: "dj", label: "DJ" },
  { value: "planner", label: "Wedding Planner" },
];

const ITALIAN_REGIONS = [
  "Sicilia", "Lombardia", "Lazio", "Toscana", "Campania", "Veneto",
  "Piemonte", "Emilia-Romagna", "Puglia", "Calabria", "Sardegna",
  "Liguria", "Marche", "Umbria", "Abruzzo", "Basilicata", "Molise",
  "Friuli-Venezia Giulia", "Trentino-Alto Adige", "Valle d'Aosta"
];

export default function VendorExplorerPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    region: "",
    city: "",
    minRating: 0,
    verified: false,
    source: "",
  });

  useEffect(() => {
    fetchVendors();
  }, [filters]);

  async function fetchVendors() {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const jwt = session.session?.access_token;
      
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.region) params.append("region", filters.region);
      if (filters.city) params.append("city", filters.city);
      if (filters.minRating > 0) params.append("minRating", filters.minRating.toString());
      if (filters.verified) params.append("verified", "true");
      if (filters.source) params.append("source", filters.source);

      const res = await fetch(`/api/vendors?${params.toString()}`, { headers });
      const data = await res.json();
      
      // L'API ritorna { success, data: [...], pagination }
      setVendors(data.data || []);
    } catch (error) {
      console.error("Errore nel caricamento fornitori:", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  const getSourceBadge = (source: string) => {
    const badges = {
      google: { color: "bg-blue-100 text-blue-800", label: "Google Places" },
      osm: { color: "bg-green-100 text-green-800", label: "OpenStreetMap" },
      manual: { color: "bg-gray-100 text-gray-800", label: "Database interno" },
    };
    const badge = badges[source as keyof typeof badges] || badges.manual;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const renderStars = (rating: number | null, ratingCount: number = 0) => {
    if (!rating) return <span className="text-gray-400 text-sm">Nessuna valutazione</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({ratingCount || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Esplora Fornitori
          </h1>
          <p className="text-gray-600">
            Trova i migliori professionisti per il tuo matrimonio. Database con {vendors.length} fornitori verificati.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B59D]"
              >
                <option value="">Tutti</option>
                {VENDOR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Regione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regione
              </label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B59D]"
              >
                <option value="">Tutte</option>
                {ITALIAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating minimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating minimo
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B59D]"
              >
                <option value="0">Qualsiasi</option>
                <option value="3">3+ ⭐</option>
                <option value="4">4+ ⭐⭐</option>
                <option value="4.5">4.5+ ⭐⭐⭐</option>
              </select>
            </div>

            {/* Fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonte
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B59D]"
              >
                <option value="">Tutte</option>
                <option value="google">Google Places</option>
                <option value="osm">OpenStreetMap</option>
                <option value="manual">Database interno</option>
              </select>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => setFilters({ type: "", region: "", city: "", minRating: 0, verified: false, source: "" })}
            className="mt-4 text-sm text-[#A3B59D] hover:underline"
          >
            Resetta filtri
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B59D]"></div>
            <p className="mt-4 text-gray-600">Caricamento fornitori...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Nessun fornitore trovato con questi filtri.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {vendors.length} {vendors.length === 1 ? "risultato" : "risultati"}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {vendor.name}
                    </h3>
                    {vendor.verified && (
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Location */}
                  <p className="text-sm text-gray-600 mb-3">
                    📍 {vendor.location?.city}, {vendor.location?.province} ({vendor.location?.region})
                  </p>

                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(vendor.rating, vendor.ratingCount)}
                  </div>

                  {/* Price Range */}
                  {vendor.priceRange && (
                    <p className="text-sm text-gray-600 mb-3">
                      💰 {vendor.priceRange}
                    </p>
                  )}

                  {/* Description */}
                  {vendor.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {vendor.description}
                    </p>
                  )}

                  {/* Source Badge */}
                  <div className="mb-4">
                    {getSourceBadge(vendor.source.type)}
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-2">
                    {vendor.contact.phone && (
                      <a
                        href={`tel:${vendor.contact.phone}`}
                        className="flex-1 px-3 py-2 bg-[#A3B59D] text-white rounded-md hover:bg-[#8FA187] transition-colors text-center text-sm"
                      >
                        📞 Chiama
                      </a>
                    )}
                    {vendor.contact.website && (
                      <a
                        href={vendor.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 border border-[#A3B59D] text-[#A3B59D] rounded-md hover:bg-[#A3B59D] hover:text-white transition-colors text-center text-sm"
                      >
                        🌐 Sito
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
