"use client";

import { AppButton } from "@/components/ui/AppButton";
import {
  CEREMONY_TYPES,
  ceremonyPlaceForDisplay,
  getCeremonyPlaceOptions,
  type CeremonyType,
} from "@/lib/ceremonyHierarchy";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Ceremony = { ceremony_type: CeremonyType; religion: string; denomination: string; ceremony_place_kind: string; ceremony_place_name: string; ceremony_place_address: string; ceremony_officiant: string };
const empty: Ceremony = { ceremony_type: "undecided", religion: "unspecified", denomination: "", ceremony_place_kind: "", ceremony_place_name: "", ceremony_place_address: "", ceremony_officiant: "" };
const religions = ["unspecified", "catholic", "christian_non_catholic", "islamic", "jewish", "hindu", "buddhist", "other"] as const;

export default function CeremonyPage() {
  const { locale = "it" } = useParams<{ locale: string }>();
  const t = useTranslations("ceremonyPage");
  const [form, setForm] = useState<Ceremony>(empty);
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(false), [loadAttempt, setLoadAttempt] = useState(0), [saving, setSaving] = useState(false), [message, setMessage] = useState("");
  const update = (key: keyof Ceremony, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoadError(false);
        const { data } = await getBrowserClient().auth.getSession();
        const token = data.session?.access_token;
        const response = await fetch("/api/ceremony", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!response.ok) throw new Error("CEREMONY_READ_FAILED");
        const json = await response.json();
        if (active && json.ceremony) {
          const ceremony = json.ceremony;
          const ceremonyType = (ceremony.ceremony_type || (ceremony.church_id ? "religious" : "undecided")) as CeremonyType;
          setForm({ ...empty, ...ceremony, ceremony_type: ceremonyType, ceremony_place_kind: ceremonyPlaceForDisplay(ceremonyType, ceremony.ceremony_place_kind || (ceremony.church_id ? "church" : "")), ceremony_place_name: ceremony.ceremony_place_name || ceremony.church_name || ceremony.location_name || "", ceremony_place_address: ceremony.ceremony_place_address || ceremony.church_address || ceremony.location_address || "" });
        }
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [loadAttempt]);

  function selectCeremonyType(ceremonyType: CeremonyType) {
    setForm((current) => ({
      ...current,
      ceremony_type: ceremonyType,
      ceremony_place_kind: ceremonyPlaceForDisplay(ceremonyType, current.ceremony_place_kind),
    }));
  }

  async function save() {
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const response = await fetch("/api/ceremony", { method: "PUT", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify(form) });
      setMessage(response.ok ? t("messages.saved") : t("messages.saveError"));
    } catch {
      setMessage(t("messages.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-600" role="status" aria-live="polite">{t("loading")}</p>;
  if (loadError) return <main className="mx-auto max-w-4xl px-3 py-5 sm:p-6"><div className="app-card app-card--md space-y-4" role="alert"><p className="text-red-700 dark:text-red-300">{t("messages.loadError")}</p><AppButton type="button" onClick={() => { setLoading(true); setLoadAttempt((value) => value + 1); }}><RefreshCw size={17} aria-hidden />{t("retry")}</AppButton></div></main>;
  const placeOptions = getCeremonyPlaceOptions(form.ceremony_type);
  return <main className="mx-auto max-w-4xl space-y-6 px-3 py-5 sm:p-6">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-rose-700">{t("eyebrow")}</p><h1 className="font-serif text-3xl font-bold">{t("title")}</h1><p className="mt-2 text-gray-600">{t("description")}</p></header>
    <section className="space-y-3" aria-labelledby="ceremony-type-title"><h2 id="ceremony-type-title" className="text-xl font-bold text-fg">{t("typeAriaLabel")}</h2><div className="grid gap-3 sm:grid-cols-2">{CEREMONY_TYPES.map((value) => <button key={value} type="button" aria-pressed={form.ceremony_type === value} onClick={() => selectCeremonyType(value)} className={`min-h-14 rounded-xl border px-4 text-left font-semibold ${form.ceremony_type === value ? "border-primary bg-primary/10 text-fg" : "border-border bg-bg text-fg"}`}>{t(`types.${value}`)}</button>)}</div></section>
    {form.ceremony_type === "religious" && <section className="app-card app-card--md"><label className="block font-semibold text-fg">{t("religion.label")}<select value={form.religion} onChange={(e) => update("religion", e.target.value)} className="app-select mt-2">{religions.map((value) => <option key={value} value={value}>{t(`religions.${value}`)}</option>)}</select></label><label className="mt-4 block font-semibold text-fg">{t("religion.denomination")}<input value={form.denomination} onChange={(e) => update("denomination", e.target.value)} className="app-input mt-2" /></label></section>}
    {form.ceremony_type !== "undecided" && <section className="app-card app-card--md space-y-4"><h2 className="text-xl font-bold text-fg">{t("place.title")}</h2><p className="text-sm text-muted-fg">{t(`place.hints.${form.ceremony_type}`)}</p><label className="block font-semibold text-fg">{t("place.kind")}<select value={form.ceremony_place_kind} onChange={(e) => update("ceremony_place_kind", e.target.value)} className="app-select mt-2"><option value="">{t("types.undecided")}</option>{placeOptions.map((value) => <option key={value} value={value}>{t(`places.${value}`)}</option>)}</select></label><label className="block font-semibold text-fg">{t("place.name")}<input value={form.ceremony_place_name} onChange={(e) => update("ceremony_place_name", e.target.value)} placeholder={t("place.namePlaceholder")} className="app-input mt-2" /></label><label className="block font-semibold text-fg">{t("place.address")}<input value={form.ceremony_place_address} onChange={(e) => update("ceremony_place_address", e.target.value)} className="app-input mt-2" /></label><p className="text-sm text-muted-fg">{t("place.privateNote")}</p><div className="flex flex-wrap gap-3">{form.ceremony_type === "religious" ? <Link href={`/${locale}/chiese`} className="app-button app-button--outline app-button--md">{t("place.searchWorship")}</Link> : null}<Link href={`/${locale}/location`} className="app-button app-button--outline app-button--md">{t("place.searchVenues")}</Link></div></section>}
    <label className="app-card app-card--md block font-semibold text-fg">{t("officiant")}<input value={form.ceremony_officiant} onChange={(e) => update("ceremony_officiant", e.target.value)} className="app-input mt-2" /></label>
    <div className="sticky bottom-[calc(var(--safe-bottom)+0.75rem)] flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg/95 p-3 shadow"><span role="status" aria-live="polite" className="text-sm">{message}</span><AppButton type="button" onClick={() => void save()} disabled={saving} loading={saving}>{saving ? t("saving") : t("save")}</AppButton></div>
  </main>;
}
