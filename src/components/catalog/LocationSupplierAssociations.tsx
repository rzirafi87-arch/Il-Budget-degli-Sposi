"use client";

import { AppButton } from "@/components/ui/AppButton";
import {
  LOCATION_SUPPLIER_RELATIONSHIP_TYPES,
  type AssociationEndpointInput,
  type GlobalLocationSupplierAssociation,
  type LocationSupplierRelationshipType,
  type PrivateLocationSupplierAssociation,
} from "@/lib/locationSupplierAssociationContracts";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { Link2, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type AssociationSide = "location" | "supplier";
type EventEndpoint = { scope: "saved" | "private"; resourceId: string };
type Option = EventEndpoint & { name: string };
type EditableState = Record<string, { relationshipType: LocationSupplierRelationshipType; privateNotes: string }>;

type Props = {
  side: AssociationSide;
  catalogId: string;
  eventEndpoint: EventEndpoint | null;
};

function one(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return (value[0] as Record<string, unknown> | undefined) ?? null;
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function globalCounterpart(item: GlobalLocationSupplierAssociation, side: AssociationSide) {
  const record = one(side === "location" ? item.supplier : item.location);
  return {
    id: side === "location" ? item.supplier_id : item.location_id,
    name: typeof record?.name === "string" ? record.name : "",
  };
}

function privateCounterpart(item: PrivateLocationSupplierAssociation, side: AssociationSide) {
  return side === "location" ? item.supplier : item.location;
}

export function LocationSupplierAssociations({ side, catalogId, eventEndpoint }: Props) {
  const t = useTranslations("milestone8.associations");
  const locale = useLocale();
  const counterpart = side === "location" ? "supplier" : "location";
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [globalItems, setGlobalItems] = useState<GlobalLocationSupplierAssociation[]>([]);
  const [privateItems, setPrivateItems] = useState<PrivateLocationSupplierAssociation[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [relationshipType, setRelationshipType] = useState<LocationSupplierRelationshipType>("recommended");
  const [privateNotes, setPrivateNotes] = useState("");
  const [editable, setEditable] = useState<EditableState>({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [globalError, setGlobalError] = useState(false);
  const [privateError, setPrivateError] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const privateFilter = useMemo(() => {
    if (!eventEndpoint) return null;
    return `${eventEndpoint.scope}_${side}` as "saved_location" | "private_location" | "saved_supplier" | "private_supplier";
  }, [eventEndpoint, side]);

  useEffect(() => {
    getBrowserClient().auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, []);

  const loadGlobal = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError(false);
    try {
      const parameter = side === "location" ? "location_id" : "supplier_id";
      const response = await fetch(`/api/location-supplier-associations?${parameter}=${catalogId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("GLOBAL_ASSOCIATIONS_READ_FAILED");
      const body = await response.json() as { associations?: GlobalLocationSupplierAssociation[] };
      setGlobalItems(body.associations ?? []);
    } catch {
      setGlobalError(true);
    } finally {
      setGlobalLoading(false);
    }
  }, [catalogId, side]);

  const loadPrivate = useCallback(async () => {
    if (!token || !eventEndpoint || !privateFilter) {
      setPrivateItems([]);
      setOptions([]);
      return;
    }
    setPrivateLoading(true);
    setPrivateError(false);
    const headers = { authorization: `Bearer ${token}` };
    try {
      const listUrl = `/api/my/location-supplier-associations?endpoint_type=${privateFilter}&endpoint_id=${eventEndpoint.resourceId}`;
      const savedUrl = counterpart === "location" ? "/api/my/locations" : "/api/my/suppliers";
      const privateUrl = `/api/my/private-catalog?entity_type=${counterpart}`;
      const [listResponse, savedResponse, privateResponse] = await Promise.all([
        fetch(listUrl, { headers, cache: "no-store" }),
        fetch(savedUrl, { headers, cache: "no-store" }),
        fetch(privateUrl, { headers, cache: "no-store" }),
      ]);
      if (!listResponse.ok || !savedResponse.ok || !privateResponse.ok) throw new Error("PRIVATE_ASSOCIATIONS_READ_FAILED");
      const listBody = await listResponse.json() as { associations?: PrivateLocationSupplierAssociation[] };
      const savedBody = await savedResponse.json() as {
        savedLocations?: Array<{ id: string; resolved_record?: { name?: string }; location?: { name?: string } }>;
        savedSuppliers?: Array<{ id: string; resolved_record?: { name?: string }; supplier?: { name?: string } }>;
      };
      const privateBody = await privateResponse.json() as { records?: Array<{ id: string; resolved_record?: { name?: string } }> };
      const savedRows: Array<{
        id: string;
        resolved_record?: { name?: string };
        location?: { name?: string };
        supplier?: { name?: string };
      }> = counterpart === "location" ? savedBody.savedLocations ?? [] : savedBody.savedSuppliers ?? [];
      const nextOptions: Option[] = savedRows.map((row) => ({
        scope: "saved",
        resourceId: row.id,
        name: row.resolved_record?.name
          ?? row.location?.name
          ?? row.supplier?.name
          ?? t("unnamed"),
      }));
      nextOptions.push(...(privateBody.records ?? []).map((row) => ({
        scope: "private" as const,
        resourceId: row.id,
        name: row.resolved_record?.name ?? t("unnamed"),
      })));
      const associations = listBody.associations ?? [];
      setPrivateItems(associations);
      setOptions(nextOptions);
      setEditable(Object.fromEntries(associations.map((item) => [item.id, {
        relationshipType: item.relationshipType,
        privateNotes: item.privateNotes ?? "",
      }])));
    } catch {
      setPrivateError(true);
    } finally {
      setPrivateLoading(false);
    }
  }, [counterpart, eventEndpoint, privateFilter, t, token]);

  useEffect(() => { void loadGlobal(); }, [loadGlobal]);
  useEffect(() => { if (authChecked) void loadPrivate(); }, [authChecked, loadPrivate]);

  async function createAssociation() {
    if (!token || !eventEndpoint || !selectedOption || pendingAction) return;
    const [scope, resourceId] = selectedOption.split(":") as ["saved" | "private", string];
    const selected: AssociationEndpointInput = { scope, resource_id: resourceId };
    const fixed: AssociationEndpointInput = { scope: eventEndpoint.scope, resource_id: eventEndpoint.resourceId };
    setPendingAction("create");
    setPrivateError(false);
    try {
      const response = await fetch("/api/my/location-supplier-associations", {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          location: side === "location" ? fixed : selected,
          supplier: side === "supplier" ? fixed : selected,
          relationship_type: relationshipType,
          private_notes: privateNotes,
        }),
      });
      if (!response.ok) throw new Error("PRIVATE_ASSOCIATION_CREATE_FAILED");
      setSelectedOption("");
      setPrivateNotes("");
      await loadPrivate();
    } catch {
      setPrivateError(true);
    } finally {
      setPendingAction(null);
    }
  }

  async function updateAssociation(id: string) {
    if (!token || pendingAction || !editable[id]) return;
    setPendingAction(id);
    setPrivateError(false);
    try {
      const response = await fetch("/api/my/location-supplier-associations", {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          resource_id: id,
          relationship_type: editable[id].relationshipType,
          private_notes: editable[id].privateNotes,
        }),
      });
      if (!response.ok) throw new Error("PRIVATE_ASSOCIATION_UPDATE_FAILED");
      const body = await response.json() as { association: PrivateLocationSupplierAssociation };
      setPrivateItems((current) => current.map((item) => item.id === id ? body.association : item));
    } catch {
      setPrivateError(true);
    } finally {
      setPendingAction(null);
    }
  }

  async function removeAssociation(id: string) {
    if (!token || pendingAction) return;
    setPendingAction(id);
    setPrivateError(false);
    try {
      const response = await fetch(`/api/my/location-supplier-associations?resource_id=${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("PRIVATE_ASSOCIATION_DELETE_FAILED");
      setPrivateItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setPrivateError(true);
    } finally {
      setPendingAction(null);
    }
  }

  function counterpartLink(id: string) {
    return side === "location" ? `/${locale}/fornitori/${id}` : `/${locale}/location/${id}`;
  }

  return (
    <section className="app-card app-card--md space-y-5" aria-labelledby={`associations-${side}-title`}>
      <div className="flex items-start gap-3">
        <span className="app-page-header__icon"><Link2 size={19} aria-hidden /></span>
        <div>
          <h2 id={`associations-${side}-title`} className="text-lg font-semibold text-fg">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-fg">{t(`description.${side}`)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-fg">{t("globalTitle")}</h3>
        {globalLoading ? <p aria-live="polite" className="text-sm text-muted-fg">{t("loading")}</p> : globalError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-700 dark:text-red-300">
            <span>{t("globalError")}</span><AppButton variant="outline" onClick={() => void loadGlobal()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton>
          </div>
        ) : globalItems.length === 0 ? <p className="text-sm text-muted-fg">{t("globalEmpty")}</p> : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {globalItems.map((item) => {
              const target = globalCounterpart(item, side);
              return <li key={`${item.location_id}:${item.supplier_id}:${item.relationship_type}`} className="rounded-xl border border-border bg-bg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={counterpartLink(target.id)}>{target.name || t("unnamed")}</Link>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{t("globalBadge")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-fg">{t(`types.${item.relationship_type}`)}</p>
              </li>;
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-semibold text-fg">{t("privateTitle")}</h3>
        {!authChecked ? <p aria-live="polite" className="text-sm text-muted-fg">{t("loading")}</p> : !token ? (
          <p className="text-sm text-muted-fg">{t("signIn")}</p>
        ) : !eventEndpoint ? <p className="text-sm text-muted-fg">{t(`saveFirst.${side}`)}</p> : privateLoading ? (
          <p aria-live="polite" className="text-sm text-muted-fg">{t("loading")}</p>
        ) : (
          <>
            {privateError ? <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-700 dark:text-red-300"><span>{t("privateError")}</span><AppButton variant="outline" onClick={() => void loadPrivate()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton></div> : null}
            {privateItems.length === 0 ? <p className="text-sm text-muted-fg">{t("privateEmpty")}</p> : (
              <ul className="space-y-3">
                {privateItems.map((item) => {
                  const target = privateCounterpart(item, side);
                  const edit = editable[item.id] ?? { relationshipType: item.relationshipType, privateNotes: item.privateNotes ?? "" };
                  return <li key={item.id} className="rounded-xl border border-border bg-bg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {target.catalogId ? <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={counterpartLink(target.catalogId)}>{target.name || t("unnamed")}</Link> : <span className="font-semibold text-fg">{target.name || t("unnamed")}</span>}
                      <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-fg">{t("privateBadge")}</span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-medium text-fg"><span>{t("relationshipType")}</span><select className="app-select mt-1 w-full" value={edit.relationshipType} onChange={(event) => setEditable((current) => ({ ...current, [item.id]: { ...edit, relationshipType: event.target.value as LocationSupplierRelationshipType } }))}>{LOCATION_SUPPLIER_RELATIONSHIP_TYPES.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}</select></label>
                      <label className="text-sm font-medium text-fg"><span>{t("notes")}</span><textarea className="app-input mt-1 min-h-20 w-full" maxLength={4000} value={edit.privateNotes} onChange={(event) => setEditable((current) => ({ ...current, [item.id]: { ...edit, privateNotes: event.target.value } }))}/></label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AppButton variant="outline" disabled={Boolean(pendingAction)} onClick={() => void updateAssociation(item.id)}>{t("saveChanges")}</AppButton>
                      <AppButton variant="ghost" disabled={Boolean(pendingAction)} onClick={() => void removeAssociation(item.id)}><Trash2 size={16} aria-hidden />{t("remove")}</AppButton>
                    </div>
                  </li>;
                })}
              </ul>
            )}

            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <h4 className="font-semibold text-fg">{t("addTitle")}</h4>
              {options.length === 0 ? <p className="mt-2 text-sm text-muted-fg">{t(`noOptions.${counterpart}`)}</p> : (
                <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-fg"><span>{t(`choose.${counterpart}`)}</span><select data-testid="association-counterpart-select" className="app-select mt-1 w-full" value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)}><option value="">{t("choosePlaceholder")}</option>{options.map((option) => <option key={`${option.scope}:${option.resourceId}`} value={`${option.scope}:${option.resourceId}`}>{option.name} — {t(option.scope === "saved" ? "savedScope" : "privateScope")}</option>)}</select></label>
                  <label className="text-sm font-medium text-fg"><span>{t("relationshipType")}</span><select className="app-select mt-1 w-full" value={relationshipType} onChange={(event) => setRelationshipType(event.target.value as LocationSupplierRelationshipType)}>{LOCATION_SUPPLIER_RELATIONSHIP_TYPES.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}</select></label>
                  <label className="text-sm font-medium text-fg sm:col-span-2"><span>{t("notes")}</span><textarea className="app-input mt-1 min-h-20 w-full" maxLength={4000} value={privateNotes} onChange={(event) => setPrivateNotes(event.target.value)}/></label>
                  <AppButton className="sm:col-span-2 sm:justify-self-start" disabled={!selectedOption || Boolean(pendingAction)} loading={pendingAction === "create"} onClick={() => void createAssociation()}>{t("add")}</AppButton>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
