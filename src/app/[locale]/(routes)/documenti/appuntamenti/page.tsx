"use client";

import { SupplierLinkView } from "@/components/suppliers/SupplierLinkView";
import { SupplierSelector } from "@/components/suppliers/SupplierSelector";
import { AppButton } from "@/components/ui/AppButton";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import type {
  SupplierLink,
  SupplierOption,
  SupplierReferenceInput,
} from "@/lib/supplierWorkContracts";
import { CalendarPlus, RefreshCw, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  title: string;
  date: string;
  location: string;
  notes: string;
  supplier: SupplierLink | null;
};

type AppointmentForm = {
  client_key: string;
  title: string;
  date: string;
  location: string;
  notes: string;
  supplier: SupplierReferenceInput | null;
};

const emptyForm = (): AppointmentForm => ({
  client_key: globalThis.crypto.randomUUID(),
  title: "",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  notes: "",
  supplier: null,
});

function identity(value: SupplierLink | SupplierReferenceInput | null) {
  if (!value) return "";
  return `${value.scope}:${"resourceId" in value ? value.resourceId : value.resource_id}`;
}

export default function AppointmentsPage() {
  const t = useTranslations("branch52M4.appointments");
  const legacy = useTranslations("milestone7.appointments");
  const locale = useLocale();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [options, setOptions] = useState<SupplierOption[]>([]);
  const [form, setForm] = useState<AppointmentForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const headers = { authorization: `Bearer ${token}` };
      const [appointmentsResponse, optionsResponse] = await Promise.all([
        fetch("/api/my/appointments", { headers, cache: "no-store" }),
        fetch("/api/my/supplier-options", { headers, cache: "no-store" }),
      ]);
      if (!appointmentsResponse.ok || !optionsResponse.ok) throw new Error("APPOINTMENTS_LOAD_FAILED");
      const appointmentsBody = await appointmentsResponse.json() as { appointments?: Appointment[] };
      const optionsBody = await optionsResponse.json() as { suppliers?: SupplierOption[] };
      setAppointments(appointmentsBody.appointments ?? []);
      setOptions(optionsBody.suppliers ?? []);
      const query = new URLSearchParams(window.location.search);
      const scope = query.get("supplier_scope");
      const resourceId = query.get("supplier_resource_id");
      setSupplierFilter((scope === "saved" || scope === "private") && resourceId ? `${scope}:${resourceId}` : "");
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredAppointments = useMemo(() => supplierFilter
    ? appointments.filter((appointment) => identity(appointment.supplier) === supplierFilter)
    : appointments, [appointments, supplierFilter]);

  async function authToken() {
    const { data } = await getBrowserClient().auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const token = await authToken();
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch("/api/my/appointments", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (response.status === 400) {
        setMessage(legacy("validation"));
        return;
      }
      if (!response.ok) throw new Error("APPOINTMENT_SAVE_FAILED");
      const body = await response.json() as { appointment: Appointment };
      setAppointments((current) => [...current, body.appointment].sort((left, right) => left.date.localeCompare(right.date)));
      setForm(emptyForm());
      setMessage(t("saved"));
    } catch {
      setMessage(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function updateSupplier(appointment: Appointment, supplier: SupplierReferenceInput | null) {
    if (pendingId) return;
    setPendingId(appointment.id);
    setMessage("");
    try {
      const token = await authToken();
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch(`/api/my/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ supplier }),
      });
      if (!response.ok) throw new Error("APPOINTMENT_UPDATE_FAILED");
      const body = await response.json() as { appointment: Appointment };
      setAppointments((current) => current.map((item) => item.id === appointment.id ? body.appointment : item));
      setMessage(t(supplier ? "linked" : "unlinked"));
    } catch {
      setMessage(t("updateError"));
    } finally {
      setPendingId(null);
    }
  }

  async function remove(appointment: Appointment) {
    if (pendingId || !window.confirm(t("confirmDelete", { title: appointment.title }))) return;
    setPendingId(appointment.id);
    setMessage("");
    try {
      const token = await authToken();
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch(`/api/my/appointments/${appointment.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("APPOINTMENT_DELETE_FAILED");
      setAppointments((current) => current.filter((item) => item.id !== appointment.id));
      setMessage(t("deleted"));
    } catch {
      setMessage(t("deleteError"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-3 py-6 sm:px-4 sm:py-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("eyebrow")}</p>
        <h1 className="mt-1 font-serif text-3xl text-fg">{t("title")}</h1>
        <p className="mt-2 text-muted-fg">{t("description")}</p>
      </header>

      <p className="min-h-6 text-sm text-muted-fg" aria-live="polite">{message}</p>

      <form data-testid="appointment-create-form" onSubmit={handleAdd} className="app-card app-card--md grid min-w-0 gap-4 sm:grid-cols-2">
        <h2 className="font-semibold text-fg sm:col-span-2">{t("addTitle")}</h2>
        <label className="text-sm font-medium text-fg sm:col-span-2">
          <span>{t("formTitle")}</span>
          <input className="app-input mt-1 w-full" value={form.title} maxLength={200} required onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}/>
        </label>
        <label className="text-sm font-medium text-fg">
          <span>{t("date")}</span>
          <input className="app-input mt-1 w-full" type="date" value={form.date} required onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}/>
        </label>
        <label className="text-sm font-medium text-fg">
          <span>{t("location")}</span>
          <input className="app-input mt-1 w-full" value={form.location} maxLength={500} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}/>
        </label>
        <label className="text-sm font-medium text-fg sm:col-span-2">
          <span>{t("notes")}</span>
          <textarea className="app-input mt-1 min-h-24 w-full" value={form.notes} maxLength={4000} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}/>
        </label>
        <div className="sm:col-span-2">
          <SupplierSelector
            label={t("supplier")}
            searchLabel={t("searchSupplier")}
            emptyLabel={t("noSupplier")}
            savedLabel={t("savedSupplier")}
            privateLabel={t("privateSupplier")}
            options={options}
            value={form.supplier}
            disabled={saving}
            onChange={(supplier) => setForm((current) => ({ ...current, supplier }))}
            testId="appointment-create-supplier"
          />
        </div>
        <AppButton className="sm:col-span-2 sm:justify-self-start" type="submit" loading={saving} disabled={saving}>
          <CalendarPlus size={16} aria-hidden />{t("add")}
        </AppButton>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-semibold text-fg">{t("listTitle")}</h2>
          <label className="text-sm font-medium text-fg">
            <span>{t("filterSupplier")}</span>
            <select className="app-select ml-2" value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}>
              <option value="">{t("allSuppliers")}</option>
              {options.map((option) => <option key={`${option.scope}:${option.resourceId}`} value={`${option.scope}:${option.resourceId}`}>{option.name}</option>)}
            </select>
          </label>
        </div>
        {loading ? <p className="text-muted-fg" aria-live="polite">{t("loading")}</p> : loadError ? (
          <div className="app-card app-card--md flex flex-wrap items-center gap-3 text-red-700 dark:text-red-300" role="alert">
            <span>{t("loadError")}</span>
            <AppButton variant="outline" onClick={() => void load()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton>
          </div>
        ) : filteredAppointments.length === 0 ? <p className="app-card app-card--md text-muted-fg">{t("empty")}</p> : (
          <ul className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <li key={appointment.id} className="app-card app-card--md min-w-0 space-y-3" data-testid={`appointment-${appointment.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-fg">{appointment.title}</h3>
                    <p className="text-sm text-muted-fg">{t("dateValue", { date: appointment.date })}</p>
                    {appointment.location ? <p className="text-sm text-muted-fg">{appointment.location}</p> : null}
                    {appointment.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-muted-fg">{appointment.notes}</p> : null}
                    {appointment.supplier ? <SupplierLinkView locale={locale} supplier={appointment.supplier} label={t("linkedSupplier")}/> : null}
                  </div>
                  <AppButton variant="ghost" disabled={Boolean(pendingId)} onClick={() => void remove(appointment)} aria-label={t("deleteNamed", { title: appointment.title })}>
                    <Trash2 size={16} aria-hidden />{t("delete")}
                  </AppButton>
                </div>
                <SupplierSelector
                  label={t("changeSupplier")}
                  searchLabel={t("searchSupplier")}
                  emptyLabel={t("noSupplier")}
                  savedLabel={t("savedSupplier")}
                  privateLabel={t("privateSupplier")}
                  options={options}
                  value={appointment.supplier}
                  disabled={pendingId === appointment.id}
                  onChange={(supplier) => void updateSupplier(appointment, supplier)}
                  testId={`appointment-supplier-${appointment.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
