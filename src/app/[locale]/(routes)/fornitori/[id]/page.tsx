"use client";

import { AppButton } from "@/components/ui/AppButton";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import type { SupplierDetail } from "@/lib/supplierContracts";
import { ArrowLeft, CheckCircle2, ExternalLink, Heart, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type SavedSupplier = {
  id: string;
  supplier_id: string;
  status: string;
  favorite: boolean;
  personal_notes: string | null;
  contact_notes: string | null;
  planning_state?: string;
};

type ViewState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "ready"; supplier: SupplierDetail; saved: SavedSupplier | null; authenticated: boolean };

export default function SupplierDetailPage() {
  const t = useTranslations("milestone8.supplierProfile");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const supplierId = useMemo(() => Array.isArray(params.id) ? params.id[0] : params.id, [params.id]);
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [mutationPending, setMutationPending] = useState(false);
  const [mutationError, setMutationError] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    setMutationError(false);
    try {
      const publicResponse = await fetch(`/api/suppliers/${supplierId}`, { cache: "no-store" });
      if (publicResponse.status === 404) {
        setState({ kind: "not-found" });
        return;
      }
      if (!publicResponse.ok) throw new Error("SUPPLIER_DETAIL_READ_FAILED");
      const publicBody = await publicResponse.json() as { supplier: SupplierDetail };

      const { data: sessionData } = await getBrowserClient().auth.getSession();
      const token = sessionData.session?.access_token;
      let saved: SavedSupplier | null = null;
      if (token) {
        const privateResponse = await fetch("/api/my/suppliers", {
          cache: "no-store",
          headers: { authorization: `Bearer ${token}` },
        });
        if (privateResponse.ok) {
          const privateBody = await privateResponse.json() as { savedSuppliers?: SavedSupplier[] };
          saved = privateBody.savedSuppliers?.find((item) => item.supplier_id === supplierId) ?? null;
        }
      }

      setNotes(saved?.personal_notes ?? "");
      setState({ kind: "ready", supplier: publicBody.supplier, saved, authenticated: Boolean(token) });
    } catch {
      setState({ kind: "error" });
    }
  }, [supplierId]);

  useEffect(() => { void load(); }, [load]);

  async function mutateSavedSupplier(action: "save" | "remove" | "select" | "notes") {
    if (state.kind !== "ready") return;
    setMutationPending(true);
    setMutationError(false);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");

      const saved = state.saved;
      const method = action === "save" ? "POST" : action === "remove" ? "DELETE" : "PATCH";
      const url = action === "remove" && saved
        ? `/api/my/suppliers?resource_id=${saved.id}`
        : "/api/my/suppliers";
      const body = action === "save"
        ? { supplier_id: supplierId }
        : action === "select" && saved
          ? { resource_id: saved.id, status: saved.status === "SELECTED" ? "SAVED" : "SELECTED" }
          : action === "notes" && saved
            ? { resource_id: saved.id, personal_notes: notes }
            : undefined;
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) throw new Error("SAVED_SUPPLIER_MUTATION_FAILED");

      if (action === "remove") {
        setNotes("");
        setState({ ...state, saved: null });
      } else {
        const result = await response.json() as { savedSupplier: SavedSupplier };
        setNotes(result.savedSupplier.personal_notes ?? "");
        setState({ ...state, saved: result.savedSupplier });
      }
    } catch {
      setMutationError(true);
    } finally {
      setMutationPending(false);
    }
  }

  if (state.kind === "loading") return <p className="py-10 text-gray-600" aria-live="polite">{t("loading")}</p>;
  if (state.kind === "not-found") return (
    <section className="app-card app-card--md space-y-4">
      <h1 className="font-serif text-2xl">{t("notFound")}</h1>
      <Link href={`/${locale}/fornitori`} className="inline-flex items-center gap-2 underline"><ArrowLeft size={16}/>{t("back")}</Link>
    </section>
  );
  if (state.kind === "error") return (
    <section className="app-card app-card--md space-y-4" role="alert">
      <h1 className="font-serif text-2xl">{t("loadError")}</h1>
      <AppButton onClick={() => void load()}><RefreshCw size={16}/>{t("retry")}</AppButton>
    </section>
  );

  const { supplier, saved, authenticated } = state;
  const address = supplier.address_line ?? supplier.address;
  const location = [supplier.city, supplier.province, supplier.region, supplier.country].filter(Boolean).join(", ");
  const socialLinks = [
    ["Instagram", supplier.instagram_url],
    ["Facebook", supplier.facebook_url],
    ["TikTok", supplier.tiktok_url],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <section className="space-y-6">
      <Link href={`/${locale}/fornitori`} className="inline-flex items-center gap-2 text-sm underline"><ArrowLeft size={16}/>{t("back")}</Link>
      <header className="app-card app-card--md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8d3f63]">{supplier.category ?? t("supplier")}</p>
            <h1 className="mt-1 font-serif text-3xl">{supplier.name}</h1>
            {supplier.subcategory ? <p className="mt-1 text-gray-600">{supplier.subcategory}</p> : null}
          </div>
          {supplier.verified ? <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm text-green-800"><CheckCircle2 size={16}/>{t("verified")}</span> : null}
        </div>
        {location ? <p className="mt-4 flex items-center gap-2 text-gray-700"><MapPin size={17}/>{location}</p> : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <article className="app-card app-card--md">
            <h2 className="font-semibold text-lg">{t("description")}</h2>
            <p className="mt-3 whitespace-pre-wrap text-gray-700">{supplier.description || t("noDescription")}</p>
          </article>
          <article className="app-card app-card--md">
            <h2 className="font-semibold text-lg">{t("services")}</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {supplier.service_area ? <div><dt className="text-sm text-gray-500">{t("serviceArea")}</dt><dd>{supplier.service_area}</dd></div> : null}
              {supplier.regions_served?.length ? <div><dt className="text-sm text-gray-500">{t("regionsServed")}</dt><dd>{supplier.regions_served.join(", ")}</dd></div> : null}
              {supplier.travel_available !== null ? <div><dt className="text-sm text-gray-500">{t("travel")}</dt><dd>{supplier.travel_available ? t("yes") : t("no")}</dd></div> : null}
              {supplier.google_rating !== null ? <div><dt className="text-sm text-gray-500">{t("rating")}</dt><dd>{supplier.google_rating} ({supplier.google_rating_count ?? 0})</dd></div> : null}
            </dl>
            {!supplier.service_area && !supplier.regions_served?.length && supplier.travel_available === null && supplier.google_rating === null
              ? <p className="mt-3 text-gray-600">{t("detailsEmpty")}</p> : null}
          </article>
        </div>

        <aside className="space-y-6">
          <section className="app-card app-card--md">
            <h2 className="font-semibold text-lg">{t("contacts")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {address ? <li>{address}</li> : null}
              {supplier.phone ? <li><a className="underline" href={`tel:${supplier.phone}`}>{supplier.phone}</a></li> : null}
              {supplier.email ? <li><a className="underline" href={`mailto:${supplier.email}`}>{supplier.email}</a></li> : null}
              {supplier.website ? <li><a className="inline-flex items-center gap-1 underline" href={supplier.website} target="_blank" rel="noreferrer">{t("website")}<ExternalLink size={14}/></a></li> : null}
              {socialLinks.map(([label, url]) => <li key={label}><a className="underline" href={url} target="_blank" rel="noreferrer">{label}</a></li>)}
            </ul>
            {!address && !supplier.phone && !supplier.email && !supplier.website && socialLinks.length === 0
              ? <p className="mt-3 text-gray-600">{t("contactsEmpty")}</p> : null}
          </section>

          <section className="app-card app-card--md">
            <h2 className="font-semibold text-lg">{t("eventSection")}</h2>
            {!authenticated ? <p className="mt-3 text-sm text-gray-600">{t("signInToSave")}</p> : saved ? (
              <div className="mt-3 space-y-4">
                <p className="text-sm">{t("savedStatus", { status: saved.status })}</p>
                <div className="flex flex-wrap gap-2">
                  <AppButton disabled={mutationPending} onClick={() => void mutateSavedSupplier("select")}>
                    <CheckCircle2 size={16}/>{saved.status === "SELECTED" ? t("unselect") : t("select")}
                  </AppButton>
                  <AppButton variant="outline" disabled={mutationPending} onClick={() => void mutateSavedSupplier("remove")}>{t("removeSaved")}</AppButton>
                </div>
                <label className="block text-sm font-semibold" htmlFor="supplier-notes">{t("privateNotes")}</label>
                <textarea id="supplier-notes" className="app-input min-h-28 w-full" maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)}/>
                <AppButton variant="outline" disabled={mutationPending || notes === (saved.personal_notes ?? "")} onClick={() => void mutateSavedSupplier("notes")}>{t("saveNotes")}</AppButton>
              </div>
            ) : (
              <AppButton className="mt-3" disabled={mutationPending} onClick={() => void mutateSavedSupplier("save")}><Heart size={16}/>{t("saveSupplier")}</AppButton>
            )}
            {mutationError ? <p className="mt-3 text-sm text-red-700" role="alert">{t("mutationError")}</p> : null}
          </section>
        </aside>
      </div>
    </section>
  );
}
