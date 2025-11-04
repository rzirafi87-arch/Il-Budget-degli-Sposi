"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { GEO, getUserCountrySafe } from "@/constants/geo";
import { useProvinceList } from "@/lib/geoClient";
import { getProvinceLabel, getRegionLabel } from "@/lib/geoLabels";
import { getPageImages } from "@/lib/pageImages";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

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

function useRegionOptions() {
  const [country, setCountry] = useState<string>("it");
  useEffect(() => { 
    // Schedule setState to avoid synchronous setState within effect
    setTimeout(() => setCountry(getUserCountrySafe()), 0); 
  }, []);
  const regions = (GEO[country]?.regions || GEO.it.regions).map(r => r.name);
  return { country, regions };
}

const LOCATION_TYPE_KEYS = [
  "villa",
  "castello",
  "agriturismo",
  "masseria",
  "ristorante",
  "hotel",
  "resort",
  "tenuta",
  "giardino",
  "spiaggia",
  "altro",
] as const;

export default function LocationRicevimentoPage() {
  const t = useTranslations("suppliersLocations");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { country, regions } = useRegionOptions();
  
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

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedType) params.append("type", selectedType);
      try { if (country) params.append("country", country); } catch {}

      const res = await fetch(`/api/locations?${params.toString()}`);
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedProvince, selectedType, country]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const jwt = localStorage.getItem("sb_jwt");
    if (!jwt) {
      alert(t("messages.authRequired"));
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
          country,
          capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : null,
          capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : null,
        }),
      });

      if (!res.ok) {
        throw new Error(t("messages.addError"));
      }

      alert(t("messages.addSuccess"));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message || t("messages.addError"));
    }
  }

  const { provinces } = useProvinceList(country, selectedRegion, () =>
    Array.from(new Set(locations.filter(l => l.region === selectedRegion).map(l => l.province))).sort()
  );

  const filteredLocations = locations;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A3B59D] via-white to-[#A3B59D] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Carosello immagini */}
        <ImageCarousel images={getPageImages("location", country)} height="280px" />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{t("title")}</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] transition-colors font-semibold"
          >
            {showAddForm ? t("buttons.cancel") : t("buttons.add")}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{t("form.title")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-semibold mb-1">{t("form.fields.type")} *</label>
                <select
                  required
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">{t("form.select")}</option>
                  {LOCATION_TYPE_KEYS.map(key => (
                    <option key={key} value={key}>{t(`types.${key}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{getRegionLabel(country)} *</label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">{t("form.select")}</option>
                  {regions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{getProvinceLabel(country)} *</label>
                {provinces.length ? (
                  <select
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">{t("form.select")}</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder={t("form.placeholders.province")}
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                )}
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
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.fields.priceRange")}</label>
                <input
                  type="text"
                  placeholder={t("form.placeholders.priceRange")}
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.fields.capacityMin")}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity_min}
                  onChange={(e) => setFormData({ ...formData, capacity_min: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.fields.capacityMax")}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity_max}
                  onChange={(e) => setFormData({ ...formData, capacity_max: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">{t("form.fields.description")}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder={t("form.placeholders.description")}
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#A3B59D] text-white py-3 rounded-lg hover:bg-[#8fa085] font-semibold"
                >
                  {t("form.submit")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtri */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t("filters.title")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{getRegionLabel(country)}</label>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedProvince("");
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t("filters.allRegion")}</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{getProvinceLabel(country)}</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                disabled={!selectedRegion}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">{t("filters.allProvince")}</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t("filters.typeLabel")}</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t("filters.allTypes")}</option>
                {LOCATION_TYPE_KEYS.map(key => (
                  <option key={key} value={key}>{t(`types.${key}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista Location */}
        {loading ? (
          <div className="text-center py-12">{t("loading")}</div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t("empty")}</div>
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
                      {t("badges.verified")}
                    </span>
                  )}
                </div>

                {location.location_type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">{t("labels.type")}</span> {t(`types.${location.location_type}`)}
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
                    <span className="font-semibold">{t("labels.capacity")}</span>{" "}
                    {location.capacity_min && location.capacity_max
                      ? t("capacity.range", { min: location.capacity_min, max: location.capacity_max })
                      : location.capacity_min
                      ? t("capacity.from", { min: location.capacity_min })
                      : t("capacity.upTo", { max: location.capacity_max })}
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
                        {t("labels.website")}
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
