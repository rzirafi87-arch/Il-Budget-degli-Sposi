"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { GEO, getUserCountrySafe } from "@/constants/geo";
import { getGeographyLevels } from "@/lib/geographyFilters";
import { getPageImages } from "@/lib/pageImages";
import clsx from "clsx";
import { useTranslations } from "next-intl";
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

function useGeographyOptions() {
  const country = getUserCountrySafe();
  const levels = getGeographyLevels(country);
  return { country, levels };
}

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

export default function ChiesePage() {
  const t = useTranslations("suppliersChurches");
  const { country, levels } = useGeographyOptions();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});
  const [selectedType, setSelectedType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    church_type: string;
    capacity: string;
    requires_baptism: boolean;
    requires_marriage_course: boolean;
    [key: string]: string | boolean;
  }>({
    name: "",
    ...Object.fromEntries(levels.map(l => [l.key, ""])),
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
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      if (selectedType) params.append("type", selectedType);
      try { if (country) params.append("country", country); } catch {}

      const res = await fetch(`/api/churches?${params.toString()}`);
      const data = await res.json();
      setChurches(data.churches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedFilters, selectedType, country]);

  useEffect(() => {
    loadChurches();
  }, [loadChurches]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const jwt = localStorage.getItem("sb_jwt");
    if (!jwt) {
      alert(t("messages.authRequired"));
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
          country,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      if (!res.ok) {
        throw new Error(t("messages.submitError"));
      }

      alert(t("messages.submitSuccess"));
      setShowAddForm(false);
      setFormData({
        name: "",
        ...Object.fromEntries(levels.map(l => [l.key, ""])),
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
      alert((e as Error).message || t("messages.submitError"));
    }
  }

  const filteredChurches = churches;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A3B59D] via-white to-[#A3B59D] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Carosello immagini */}
        <ImageCarousel images={getPageImages("chiese", country)} height="280px" />
        
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t("title")}</h1>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-3xl">
            {t("description")}
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div></div>
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
                <label className="block text-sm font-semibold mb-1">{t("form.name")}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.type")}</label>
                <select
                  required
                  value={formData.church_type}
                  onChange={(e) => setFormData({ ...formData, church_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">{t("form.select")}</option>
                  {CHURCH_TYPES.map(ct => (
                    <option key={ct} value={ct.toLowerCase()}>{t(`types.${ct.toLowerCase()}`)}</option>
                  ))}
                </select>
              </div>

              {/* Geography levels dynamic fields */}
              {levels.map((level, idx) => {
                // Opzioni dinamiche per ogni livello
                const cc = country.toLowerCase();
                let options: string[] = [];
                if (level.key === "region" || level.key === "state") {
                  options = (GEO[cc]?.regions ?? []).map((r: { name: string; provinces?: string[] }) => r.name);
                }
                if (level.key === "province" && formData.region) {
                  const regionObj = (GEO[cc]?.regions ?? []).find((r: { name: string; provinces?: string[] }) => r.name === formData.region);
                  options = regionObj?.provinces ?? [];
                }
                const isDisabled = idx > 0 && !formData[levels[idx - 1].key];
                return (
                  <div key={level.key}>
                    <label className="block text-sm font-semibold mb-1">{level.label} *</label>
                    <select
                      required
                      value={(formData[level.key] as string) || ""}
                      onChange={e => setFormData({ ...formData, [level.key]: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      disabled={isDisabled}
                    >
                      <option value="">{t("filters.all")}</option>
                      {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.city")}</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.address")}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.phone")}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.email")}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.website")}</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{t("form.capacity")}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">{t("form.description")}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder={t("form.descriptionPlaceholder")}
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
                  <span className="text-sm font-semibold">{t("form.requiresBaptism")}</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_marriage_course}
                    onChange={(e) => setFormData({ ...formData, requires_marriage_course: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">{t("form.requiresMarriageCourse")}</span>
                </label>
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#A3B59D] text-white py-3 rounded-lg hover:bg-[#8fa085] font-semibold"
                >
                  {t("buttons.submit")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtri dinamici */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t("filters.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {levels.map((level, idx) => {
              const cc = country.toLowerCase();
              let options: string[] = [];
              if (level.key === "region" || level.key === "state") {
                options = (GEO[cc]?.regions ?? []).map((r: { name: string; provinces?: string[] }) => r.name);
              }
              if (level.key === "province" && selectedFilters.region) {
                const regionObj = (GEO[cc]?.regions ?? []).find((r: { name: string; provinces?: string[] }) => r.name === selectedFilters.region);
                options = regionObj?.provinces ?? [];
              }
              const isDisabled = idx > 0 && !selectedFilters[levels[idx - 1].key];
              return (
                <div key={level.key}>
                  <label className="block text-sm font-semibold mb-2">{level.label}</label>
                  <select
                    value={selectedFilters[level.key] || ""}
                    onChange={e => setSelectedFilters({ ...selectedFilters, [level.key]: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    disabled={isDisabled}
                  >
                    <option value="">{t("filters.all")}</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}
            <div>
              <label className="block text-sm font-semibold mb-2">{t("filters.type")}</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t("filters.allTypes")}</option>
                {CHURCH_TYPES.map(ct => (
                  <option key={ct} value={ct.toLowerCase()}>{t(`types.${ct.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista Chiese */}
        {loading ? (
          <div className="text-center py-12">{t("loading")}</div>
        ) : filteredChurches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t("empty")}
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
                      {t("card.verified")}
                    </span>
                  )}
                </div>

                {church.church_type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">{t("card.type")}</span> {t(`types.${church.church_type}`)}
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
                    <span className="font-semibold">{t("card.capacity")}</span> {church.capacity} {t("card.people")}
                  </p>
                )}

                {(church.requires_baptism || church.requires_marriage_course) && (
                  <div className="mb-3 space-y-1">
                    {church.requires_baptism && (
                      <p className="text-xs text-orange-600">{t("card.requiresBaptism")}</p>
                    )}
                    {church.requires_marriage_course && (
                      <p className="text-xs text-orange-600">{t("card.requiresMarriageCourse")}</p>
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
                        {t("card.website")}
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

