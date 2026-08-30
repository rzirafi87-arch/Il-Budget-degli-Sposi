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
import { Church as ChurchIcon, ExternalLink, Heart, MapPin, Phone, Search, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type VerificationStatus = "VERIFIED" | "PROBABLE" | "TO_CHECK";
type Church = {
  id: string;
  name: string;
  place_type: string;
  denomination: string | null;
  religion: string | null;
  subtype: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string;
  province: string;
  region: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  wedding_ceremony_available: boolean | null;
  capacity: number | null;
  accessibility: string | null;
  parking: string | null;
  verification_status: VerificationStatus;
  last_verified_at: string | null;
};
type SavedChurch = {
  id: string;
  church_id: string;
  status: string;
  favorite: boolean;
  contacted: boolean;
  selected: boolean;
};
type Pagination = { page: number; limit: number; total: number; totalPages: number };

function placeTypeKey(placeType: string) {
  const keys = new Set(["church", "cathedral", "basilica", "sanctuary", "chapel"]);
  return keys.has(placeType) ? placeType : "placeOfWorship";
}

export default function ChiesePage() {
  const t = useTranslations("suppliersChurches");
  const { showToast } = useToast();
  const country = getUserCountrySafe().toLowerCase();
  const [churches, setChurches] = useState<Church[]>([]);
  const [saved, setSaved] = useState<Record<string, SavedChurch>>({});
  const [token, setToken] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const loadSaved = useCallback(async (accessToken: string) => {
    const response = await fetch("/api/my/churches", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { savedChurches?: SavedChurch[] };
    const map: Record<string, SavedChurch> = {};
    payload.savedChurches?.forEach((item) => { map[item.church_id] = item; });
    setSaved(map);
  }, []);

  useEffect(() => {
    getOnboardingStatus().then((status) => {
      if (status.kind === "complete") {
        setToken(status.accessToken);
        void loadSaved(status.accessToken);
      }
    }).catch(() => undefined);
  }, [loadSaved]);

  const loadChurches = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ country, page: String(pagination.page), limit: String(pagination.limit) });
    if (submittedQuery) params.set("q", submittedQuery);
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    try {
      const response = await fetch(`/api/churches?${params}`, { cache: "no-store" });
      const payload = (await response.json()) as { churches?: Church[]; pagination?: Pagination; error?: string };
      if (!response.ok) throw new Error(payload.error || t("catalog.loadError"));
      setChurches(payload.churches || []);
      if (payload.pagination) setPagination(payload.pagination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("catalog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [city, country, pagination.limit, pagination.page, region, submittedQuery, t, type]);

  useEffect(() => { void loadChurches(); }, [loadChurches]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setSubmittedQuery(query.trim());
  }

  async function saveChurch(church: Church) {
    if (!token) { showToast(t("messages.authRequired"), "info"); return; }
    setPending((current) => ({ ...current, [church.id]: true }));
    try {
      const response = await fetch("/api/my/churches", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ church_id: church.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("catalog.saveError"));
      setSaved((current) => ({ ...current, [church.id]: payload.savedChurch as SavedChurch }));
      showToast(t("catalog.saved"), "success");
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : t("catalog.saveError"), "error");
    } finally {
      setPending((current) => ({ ...current, [church.id]: false }));
    }
  }

  async function updateSaved(church: Church, updates: Partial<SavedChurch>) {
    const item = saved[church.id];
    if (!item || !token) return;
    setPending((current) => ({ ...current, [church.id]: true }));
    try {
      const response = await fetch("/api/my/churches", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...updates }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("catalog.saveError"));
      setSaved((current) => ({ ...current, [church.id]: payload.savedChurch as SavedChurch }));
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : t("catalog.saveError"), "error");
    } finally {
      setPending((current) => ({ ...current, [church.id]: false }));
    }
  }

  async function removeSaved(church: Church) {
    const item = saved[church.id];
    if (!item || !token) return;
    setPending((current) => ({ ...current, [church.id]: true }));
    try {
      const response = await fetch(`/api/my/churches?id=${encodeURIComponent(item.id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(t("catalog.removeError"));
      setSaved((current) => { const next = { ...current }; delete next[church.id]; return next; });
      showToast(t("catalog.removed"), "info");
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : t("catalog.removeError"), "error");
    } finally {
      setPending((current) => ({ ...current, [church.id]: false }));
    }
  }

  const locationOptions = useMemo(() => Array.from(new Set(churches.map((church) => church.region).filter(Boolean))).sort(), [churches]);

  return (
    <section className="space-y-6">
      <PageHeader eyebrow={t("catalog.eyebrow")} title={t("title")} description={t("description")} icon={<ChurchIcon size={24} aria-hidden />} />
      <ImageCarousel images={getPageImages("chiese", country)} height="280px" />

      <AppCard padding="md">
        <form onSubmit={submitSearch} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <label className="space-y-1 text-sm font-semibold">
            <span>{t("catalog.searchLabel")}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("catalog.searchPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>{t("catalog.region")}</span>
            <input list="church-regions" value={region} onChange={(event) => { setRegion(event.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <datalist id="church-regions">{locationOptions.map((option) => <option key={option} value={option} />)}</datalist>
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>{t("form.city")}</span>
            <input value={city} onChange={(event) => { setCity(event.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>{t("filters.type")}</span>
            <select value={type} onChange={(event) => { setType(event.target.value); setPagination((p) => ({ ...p, page: 1 })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">{t("filters.allTypes")}</option>
              <option value="church">{t("catalog.types.church")}</option>
              <option value="cathedral">{t("catalog.types.cathedral")}</option>
              <option value="basilica">{t("catalog.types.basilica")}</option>
              <option value="sanctuary">{t("catalog.types.sanctuary")}</option>
              <option value="chapel">{t("catalog.types.chapel")}</option>
              <option value="place_of_worship">{t("catalog.types.placeOfWorship")}</option>
            </select>
          </label>
          <AppButton type="submit" className="self-end"><Search size={17} aria-hidden />{t("catalog.search")}</AppButton>
        </form>
      </AppCard>

      {loading ? <LoadingState label={t("loading")} cards={6} /> : error ? (
        <AppCard><p role="alert" className="text-red-700">{error}</p><AppButton className="mt-4" onClick={() => void loadChurches()}>{t("catalog.retry")}</AppButton></AppCard>
      ) : churches.length === 0 ? <AppCard><p className="text-gray-600">{t("empty")}</p></AppCard> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {churches.map((church) => {
            const savedItem = saved[church.id];
            const badge = church.verification_status === "VERIFIED" ? t("catalog.verification.verified") : church.verification_status === "PROBABLE" ? t("catalog.verification.probable") : t("catalog.verification.toCheck");
            return (
              <AppCard key={church.id} interactive className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-[#66745f]">{t(`catalog.types.${placeTypeKey(church.place_type)}` as "catalog.types.church")}</p><h2 className="text-xl font-bold text-gray-900">{church.name}</h2></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${church.verification_status === "VERIFIED" ? "bg-green-100 text-green-800" : church.verification_status === "PROBABLE" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}>{badge}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex gap-2"><MapPin size={17} className="shrink-0" aria-hidden /><span>{[church.address_line, church.postal_code, church.city, church.province, church.region, church.country_code.toUpperCase()].filter(Boolean).join(", ")}</span></p>
                  {church.denomination ? <p>{t("card.type")} {church.denomination}</p> : null}
                  {church.capacity ? <p>{t("card.capacity")} {church.capacity} {t("card.people")}</p> : null}
                  {church.phone ? <a className="flex items-center gap-2 text-[#586852] hover:underline" href={`tel:${church.phone}`}><Phone size={16} aria-hidden />{church.phone}</a> : null}
                  {church.website ? <a className="inline-flex items-center gap-2 text-[#586852] hover:underline" href={church.website} target="_blank" rel="noreferrer">{t("card.website")}<ExternalLink size={15} aria-hidden /></a> : null}
                </div>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {!savedItem ? <AppButton onClick={() => void saveChurch(church)} loading={pending[church.id]}>{t("catalog.save")}</AppButton> : <>
                    <AppButton variant="outline" onClick={() => void updateSaved(church, { favorite: !savedItem.favorite })} loading={pending[church.id]}><Heart size={16} fill={savedItem.favorite ? "currentColor" : "none"} aria-hidden />{savedItem.favorite ? t("catalog.favoriteOn") : t("catalog.favorite")}</AppButton>
                    <AppButton variant={savedItem.selected ? "primary" : "outline"} onClick={() => void updateSaved(church, { selected: !savedItem.selected, status: savedItem.selected ? "considering" : "selected" })} loading={pending[church.id]}><Star size={16} fill={savedItem.selected ? "currentColor" : "none"} aria-hidden />{savedItem.selected ? t("catalog.selected") : t("catalog.select")}</AppButton>
                    <AppButton variant="ghost" onClick={() => void removeSaved(church)} loading={pending[church.id]}>{t("catalog.remove")}</AppButton>
                  </>}
                </div>
              </AppCard>
            );
          })}
        </div>
      )}

      {!loading && !error && pagination.total > 0 ? <nav className="flex items-center justify-between" aria-label={t("catalog.pagination")}>
        <AppButton variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>{t("catalog.previous")}</AppButton>
        <p className="text-sm text-gray-600">{t("catalog.page", { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total })}</p>
        <AppButton variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>{t("catalog.next")}</AppButton>
      </nav> : null}
    </section>
  );
}
