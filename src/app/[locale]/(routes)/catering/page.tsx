"use client";

import Breadcrumb from "@/components/Breadcrumb";
import ImageCarousel from "@/components/ImageCarousel";
import { getUserCountrySafe } from "@/constants/geo";
import { useFavorites } from "@/hooks/useFavorites";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const supabase = getBrowserClient();

type Supplier = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  region: string;
  province: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  priceRange?: string;
  rating?: number;
};

const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export default function CateringPage() {
  const t = useTranslations("suppliersCatering");
  const country = getUserCountrySafe();
  const { isFavorite, toggleFavorite, pending } = useFavorites("supplier");
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const params = new URLSearchParams();
      params.append("category", "Catering");
      if (region) params.append("region", region);
      if (province) params.append("province", province);
      if (search) params.append("search", search);
      try {
        const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
        const lsCountry = localStorage.getItem("country");
        const country = cookieCountry || lsCountry;
        if (country) params.append("country", country);
      } catch {}

      const r = await fetch(`/api/suppliers?${params.toString()}`, { headers });
      const j = await r.json();
      setItems(j.suppliers || []);
    } catch (e) {
      console.error("Errore caricamento catering:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [region, province, search]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((it) =>
    search ? it.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <section className="pt-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), href: "/" },
          { label: t("breadcrumb.suppliers"), href: "/fornitori" },
          { label: t("breadcrumb.catering") },
        ]}
      />

      {/* Header con bottone Torna a Fornitori */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="font-serif text-3xl mb-2">{t("title")}</h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {t("description")}
          </p>
        </div>
        <Link
          href="/fornitori"
          className="ml-4 px-4 py-2 bg-white border-2 border-[#A3B59D] text-[#A3B59D] rounded-lg hover:bg-[#A3B59D] hover:text-white transition-colors font-semibold text-sm whitespace-nowrap"
        >
          {t("buttons.backToSuppliers")}
        </Link>
      </div>

      <ImageCarousel images={getPageImages("catering", country)} height="280px" />

      {/* Filtri */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <h3 className="font-semibold mb-4">{t("filters.title")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("filters.region")}</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setProvince("");
              }}
            >
              <option value="">{t("filters.allRegions")}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("filters.province")}</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder={t("filters.provincePlaceholder")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("filters.search")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("filters.searchPlaceholder")}
              />
              <button onClick={load} className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]">
                {t("filters.searchButton")}
              </button>
              <button
                onClick={() => { setRegion(""); setProvince(""); setSearch(""); }}
                className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                {t("filters.resetButton")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {t("results.count", { count: filtered.length })}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "grid" ? "bg-[#A3B59D] text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("viewMode.grid")}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "list" ? "bg-[#A3B59D] text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("viewMode.list")}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-400 rounded-2xl border border-gray-200 bg-white/70">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium">{t("empty.title")}</p>
          <p className="text-sm mt-2">{t("empty.description")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{p.name}</h3>
                {p.rating && p.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm"><span className="text-yellow-500">⭐</span><span className="font-bold text-gray-800">{p.rating.toFixed(1)}</span></div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">📍 {p.city}, {p.province} ({p.region})</p>
              {p.priceRange && (
                <div className="mb-3"><span className="inline-block bg-[#A6B5A0] text-white px-3 py-1 rounded-full text-sm font-bold">{p.priceRange}</span></div>
              )}
              {p.description && <p className="text-sm text-gray-700 mb-3 line-clamp-3">{p.description}</p>}
              <div className="flex gap-2 flex-wrap">
                {p.website && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-center bg-white border-2 border-[#A6B5A0] text-[#A6B5A0] px-3 py-1.5 rounded-lg text-sm hover:bg-[#A6B5A0] hover:text-white">{t("actions.website")}</a>
                )}
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="text-center bg-white border-2 border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">{t("actions.call")}</a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="text-center bg-white border-2 border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">{t("actions.email")}</a>
                )}
                <button
                  onClick={() => toggleFavorite(p.id, { name: p.name })}
                  disabled={pending[p.id]}
                  className={`text-center px-3 py-1.5 rounded-lg text-sm text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    isFavorite(p.id)
                      ? "bg-[#2f4231] hover:bg-[#2f4231]/90"
                      : "bg-[#A6B5A0] hover:bg-[#8a9d84]"
                  }`}
                >
                  {isFavorite(p.id) ? t("actions.removeFavorite") : t("actions.addFavorite")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{p.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">{p.city}, {p.province} ({p.region})</div>
                  {p.description && <p className="text-sm text-gray-700 mt-2">{p.description}</p>}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                    {p.phone && <span>📞 {p.phone}</span>}
                    {p.email && <span>✉️ {p.email}</span>}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t("actions.website")}</a>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 min-w-20">
                  {p.priceRange && <div className="text-sm font-medium text-gray-700">{p.priceRange}</div>}
                  {p.rating && p.rating > 0 && <div className="text-xs text-yellow-600">⭐ {p.rating.toFixed(1)}</div>}
                  <button
                    onClick={() => toggleFavorite(p.id, { name: p.name })}
                    disabled={pending[p.id]}
                    className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      isFavorite(p.id)
                        ? "bg-[#2f4231] hover:bg-[#2f4231]/90"
                        : "bg-[#A6B5A0] hover:bg-[#8a9d84]"
                    }`}
                  >
                    {isFavorite(p.id) ? t("actions.remove") : t("actions.add")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
