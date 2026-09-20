"use client";

import ExportButton from "@/components/ExportButton";
import ExportPDFButton from "@/components/ExportPDFButton";
import { SupplierLinkView } from "@/components/suppliers/SupplierLinkView";
import { SupplierSelector } from "@/components/suppliers/SupplierSelector";
import { AppButton, buttonClasses } from "@/components/ui/AppButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  DEFAULT_EVENT_TYPE,
  type TimelineBucket,
  type TimelineTaskTemplate,
  getEventConfig,
  resolveEventType,
} from "@/constants/eventConfigs";
import { getUserCountrySafe } from "@/constants/geo";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import type { SupplierLink, SupplierOption, SupplierReferenceInput } from "@/lib/supplierWorkContracts";
import { CalendarCheck, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type TimelineTask = {
  id: string;
  clientKey: string | null;
  title: string;
  description: string;
  monthsBefore: number;
  category: string;
  completed: boolean;
  priority: "alta" | "media" | "bassa";
  supplier: SupplierLink | null;
};

type TimelineResponseItem = {
  id: string;
  client_key?: string | null;
  title: string;
  description?: string | null;
  days_before?: number | null;
  category?: string | null;
  completed?: boolean | null;
  supplier?: SupplierLink | null;
};

type Draft = {
  clientKey: string;
  title: string;
  description: string;
  category: string;
  monthsBefore: number;
  supplier: SupplierReferenceInput | null;
};

const supabase = getBrowserClient();
const emptyDraft = (): Draft => ({ clientKey: globalThis.crypto.randomUUID(), title: "", description: "", category: "Organizzazione", monthsBefore: 0, supplier: null });

function mapTimelineItem(item: TimelineResponseItem): TimelineTask {
  return {
    id: item.id,
    clientKey: item.client_key ?? null,
    title: item.title,
    description: item.description ?? "",
    monthsBefore: typeof item.days_before === "number" ? Math.max(0, Math.round(item.days_before / 30)) : 0,
    category: item.category ?? "Organizzazione",
    completed: Boolean(item.completed),
    priority: "media",
    supplier: item.supplier ?? null,
  };
}

function identity(value: SupplierLink | null) {
  return value ? `${value.scope}:${value.resourceId}` : "";
}

export default function TimelinePage() {
  const locale = useLocale();
  const t = useTranslations("milestone7.timeline");
  const m4 = useTranslations("branch52M4.timeline");
  const [eventType, setEventType] = useState<string>(DEFAULT_EVENT_TYPE);
  const eventConfig = getEventConfig(eventType);
  const [country] = useState(() => getUserCountrySafe());
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [options, setOptions] = useState<SupplierOption[]>([]);
  const [hasSession, setHasSession] = useState(false);
  const [tasksFromDb, setTasksFromDb] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("__all__");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [localizedTemplates, setLocalizedTemplates] = useState<TimelineTaskTemplate[] | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cookieMatch = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const stored = window.localStorage.getItem("eventType");
    setEventType(resolveEventType(stored || cookieMatch || DEFAULT_EVENT_TYPE));
  }, []);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      setHasSession(Boolean(token));
      if (!token) {
        setOptions([]);
        setTasksFromDb(false);
        return;
      }
      const headers = { authorization: `Bearer ${token}` };
      const [eventResponse, timelineResponse, optionsResponse] = await Promise.all([
        fetch("/api/event/resolve", { headers }),
        fetch("/api/my/timeline", { headers, cache: "no-store" }),
        fetch("/api/my/supplier-options", { headers, cache: "no-store" }),
      ]);
      if (!timelineResponse.ok || !optionsResponse.ok) throw new Error("TIMELINE_READ_FAILED");
      if (eventResponse.ok) {
        const body = await eventResponse.json();
        if (body?.event?.wedding_date) setEventDate(new Date(body.event.wedding_date));
      }
      const timelineBody = await timelineResponse.json() as { items?: TimelineResponseItem[] };
      const optionsBody = await optionsResponse.json() as { suppliers?: SupplierOption[] };
      const items = timelineBody.items ?? [];
      setOptions(optionsBody.suppliers ?? []);
      setTasksFromDb(items.length > 0);
      if (items.length > 0) setTasks(items.map(mapTimelineItem));
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

  useEffect(() => { void loadTimeline(); }, [eventType, loadTimeline]);

  useEffect(() => {
    if (eventType !== "wedding") {
      setLocalizedTemplates(null);
      return;
    }
    let disposed = false;
    fetch(`/api/my/wedding/localized?country=${country.toUpperCase()}&event=matrimonio`)
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (disposed) return;
        const steps = body?.data?.timeline;
        setLocalizedTemplates(Array.isArray(steps) && steps.length > 0 ? convertStepsToTemplates(steps) : null);
      })
      .catch(() => { if (!disposed) setLocalizedTemplates(null); });
    return () => { disposed = true; };
  }, [country, eventType]);

  useEffect(() => {
    if (tasksFromDb) return;
    const templates = localizedTemplates ?? eventConfig.timelineTasks;
    setTasks(templates.map((template, index) => ({
      ...template,
      id: `${eventType}-task-${index}`,
      clientKey: globalThis.crypto.randomUUID(),
      completed: false,
      priority: template.priority === "alta" || template.priority === "bassa" ? template.priority : "media",
      supplier: null,
    })));
  }, [eventConfig, eventType, localizedTemplates, tasksFromDb]);

  const categories = useMemo(() => ["__all__", ...new Set(tasks.map((task) => task.category))], [tasks]);
  const filteredTasks = useMemo(() => tasks.filter((task) =>
    (selectedCategory === "__all__" || task.category === selectedCategory)
      && (!supplierFilter || identity(task.supplier) === supplierFilter)), [selectedCategory, supplierFilter, tasks]);
  const getTasksForBucket = (bucket: TimelineBucket) => filteredTasks.filter((task) => {
    const max = bucket.maxMonthsBefore ?? Number.POSITIVE_INFINITY;
    return task.monthsBefore >= bucket.minMonthsBefore && task.monthsBefore <= max;
  });
  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  async function token() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function importTemplates() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const jwt = await token();
      if (!jwt) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch("/api/my/timeline", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify(tasks.map((task, index) => ({
          title: task.title,
          description: task.description,
          category: task.category,
          completed: task.completed,
          display_order: index,
          days_before: Math.round(task.monthsBefore * 30),
          client_key: task.clientKey,
          supplier: null,
        }))),
      });
      if (!response.ok) throw new Error("TIMELINE_IMPORT_FAILED");
      const body = await response.json() as { items?: TimelineResponseItem[] };
      setTasks((body.items ?? []).map(mapTimelineItem));
      setTasksFromDb(true);
      setMessage(m4("imported"));
    } catch {
      setMessage(m4("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function addManual(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const jwt = await token();
      if (!jwt) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch("/api/my/timeline", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          title: draft.title,
          client_key: draft.clientKey,
          description: draft.description,
          category: draft.category,
          monthsBefore: draft.monthsBefore,
          display_order: tasksFromDb ? tasks.length : 0,
          supplier: draft.supplier,
        }),
      });
      if (!response.ok) throw new Error("TIMELINE_CREATE_FAILED");
      const body = await response.json() as { items?: TimelineResponseItem[] };
      const created = body.items?.[0];
      if (!created) throw new Error("TIMELINE_CREATE_FAILED");
      setTasks((current) => tasksFromDb ? [...current, mapTimelineItem(created)] : [mapTimelineItem(created)]);
      setTasksFromDb(true);
      setDraft(emptyDraft());
      setMessage(m4("created"));
    } catch {
      setMessage(m4("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function patchTask(task: TimelineTask, body: Record<string, unknown>, successKey: "linked" | "unlinked" | "updated") {
    if (pendingId) return;
    setPendingId(task.id);
    setMessage("");
    try {
      const jwt = await token();
      if (!jwt) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch("/api/my/timeline", {
        method: "PUT",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ id: task.id, ...body }),
      });
      if (!response.ok) throw new Error("TIMELINE_UPDATE_FAILED");
      const result = await response.json() as { item: TimelineResponseItem };
      setTasks((current) => current.map((item) => item.id === task.id ? mapTimelineItem(result.item) : item));
      setMessage(m4(successKey));
    } catch {
      setMessage(m4("updateError"));
    } finally {
      setPendingId(null);
    }
  }

  async function toggleTask(task: TimelineTask) {
    if (!hasSession || !tasksFromDb) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item));
      return;
    }
    await patchTask(task, { completed: !task.completed }, "updated");
  }

  async function deleteTask(task: TimelineTask) {
    if (pendingId || !window.confirm(m4("confirmDelete", { title: task.title }))) return;
    setPendingId(task.id);
    setMessage("");
    try {
      const jwt = await token();
      if (!jwt) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch(`/api/my/timeline?id=${task.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("TIMELINE_DELETE_FAILED");
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setMessage(m4("deleted"));
    } catch {
      setMessage(m4("deleteError"));
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <LoadingState label={t("loading")} cards={4} />;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={eventConfig.timelineTitle}
        description={eventConfig.timelineDescription}
        icon={<CalendarCheck size={24} aria-hidden />}
        actions={<Link href={`/${locale}/dashboard`} className={buttonClasses({ variant: "outline", size: "sm" })}>{t("back")}</Link>}
      />
      <p className="min-h-6 text-sm text-muted-fg" aria-live="polite">{message}</p>
      {loadError ? <div className="app-card app-card--md flex flex-wrap items-center gap-3 text-red-700 dark:text-red-300" role="alert"><span>{m4("loadError")}</span><AppButton variant="outline" onClick={() => void loadTimeline()}><RefreshCw size={16} aria-hidden />{m4("retry")}</AppButton></div> : null}

      <div className="app-card app-card--md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-fg">{t("progress", { percent: progressPercent })}</p>
            <div className="mt-2 h-3 w-full min-w-48 max-w-64 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }}/></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!tasksFromDb && hasSession ? <AppButton variant="outline" loading={saving} disabled={saving} onClick={() => void importTemplates()}>{t("saveChecklist")}</AppButton> : null}
            <ExportButton data={tasks} filename={`timeline-${eventType}`} type="csv" className="text-sm">{t("exportCsv")}</ExportButton>
            <ExportPDFButton data={tasks} filename={`timeline-${eventType}`} title={eventConfig.timelineTitle} subtitle={eventConfig.timelineDescription} className="text-sm">{t("exportPdf")}</ExportPDFButton>
          </div>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-fg"><span>{t("filter")}</span><select className="app-select mt-1 w-full" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>{categories.map((category) => <option key={category} value={category}>{category === "__all__" ? t("all") : category}</option>)}</select></label>
          <label className="text-sm font-medium text-fg"><span>{m4("filterSupplier")}</span><select className="app-select mt-1 w-full" value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}><option value="">{m4("allSuppliers")}</option>{options.map((option) => <option key={`${option.scope}:${option.resourceId}`} value={`${option.scope}:${option.resourceId}`}>{option.name}</option>)}</select></label>
        </div>
      </div>

      {hasSession ? <form data-testid="timeline-create-form" onSubmit={addManual} className="app-card app-card--md grid min-w-0 gap-4 sm:grid-cols-2">
        <h2 className="font-semibold text-fg sm:col-span-2">{m4("addTitle")}</h2>
        <label className="text-sm font-medium text-fg sm:col-span-2"><span>{m4("taskTitle")}</span><input className="app-input mt-1 w-full" required maxLength={200} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}/></label>
        <label className="text-sm font-medium text-fg sm:col-span-2"><span>{m4("description")}</span><textarea className="app-input mt-1 min-h-20 w-full" maxLength={4000} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}/></label>
        <label className="text-sm font-medium text-fg"><span>{m4("category")}</span><input className="app-input mt-1 w-full" maxLength={100} value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}/></label>
        <label className="text-sm font-medium text-fg"><span>{m4("monthsBefore")}</span><input className="app-input mt-1 w-full" type="number" min={0} max={1200} value={draft.monthsBefore} onChange={(event) => setDraft((current) => ({ ...current, monthsBefore: Number(event.target.value) }))}/></label>
        <div className="sm:col-span-2"><SupplierSelector label={m4("supplier")} searchLabel={m4("searchSupplier")} emptyLabel={m4("noSupplier")} savedLabel={m4("savedSupplier")} privateLabel={m4("privateSupplier")} options={options} value={draft.supplier} disabled={saving} onChange={(supplier) => setDraft((current) => ({ ...current, supplier }))} testId="timeline-create-supplier"/></div>
        <AppButton className="sm:col-span-2 sm:justify-self-start" type="submit" loading={saving} disabled={saving}><Plus size={16} aria-hidden />{m4("add")}</AppButton>
      </form> : null}

      <div className="grid gap-6">
        {eventConfig.timelineBuckets.map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket);
          if (bucketTasks.length === 0) return null;
          return <section key={bucket.label} className="app-card app-card--md">
            <h3 className="text-lg font-semibold text-fg">{bucket.label}</h3>
            <ul className="mt-3 space-y-4">
              {bucketTasks.map((task) => <li key={task.id} className="rounded-xl border border-border bg-bg p-3" data-testid={`timeline-item-${task.id}`}>
                <div className="flex min-w-0 gap-3">
                  <button type="button" onClick={() => void toggleTask(task)} disabled={pendingId === task.id} className={`mt-1 h-6 w-6 shrink-0 rounded-full border transition ${task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-transparent hover:border-primary"}`} aria-label={task.completed ? m4("markIncomplete") : m4("markComplete")}>✓</button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h4 className={`break-words font-semibold ${task.completed ? "text-muted-fg line-through" : "text-fg"}`}>{task.title}</h4><span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs text-fg">{task.category}</span></div>
                    {task.description ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted-fg">{task.description}</p> : null}
                    {task.supplier ? <div className="mt-2"><SupplierLinkView locale={locale} supplier={task.supplier} label={m4("linkedSupplier")}/></div> : null}
                  </div>
                  {tasksFromDb ? <AppButton variant="ghost" disabled={Boolean(pendingId)} onClick={() => void deleteTask(task)} aria-label={m4("deleteNamed", { title: task.title })}><Trash2 size={16} aria-hidden /></AppButton> : null}
                </div>
                {tasksFromDb ? <div className="mt-3"><SupplierSelector label={m4("changeSupplier")} searchLabel={m4("searchSupplier")} emptyLabel={m4("noSupplier")} savedLabel={m4("savedSupplier")} privateLabel={m4("privateSupplier")} options={options} value={task.supplier} disabled={pendingId === task.id} onChange={(supplier) => void patchTask(task, { supplier }, supplier ? "linked" : "unlinked")} testId={`timeline-supplier-${task.id}`}/></div> : null}
              </li>)}
            </ul>
          </section>;
        })}
        {filteredTasks.length === 0 ? <p className="app-card app-card--md text-muted-fg">{m4("empty")}</p> : null}
      </div>

      {eventDate ? <div className="rounded-xl border border-border bg-muted p-6 text-center"><p className="text-sm text-muted-fg">{eventConfig.eventDateMessage}</p><p className="text-xl font-semibold text-fg">{eventDate.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div> : null}
    </section>
  );
}

function convertStepsToTemplates(steps: string[]): TimelineTaskTemplate[] {
  const lastIndex = Math.max(steps.length - 1, 1);
  return steps.map((label, index) => ({
    title: label,
    description: "",
    monthsBefore: Math.round(((lastIndex - index) / lastIndex) * 12),
    category: "Organizzazione",
    priority: "media",
  }));
}
