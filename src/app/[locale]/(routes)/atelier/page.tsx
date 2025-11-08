"use client";

import Breadcrumb from "@/components/Breadcrumb";
import ImageCarousel from "@/components/ImageCarousel";
import { getUserCountrySafe } from "@/constants/geo";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const supabase = getBrowserClient();

type AtelierItem = {
  id: string;
  name: string;
  category: string;
  region: string;
  province?: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  price_range?: string;
  styles?: string[];
  services?: string[];
  verified: boolean;
};

const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export default function AtelierPage() {
  const t = useTranslations("suppliersAtelier");
  const country = getUserCountrySafe();
  const [activeTab, setActiveTab] = useState<"sposa" | "sposo">("sposa");
  const [atelier, setAtelier] = useState<AtelierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "sposa",
    region: "",
    province: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    price_range: "€€",
    styles: "",
    services: "",
  });

  const loadAtelier = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("category", activeTab);
      if (selectedRegion) params.append("region", selectedRegion);
      try {
        const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
        const lsCountry = localStorage.getItem("country");
        const country = cookieCountry || lsCountry;
        if (country) params.append("country", country);
      } catch {}

      const res = await fetch(`/api/atelier?${params.toString()}`);
      const data = await res.json();
      setAtelier(data.atelier || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedRegion]);

  useEffect(() => {
    loadAtelier();
  }, [loadAtelier]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    
    if (!jwt) {
      alert(t("messages.authRequired"));
      return;
    }

    try {
      const res = await fetch("/api/atelier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ...formData,
          styles: formData.styles ? formData.styles.split(",").map(s => s.trim()) : [],
          services: formData.services ? formData.services.split(",").map(s => s.trim()) : [],
        }),
      });

      if (res.ok) {
        alert(t("messages.addSuccess"));
        setShowAddForm(false);
        setFormData({
          name: "",
          category: "sposa",
          region: "",
          province: "",
          city: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          price_range: "€€",
          styles: "",
          services: "",
        });
        loadAtelier();
      } else {
        const error = await res.json();
        alert(t("messages.addError", { error: error.error || "" }));
      }
    } catch (e) {
      console.error(e);
      alert(t("messages.addError", { error: "" }));
    }
  }

  const currentAteliers = atelier;

  return (
    <section className="pt-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), href: "/" },
          { label: t("breadcrumb.suppliers"), href: "/fornitori" },
          { label: t("breadcrumb.atelier") },
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

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("atelier", country)} height="280px" />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("sposa");
            setSelectedRegion("");
          }}
          className={`px-6 py-3 font-semibold text-base transition-all ${
            activeTab === "sposa"
              ? "border-b-4 border-pink-500 text-pink-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("tabs.bride")}
        </button>
        <button
          onClick={() => {
            setActiveTab("sposo");
            setSelectedRegion("");
          }}
          className={`px-6 py-3 font-semibold text-base transition-all ${
            activeTab === "sposo"
              ? "border-b-4 border-blue-500 text-blue-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("tabs.groom")}
        </button>
      </div>

      {/* Filtri e Pulsante Aggiungi */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("filters.region")}</label>
            <select
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">{t("filters.allRegions")}</option>
              {ITALIAN_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] transition-colors font-semibold whitespace-nowrap"
          >
            {showAddForm ? t("buttons.cancel") : t("buttons.add")}
          </button>
        </div>
      </div>

      {/* Form Aggiunta Atelier */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-2xl font-bold mb-4">{t("form.title")}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.name")} *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.category")} *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="sposa">{t("form.categories.bride")}</option>
                <option value="sposo">{t("form.categories.groom")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.region")} *</label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t("form.select")}</option>
                {ITALIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.province")}</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.city")} *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.address")}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.phone")}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.website")}</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.priceRange")}</label>
              <select
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="€">{t("form.priceRanges.budget")}</option>
                <option value="€€">{t("form.priceRanges.moderate")}</option>
                <option value="€€€">{t("form.priceRanges.high")}</option>
                <option value="€€€€">{t("form.priceRanges.luxury")}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">{t("form.fields.description")}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
                placeholder={t("form.placeholders.description")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.styles")}</label>
              <input
                type="text"
                value={formData.styles}
                onChange={(e) => setFormData({ ...formData, styles: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder={t("form.placeholders.styles")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t("form.fields.services")}</label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder={t("form.placeholders.services")}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#A3B59D] text-white py-3 px-6 rounded-lg hover:bg-[#8fa085] transition-colors font-semibold"
              >
                {t("form.submit")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("loading")}</p>
        </div>
      )}

      {/* Atelier List */}
      {!loading && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {t("results.count", { 
              count: currentAteliers.length,
              region: selectedRegion || ""
            })}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAteliers.map((atelierItem) => (
              <div
                key={atelierItem.id}
                className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-all hover:scale-105 transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{atelierItem.name}</h3>
                    {atelierItem.verified && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {t("labels.verified")}
                      </span>
                    )}
                  </div>
                  <span className="text-2xl">{activeTab === "sposa" ? "👰" : "🤵"}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📍</span>
                    <span>{atelierItem.city}, {atelierItem.region}</span>
                  </div>
                  {atelierItem.address && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">🏠</span>
                      <span className="text-xs">{atelierItem.address}</span>
                    </div>
                  )}
                  {atelierItem.phone && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">📞</span>
                      <a href={`tel:${atelierItem.phone}`} className="text-blue-600 hover:underline">
                        {atelierItem.phone}
                      </a>
                    </div>
                  )}
                  {atelierItem.email && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">✉️</span>
                      <a href={`mailto:${atelierItem.email}`} className="text-blue-600 hover:underline text-xs">
                        {atelierItem.email}
                      </a>
                    </div>
                  )}
                  {atelierItem.website && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">🌐</span>
                      <a
                        href={atelierItem.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {t("labels.visitWebsite")}
                      </a>
                    </div>
                  )}
                </div>

                {atelierItem.description && (
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
                    {atelierItem.description}
                  </p>
                )}

                {atelierItem.price_range && (
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-500">{t("labels.priceRange")}: </span>
                    <span className="text-sm font-bold text-gray-700">{atelierItem.price_range}</span>
                  </div>
                )}

                {atelierItem.styles && atelierItem.styles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {atelierItem.styles.slice(0, 4).map((style, idx) => (
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

                {atelierItem.services && atelierItem.services.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{t("labels.services")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {atelierItem.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && currentAteliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("empty.message", { region: selectedRegion || "" })}
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 p-6 bg-linear-to-br from-pink-50 to-blue-50 rounded-xl border border-gray-200">
        <h4 className="font-bold text-lg mb-2 text-gray-800">{t("tips.title")}</h4>
        <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
          <li>• {t("tips.tip1")}</li>
          <li>• {t("tips.tip2")}</li>
          <li>• {t("tips.tip3")}</li>
          <li>• {t("tips.tip4")}</li>
          <li>• {t("tips.tip5")}</li>
        </ul>
      </div>
    </section>
  );
}
