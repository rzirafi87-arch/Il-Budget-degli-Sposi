"use client";

import ImageCarousel from "@/components/ImageCarousel";
import { useToast } from "@/components/ToastProvider";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getUserCountrySafe } from "@/constants/geo";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import { getPageImages } from "@/lib/pageImages";
import { Building2, Car, ExternalLink, Heart, Hotel, MapPin, Search, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useState } from "react";

type VerificationStatus = "VERIFIED" | "PROBABLE" | "TO_CHECK";
type Location = {
  id: string; name: string; venue_type: string; subtype: string | null; address_line: string | null;
  postal_code: string | null; city: string; province: string; region: string; country_code: string;
  phone: string | null; email: string | null; website: string | null; capacity_min: number | null;
  capacity_max: number | null; accommodation_available: boolean | null; catering_internal: boolean | null;
  catering_external_allowed: boolean | null; parking: boolean | null; accessibility: boolean | null;
  outdoor_space: boolean | null; indoor_space: boolean | null; verification_status: VerificationStatus;
};
type SavedLocation = { id: string; location_id: string; location_role: string; status: string; favorite: boolean; selected: boolean };
type Pagination = { page: number; limit: number; total: number; totalPages: number };

const VENUE_TYPES = ["villa", "castle", "hotel", "resort", "restaurant", "reception_hall", "agriturismo", "masseria", "baglio", "estate", "beach", "panoramic", "other"];

export default function LocationsPage() {
  const t = useTranslations("locationsCatalog");
  const { showToast } = useToast();
  const country = getUserCountrySafe().toLowerCase();
  const [locations, setLocations] = useState<Location[]>([]);
  const [saved, setSaved] = useState<Record<string, SavedLocation>>({});
  const [token, setToken] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [verification, setVerification] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const loadSaved = useCallback(async (accessToken: string) => {
    const response = await fetch("/api/my/locations", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { savedLocations?: SavedLocation[] };
    const map: Record<string, SavedLocation> = {};
    payload.savedLocations?.filter((item) => item.location_role === "reception").forEach((item) => { map[item.location_id] = item; });
    setSaved(map);
  }, []);

  useEffect(() => {
    getOnboardingStatus().then((status) => {
      if (status.kind === "complete") { setToken(status.accessToken); void loadSaved(status.accessToken); }
    }).catch(() => undefined);
  }, [loadSaved]);

  const loadLocations = useCallback(async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ country, page: String(pagination.page), limit: String(pagination.limit) });
    if (submittedQuery) params.set("q", submittedQuery);
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (verification) params.set("verification", verification);
    try {
      const response = await fetch(`/api/locations?${params}`, { cache: "no-store" });
      const payload = (await response.json()) as { locations?: Location[]; pagination?: Pagination; error?: string };
      if (!response.ok) throw new Error(payload.error || t("loadError"));
      setLocations(payload.locations || []);
      if (payload.pagination) setPagination(payload.pagination);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("loadError")); }
    finally { setLoading(false); }
  }, [city, country, pagination.limit, pagination.page, submittedQuery, t, type, verification]);

  useEffect(() => { void loadLocations(); }, [loadLocations]);

  async function saveLocation(location: Location) {
    if (!token) { showToast(t("authRequired"), "info"); return; }
    setPending((p) => ({ ...p, [location.id]: true }));
    try {
      const response = await fetch("/api/my/locations", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ location_id: location.id, location_role: "reception" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("saveError"));
      setSaved((current) => ({ ...current, [location.id]: payload.savedLocation as SavedLocation }));
      showToast(t("saved"), "success");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : t("saveError"), "error"); }
    finally { setPending((p) => ({ ...p, [location.id]: false })); }
  }

  async function updateSaved(location: Location, updates: Partial<SavedLocation>) {
    const item = saved[location.id]; if (!item || !token) return;
    setPending((p) => ({ ...p, [location.id]: true }));
    try {
      const response = await fetch("/api/my/locations", { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, ...updates }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("saveError"));
      setSaved((current) => ({ ...current, [location.id]: payload.savedLocation as SavedLocation }));
    } catch (cause) { showToast(cause instanceof Error ? cause.message : t("saveError"), "error"); }
    finally { setPending((p) => ({ ...p, [location.id]: false })); }
  }

  async function removeSaved(location: Location) {
    const item = saved[location.id]; if (!item || !token) return;
    setPending((p) => ({ ...p, [location.id]: true }));
    try {
      const response = await fetch(`/api/my/locations?id=${item.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(t("removeError"));
      setSaved((current) => { const next = { ...current }; delete next[location.id]; return next; });
      showToast(t("removed"), "info");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : t("removeError"), "error"); }
    finally { setPending((p) => ({ ...p, [location.id]: false })); }
  }

  function submitSearch(event: FormEvent) { event.preventDefault(); setPagination((p) => ({ ...p, page: 1 })); setSubmittedQuery(query.trim()); }

  return <section className="space-y-6">
    <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} icon={<Building2 size={24} aria-hidden />} />
    <ImageCarousel images={getPageImages("location", country)} height="280px" />
    <AppCard padding="md"><form onSubmit={submitSearch} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <label className="space-y-1 text-sm font-semibold"><span>{t("search")}</span><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
      <label className="space-y-1 text-sm font-semibold"><span>{t("city")}</span><input value={city} onChange={(e) => { setCity(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
      <label className="space-y-1 text-sm font-semibold"><span>{t("type")}</span><select value={type} onChange={(e) => { setType(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">{t("all")}</option>{VENUE_TYPES.map((value) => <option key={value} value={value}>{t(`types.${value}`)}</option>)}</select></label>
      <label className="space-y-1 text-sm font-semibold"><span>{t("verification")}</span><select value={verification} onChange={(e) => { setVerification(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">{t("all")}</option><option value="VERIFIED">{t("verified")}</option><option value="PROBABLE">{t("probable")}</option><option value="TO_CHECK">{t("toCheck")}</option></select></label>
      <AppButton type="submit" className="self-end"><Search size={17} aria-hidden />{t("searchButton")}</AppButton>
    </form></AppCard>
    {loading ? <LoadingState label={t("loading")} cards={6} /> : error ? <AppCard><p role="alert" className="text-red-700">{error}</p></AppCard> : locations.length === 0 ? <AppCard><p>{t("empty")}</p></AppCard> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{locations.map((location) => {
      const item = saved[location.id];
      return <AppCard key={location.id} interactive className="flex h-full flex-col gap-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#66745f]">{t(`types.${VENUE_TYPES.includes(location.venue_type) ? location.venue_type : "other"}`)}</p><h2 className="text-xl font-bold">{location.name}</h2></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold">{t(location.verification_status === "VERIFIED" ? "verified" : location.verification_status === "PROBABLE" ? "probable" : "toCheck")}</span></div>
        <div className="space-y-2 text-sm text-gray-700"><p className="flex gap-2"><MapPin size={17} aria-hidden /><span>{[location.address_line, location.postal_code, location.city, location.province, location.region].filter(Boolean).join(", ")}</span></p>{location.capacity_max ? <p className="flex gap-2"><Users size={17} aria-hidden />{t("upTo", { count: location.capacity_max })}</p> : null}{location.accommodation_available ? <p className="flex gap-2"><Hotel size={17} aria-hidden />{t("accommodation")}</p> : null}{location.parking ? <p className="flex gap-2"><Car size={17} aria-hidden />{t("parking")}</p> : null}{location.website ? <a href={location.website} target="_blank" rel="noreferrer" className="inline-flex gap-2 text-[#586852] hover:underline">{t("website")}<ExternalLink size={15} aria-hidden /></a> : null}</div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-4">{!item ? <AppButton onClick={() => void saveLocation(location)} loading={pending[location.id]}>{t("save")}</AppButton> : <><AppButton variant="outline" onClick={() => void updateSaved(location, { favorite: !item.favorite })} loading={pending[location.id]}><Heart size={16} fill={item.favorite ? "currentColor" : "none"} aria-hidden />{t("favorite")}</AppButton><AppButton variant={item.selected ? "primary" : "outline"} onClick={() => void updateSaved(location, { selected: !item.selected, status: item.selected ? "considering" : "selected" })} loading={pending[location.id]}><Star size={16} fill={item.selected ? "currentColor" : "none"} aria-hidden />{item.selected ? t("selected") : t("select")}</AppButton><AppButton variant="ghost" onClick={() => void removeSaved(location)}>{t("remove")}</AppButton></>}</div>
      </AppCard>;
    })}</div>}
    {!loading && !error && pagination.total > 0 ? <nav className="flex items-center justify-between" aria-label={t("pagination")}><AppButton variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>{t("previous")}</AppButton><p className="text-sm text-gray-600">{t("page", { page: pagination.page, total: pagination.totalPages })}</p><AppButton variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>{t("next")}</AppButton></nav> : null}
  </section>;
}
