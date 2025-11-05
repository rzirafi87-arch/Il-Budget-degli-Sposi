"use client";

import type { EventConfiguration } from "@/constants/eventConfigs";
import {
    DEFAULT_EVENT_TYPE,
    getEventConfig,
    resolveEventType,
} from "@/constants/eventConfigs";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useMemo, useState } from "react";

export type BudgetIdeaRow = {
  id?: string;
  category: string;
  subcategory: string;
  spendType: string;
  amount: number;
  supplier?: string;
  notes?: string;
};

type ContributorBudgets = Record<string, number>;

type SpendTypeOption = {
  value: string;
  label: string;
};

const supabase = getBrowserClient();

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number, currency: string) {
  return `${currency} ${toNumber(value).toLocaleString("it-IT")}`;
}

function buildDefaultRows(config: EventConfiguration): BudgetIdeaRow[] {
  const rows: BudgetIdeaRow[] = [];
  Object.entries(config.budgetCategories).forEach(([category, subcategories]) => {
    subcategories.forEach((subcategory) => {
      rows.push({
        category,
        subcategory,
        spendType: config.defaultSpendType,
        amount: 0,
        supplier: "",
        notes: "",
      });
    });
  });
  return rows;
}

export default function IdeaDiBudgetPage() {
  const [eventType, setEventType] = useState<string>(DEFAULT_EVENT_TYPE);
  const eventConfig = getEventConfig(eventType);

  const [rows, setRows] = useState<BudgetIdeaRow[]>(() =>
    buildDefaultRows(eventConfig),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contributorBudgets, setContributorBudgets] = useState<ContributorBudgets>(
    {},
  );
  const [eventDate, setEventDate] = useState("");
  const [currency, setCurrency] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("budgetIdea.currency")) ||
      "EUR",
  );
  const [contingencyPct, setContingencyPct] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = Number(localStorage.getItem("budgetIdea.contingencyPct") || 0);
    return Number.isFinite(stored) ? stored : 0;
  });
  const [compactView, setCompactView] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("budgetIdea.compactView") === "1",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieMatch = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const stored = window.localStorage.getItem("eventType");
    const resolved = resolveEventType(stored || cookieMatch || DEFAULT_EVENT_TYPE);
    setEventType(resolved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextBudgets: ContributorBudgets = {};
    eventConfig.contributors.forEach(({ value }) => {
      const stored = Number(
        localStorage.getItem(`budgetIdea.budget.${eventType}.${value}`) || 0,
      );
      nextBudgets[value] = Number.isFinite(stored) ? stored : 0;
    });
    setContributorBudgets(nextBudgets);
    const storedDate =
      localStorage.getItem(`budgetIdea.eventDate.${eventType}`) || "";
    setEventDate(storedDate);
  }, [eventConfig.contributors, eventType]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("budgetIdea.currency", currency);
    localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
    localStorage.setItem("budgetIdea.compactView", compactView ? "1" : "0");

    eventConfig.contributors.forEach(({ value }) => {
      const amount = contributorBudgets[value] || 0;
      localStorage.setItem(
        `budgetIdea.budget.${eventType}.${value}`,
        String(amount),
      );
    });
    localStorage.setItem(`budgetIdea.eventDate.${eventType}`, eventDate);

    if (eventConfig.contributors[0]) {
      const first = eventConfig.contributors[0].value;
      localStorage.setItem(
        "brideBudget",
        String(contributorBudgets[first] || 0),
      );
    }
    if (eventConfig.contributors[1]) {
      const second = eventConfig.contributors[1].value;
      localStorage.setItem(
        "groomBudget",
        String(contributorBudgets[second] || 0),
      );
    }
    localStorage.setItem("weddingDate", eventDate);
  }, [
    compactView,
    contingencyPct,
    contributorBudgets,
    currency,
    eventConfig.contributors,
    eventDate,
    eventType,
  ]);

  useEffect(() => {
    let disposed = false;
    async function loadRows() {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;

        const res = await fetch("/api/idea-di-budget", { headers });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();
        if (disposed) return;

        if (Array.isArray(json?.data) && json.data.length > 0) {
          const aggregated = new Map<string, BudgetIdeaRow>();
          json.data.forEach((entry: Record<string, unknown>) => {
            const relation = entry.categories;
            let categoryFromRelation = "";
            if (relation && typeof relation === "object" && "name" in relation) {
              const maybeName = (relation as { name?: unknown }).name;
              if (typeof maybeName === "string") {
                categoryFromRelation = maybeName;
              }
            }
            const category = String(categoryFromRelation || entry.category || "");
            const subcategory = String(entry.subcategory || "");
            if (!category || !subcategory) return;
            const key = `${category}|||${subcategory}`;
            const spendTypeRaw = String(
              entry.spendType ??
                entry.spend_type ??
                eventConfig.defaultSpendType,
            );
            const spendType =
              spendTypeRaw === "common"
                ? eventConfig.defaultSpendType
                : spendTypeRaw;
            const amount = toNumber(entry.idea_amount ?? entry.amount);
            const supplier =
              typeof entry.supplier === "string" ? entry.supplier : "";
            const notes = typeof entry.notes === "string" ? entry.notes : "";

            const existing = aggregated.get(key);
            if (existing) {
              existing.amount += amount;
              if (!existing.supplier && supplier) existing.supplier = supplier;
              if (!existing.notes && notes) existing.notes = notes;
              if (
                existing.spendType === eventConfig.defaultSpendType &&
                spendType !== eventConfig.defaultSpendType
              ) {
                existing.spendType = spendType;
              }
            } else {
              aggregated.set(key, {
                category,
                subcategory,
                spendType,
                amount,
                supplier,
                notes,
              });
            }
          });
          setRows(Array.from(aggregated.values()));
        } else {
          setRows(buildDefaultRows(eventConfig));
        }
      } catch (error) {
        console.error("Errore caricamento idea di budget", error);
        if (!disposed) {
          setRows(buildDefaultRows(eventConfig));
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    loadRows();
    return () => {
      disposed = true;
    };
  }, [eventConfig, eventType]);

  const spendTypeOptions = useMemo<SpendTypeOption[]>(() => {
    const base = eventConfig.spendTypes;
    const extras = Array.from(
      new Set(
        rows
          .map((row) => row.spendType)
          .filter((value) => value && !base.some((opt) => opt.value === value)),
      ),
    ).map((value) => ({ value, label: value }));
    return [...base, ...extras];
  }, [eventConfig.spendTypes, rows]);

  const spendTypeLabelMap = useMemo(() => {
    return new Map(eventConfig.spendTypes.map((opt) => [opt.value, opt.label]));
  }, [eventConfig.spendTypes]);

  const plannedBySpendType = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.spendType] = (acc[row.spendType] || 0) + toNumber(row.amount);
      return acc;
    }, {});
  }, [rows]);

  const plannedTotal = useMemo(
    () => rows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [rows],
  );

  const totalBudget = useMemo(
    () =>
      eventConfig.contributors.reduce(
        (sum, contributor) => sum + (contributorBudgets[contributor.value] || 0),
        0,
      ),
    [contributorBudgets, eventConfig.contributors],
  );

  const extraSpendItems = useMemo(() => {
    const validKeys = new Set(
      eventConfig.contributors.map((contributor) => contributor.value),
    );
    return Object.entries(plannedBySpendType).filter(
      ([value]) => !validKeys.has(value),
    );
  }, [eventConfig.contributors, plannedBySpendType]);

  function handleRowChange<K extends keyof BudgetIdeaRow>(
    index: number,
    field: K,
    value: BudgetIdeaRow[K],
  ) {
    setRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)),
    );
  }

  function handleBudgetChange(key: string, value: number) {
    const safeValue = Number.isFinite(value) ? value : 0;
    setContributorBudgets((prev) => ({ ...prev, [key]: safeValue }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const payload = rows.map((row) => ({
        category: row.category,
        subcategory: row.subcategory,
        spendType: row.spendType,
        idea_amount: toNumber(row.amount),
        supplier: row.supplier,
        notes: row.notes,
      }));

      const res = await fetch("/api/idea-di-budget", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);

      const firstContributor = eventConfig.contributors[0]?.value;
      const secondContributor = eventConfig.contributors[1]?.value;
      const firstBudget = firstContributor
        ? contributorBudgets[firstContributor] || 0
        : 0;
      const secondBudget = secondContributor
        ? contributorBudgets[secondContributor] || 0
        : 0;

      const res = await fetch("/api/event/update-budget", {
        method: "POST",
        headers,
        body: JSON.stringify({
          total_budget: totalBudget,
          bride_initial_budget: firstBudget,
          groom_initial_budget: secondBudget,
          event_date: eventDate || null
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Errore salvataggio (${res.status})`);
      }
      alert("Salvato!");
    } catch (error) {
      console.error("Errore salvataggio idea di budget", error);
      alert("Errore nel salvataggio dell'idea di budget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyToBudget() {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      const country =
        (typeof window !== "undefined" && localStorage.getItem("country")) ||
        "it";

      const res = await fetch(
        `/api/idea-di-budget/apply?country=${encodeURIComponent(country)}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ country, rows }),
        },
      );
      if (!res.ok) throw new Error(`Apply failed (${res.status})`);
      const json = await res.json();
      alert(
        `Applicazione completata: ${json?.inserted ?? 0} voci create o aggiornate.`,
      );
    } catch (error) {
      console.error("Errore applicazione budget", error);
      alert("Errore nell'applicazione al budget.");
    } finally {
      setSaving(false);
    }
  }

  const contingencyAmount = (plannedTotal * contingencyPct) / 100;
  const totalWithContingency = plannedTotal + contingencyAmount;

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Caricamento idee di budget...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold">Idea di budget</h1>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#1d4ed8]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvataggio..." : "Salva idea di budget"}
          </button>
          <button
            className="rounded-full border border-[#2563eb] px-5 py-2 text-sm font-semibold text-[#2563eb] transition hover:bg-[#2563eb] hover:text-white"
            onClick={handleApplyToBudget}
            disabled={saving}
          >
            Applica al budget
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Data evento
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Sincronizzato con la dashboard principale.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Valuta
            </label>
            <input
              type="text"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value.trim().toUpperCase().slice(0, 4))
              }
              maxLength={4}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Imprevisti (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={contingencyPct}
              onChange={(event) =>
                setContingencyPct(Math.max(0, Number(event.target.value) || 0))
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={compactView}
              onChange={(event) => setCompactView(event.target.checked)}
              className="h-4 w-4"
            />
            Vista compatta (righe piu strette)
          </label>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
          <div>
            <strong>Totale pianificato:</strong>{" "}
            {formatAmount(plannedTotal, currency)}
          </div>
          <div>
            <strong>Imprevisti:</strong>{" "}
            {formatAmount(contingencyAmount, currency)} ({contingencyPct}
            %)
          </div>
          <div>
            <strong>Totale con imprevisti:</strong>{" "}
            {formatAmount(totalWithContingency, currency)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {eventConfig.contributors.map((contributor) => {
          const planned = plannedBySpendType[contributor.value] || 0;
          const available = contributorBudgets[contributor.value] || 0;
          const residue = Math.max(available - planned, 0);
          return (
            <div
              key={contributor.value}
              className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${contributor.cardClass}`}
            >
              <h4 className="font-semibold text-gray-800">
                {contributor.label}
              </h4>
              <div className="mt-2 text-sm text-gray-600">
                Disponibile: {formatAmount(available, currency)}
              </div>
              <div className="text-sm text-gray-600">
                Pianificato: {formatAmount(planned, currency)}
              </div>
              <div className="text-sm font-semibold text-emerald-600">
                Residuo: {formatAmount(residue, currency)}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-gray-600">
                  Budget
                </label>
                <input
                  type="number"
                  value={available}
                  min={0}
                  onChange={(event) =>
                    handleBudgetChange(
                      contributor.value,
                      Number(event.target.value),
                    )
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          );
        })}
        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
          <h4 className="font-semibold text-gray-800">
            {eventConfig.totalBudgetLabel}
          </h4>
          <div className="mt-2 text-sm text-gray-600">
            Disponibile: {formatAmount(totalBudget, currency)}
          </div>
          <div className="text-sm text-gray-600">
            Pianificato: {formatAmount(plannedTotal, currency)}
          </div>
          <div className="text-sm font-semibold text-emerald-600">
            Residuo: {formatAmount(Math.max(totalBudget - plannedTotal, 0), currency)}
          </div>
          {extraSpendItems.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              <p className="font-semibold">Altri contributi</p>
              <ul className="mt-1 space-y-1">
                {extraSpendItems.map(([value, amount]) => (
                  <li key={value}>
                    {spendTypeLabelMap.get(value) || value}:{" "}
                    {formatAmount(amount, currency)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <th className="p-3">Categoria</th>
              <th className="p-3">Sottocategoria</th>
              <th className="p-3">Importo ({currency})</th>
              <th className="p-3">{eventConfig.spendTypeLabel}</th>
              <th className="p-3">Fornitore</th>
              <th className="p-3">Note</th>
            </tr>
          </thead>
          <tbody className={compactView ? "text-sm" : "text-base"}>
            {rows.map((row, index) => (
              <tr
                key={`${row.category}-${row.subcategory}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-3 font-medium text-gray-800">{row.category}</td>
                <td className="p-3 text-gray-700">{row.subcategory}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    value={row.amount}
                    onChange={(event) =>
                      handleRowChange(index, "amount", toNumber(event.target.value))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={row.spendType}
                    onChange={(event) =>
                      handleRowChange(index, "spendType", event.target.value)
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    {spendTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={row.supplier || ""}
                    onChange={(event) =>
                      handleRowChange(index, "supplier", event.target.value)
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </td>
                <td className="p-3">
                  <textarea
                    value={row.notes || ""}
                    onChange={(event) =>
                      handleRowChange(index, "notes", event.target.value)
                    }
                    rows={compactView ? 2 : 3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
