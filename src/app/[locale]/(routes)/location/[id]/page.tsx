"use client";

import { LocationSupplierAssociations } from "@/components/catalog/LocationSupplierAssociations";
import { AppButton } from "@/components/ui/AppButton";
import type { LocationDetail } from "@/lib/locationContracts";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { ArrowLeft, Building2, CheckCircle2, ExternalLink, Heart, MapPin, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type LocationRole = "reception" | "ceremony" | "accommodation" | "party" | "other";
type SavedLocation = { id: string; location_id: string; location_role: LocationRole; selected: boolean; status: string };
type ViewState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "ready"; location: LocationDetail; savedLocations: SavedLocation[]; authenticated: boolean };

const LOCATION_ROLES: LocationRole[] = ["reception", "ceremony", "accommodation", "party", "other"];

export default function LocationDetailPage() {
  const t = useTranslations("milestone8.locationProfile");
  const planningT = useTranslations("branch49Planning");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const locationId = useMemo(() => Array.isArray(params.id) ? params.id[0] : params.id, [params.id]);
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [role, setRole] = useState<LocationRole>("reception");
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState(false);

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole && LOCATION_ROLES.includes(requestedRole as LocationRole)) setRole(requestedRole as LocationRole);
  }, []);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    setMutationError(false);
    try {
      const publicResponse = await fetch(`/api/locations/${locationId}`, { cache: "no-store" });
      if (publicResponse.status === 404) { setState({ kind: "not-found" }); return; }
      if (!publicResponse.ok) throw new Error("LOCATION_DETAIL_READ_FAILED");
      const publicBody = await publicResponse.json() as { location: LocationDetail };
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      let savedLocations: SavedLocation[] = [];
      if (token) {
        const privateResponse = await fetch("/api/my/locations", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
        if (privateResponse.ok) {
          const privateBody = await privateResponse.json() as { savedLocations?: SavedLocation[] };
          savedLocations = (privateBody.savedLocations ?? []).filter((item) => item.location_id === locationId);
        }
      }
      setState({ kind: "ready", location: publicBody.location, savedLocations, authenticated: Boolean(token) });
    } catch {
      setState({ kind: "error" });
    }
  }, [locationId]);

  useEffect(() => { void load(); }, [load]);

  async function mutateLocation(action: "save" | "remove" | "select") {
    if (state.kind !== "ready") return;
    const saved = state.savedLocations.find((item) => item.location_role === role) ?? null;
    setPending(true);
    setMutationError(false);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch(
        action === "remove" && saved ? `/api/my/locations?id=${saved.id}` : "/api/my/locations",
        {
          method: action === "save" ? "POST" : action === "remove" ? "DELETE" : "PATCH",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: action === "save"
            ? JSON.stringify({ location_id: locationId, location_role: role })
            : action === "select" && saved
              ? JSON.stringify({ id: saved.id, selected: !saved.selected, status: saved.selected ? "considering" : "selected" })
              : undefined,
        },
      );
      if (!response.ok) throw new Error("SAVED_LOCATION_MUTATION_FAILED");
      if (action === "remove" && saved) {
        setState({ ...state, savedLocations: state.savedLocations.filter((item) => item.id !== saved.id) });
      } else {
        const body = await response.json() as { savedLocation: SavedLocation };
        setState({
          ...state,
          savedLocations: [...state.savedLocations.filter((item) => item.id !== body.savedLocation.id), body.savedLocation],
        });
      }
    } catch {
      setMutationError(true);
    } finally {
      setPending(false);
    }
  }

  if (state.kind === "loading") return <p className="py-10 text-muted-fg" aria-live="polite">{t("loading")}</p>;
  if (state.kind === "not-found") return <section className="app-card app-card--md space-y-4"><h1 className="font-serif text-2xl">{t("notFound")}</h1><Link href={`/${locale}/location`} className="inline-flex items-center gap-2 underline"><ArrowLeft size={16} aria-hidden />{t("back")}</Link></section>;
  if (state.kind === "error") return <section className="app-card app-card--md space-y-4" role="alert"><h1 className="font-serif text-2xl">{t("loadError")}</h1><AppButton onClick={() => void load()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton></section>;

  const { location, savedLocations, authenticated } = state;
  const saved = savedLocations.find((item) => item.location_role === role) ?? null;
  const place = [location.address_line, location.postal_code, location.city, location.province, location.region].filter(Boolean).join(", ");
  const features = [
    location.accommodation_available ? t("features.accommodation") : null,
    location.catering_internal ? t("features.internalCatering") : null,
    location.catering_external_allowed ? t("features.externalCatering") : null,
    location.parking ? t("features.parking") : null,
    location.accessibility ? t("features.accessibility") : null,
    location.outdoor_space ? t("features.outdoor") : null,
    location.indoor_space ? t("features.indoor") : null,
  ].filter((item): item is string => Boolean(item));

  return <section className="space-y-6">
    <Link href={`/${locale}/location`} className="inline-flex items-center gap-2 text-sm underline"><ArrowLeft size={16} aria-hidden />{t("back")}</Link>
    <header className="app-card app-card--md">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary">{location.venue_type}</p><h1 className="mt-1 font-serif text-3xl text-fg">{location.name}</h1>{location.subtype ? <p className="mt-1 text-muted-fg">{location.subtype}</p> : null}</div>{location.verification_status === "VERIFIED" ? <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm text-green-800 dark:bg-green-950 dark:text-green-200"><CheckCircle2 size={16} aria-hidden />{t("verified")}</span> : null}</div>
      {place ? <p className="mt-4 flex items-start gap-2 text-muted-fg"><MapPin size={17} className="mt-0.5 shrink-0" aria-hidden />{place}</p> : null}
    </header>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <article className="app-card app-card--md"><h2 className="text-lg font-semibold text-fg">{t("description")}</h2><p className="mt-3 whitespace-pre-wrap text-muted-fg">{location.description || t("noDescription")}</p></article>
        <article className="app-card app-card--md"><h2 className="text-lg font-semibold text-fg">{t("featuresTitle")}</h2>{features.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-fg"><Building2 size={16} className="text-primary" aria-hidden />{feature}</li>)}</ul> : <p className="mt-3 text-sm text-muted-fg">{t("featuresEmpty")}</p>}{location.capacity_max ? <p className="mt-4 flex items-center gap-2 text-sm text-fg"><Users size={16} aria-hidden />{t("capacity", { count: location.capacity_max })}</p> : null}</article>
      </div>
      <aside className="space-y-6">
        <section className="app-card app-card--md"><h2 className="text-lg font-semibold text-fg">{t("contacts")}</h2><ul className="mt-3 space-y-2 text-sm text-fg">{location.phone ? <li><a className="underline" href={`tel:${location.phone}`}>{location.phone}</a></li> : null}{location.email ? <li><a className="underline" href={`mailto:${location.email}`}>{location.email}</a></li> : null}{location.website ? <li><a className="inline-flex items-center gap-1 underline" href={location.website} target="_blank" rel="noreferrer">{t("website")}<ExternalLink size={14} aria-hidden /></a></li> : null}</ul>{!location.phone && !location.email && !location.website ? <p className="mt-3 text-sm text-muted-fg">{t("contactsEmpty")}</p> : null}</section>
        <section className="app-card app-card--md"><h2 className="text-lg font-semibold text-fg">{t("eventSection")}</h2><label className="mt-3 block text-sm font-medium text-fg"><span>{t("role")}</span><select className="app-select mt-1 w-full" value={role} onChange={(event) => { const next = event.target.value as LocationRole; setRole(next); window.history.replaceState(null, "", `?role=${next}`); }}>{LOCATION_ROLES.map((item) => <option key={item} value={item}>{planningT(`location.roles.${item}`)}</option>)}</select></label>{!authenticated ? <p className="mt-3 text-sm text-muted-fg">{t("signInToSave")}</p> : saved ? <div className="mt-4 flex flex-wrap gap-2"><AppButton disabled={pending} onClick={() => void mutateLocation("select")}><CheckCircle2 size={16} aria-hidden />{saved.selected ? t("unselect") : t("select")}</AppButton><AppButton variant="outline" disabled={pending} onClick={() => void mutateLocation("remove")}>{t("removeSaved")}</AppButton></div> : <AppButton className="mt-4" disabled={pending} onClick={() => void mutateLocation("save")}><Heart size={16} aria-hidden />{t("saveLocation")}</AppButton>}{mutationError ? <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">{t("mutationError")}</p> : null}</section>
      </aside>
    </div>

    <LocationSupplierAssociations side="location" catalogId={location.id} eventEndpoint={saved ? { scope: "saved", resourceId: saved.id } : null}/>
  </section>;
}
