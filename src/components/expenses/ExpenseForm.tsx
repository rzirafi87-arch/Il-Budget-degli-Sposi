"use client";

import { useToast } from "@/components/ToastProvider";
import { WEDDING_BUDGET_CATEGORIES } from "@/constants/budgetCategories";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";

export type ExpenseFormRecord = {
  category: string;
  subcategory: string;
  supplier: string;
  savedSupplierId: string | null;
  description: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  status: "pending" | "approved";
  date: string;
  notes: string;
  fromDashboard: boolean;
};

type SavedSupplierOption = {
  id: string;
  supplier?: { id: string; name: string | null } | null;
};

type Props = { onCreated?: () => void | Promise<void>; compact?: boolean };
const CUSTOM = "__custom__";

export function ExpenseForm({ onCreated, compact = false }: Props) {
  const t = useTranslations();
  const { showToast } = useToast();
  const categories = useMemo(() => Object.keys(WEDDING_BUDGET_CATEGORIES), []);
  const [category, setCategory] = useState(categories[0]);
  const [subcategory, setSubcategory] = useState(WEDDING_BUDGET_CATEGORIES[categories[0]][0]);
  const [customItem, setCustomItem] = useState("");
  const [supplier, setSupplier] = useState("");
  const [savedSupplierId, setSavedSupplierId] = useState("");
  const [savedSuppliers, setSavedSuppliers] = useState<SavedSupplierOption[]>([]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"pending" | "approved">("pending");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await getBrowserClient().auth.getSession();
      if (!data.session) return;
      const response = await fetch("/api/my/suppliers", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (!response.ok) return;
      const body = await response.json();
      if (active) setSavedSuppliers(body.savedSuppliers ?? []);
    })();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const normalizedAmount = Number(amount);
    const item = subcategory === CUSTOM ? customItem.trim() : subcategory;
    if (!item || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0) return;
    setSaving(true);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      if (!data.session) throw new Error("UNAUTHORIZED");
      const record: ExpenseFormRecord = {
        category,
        subcategory: item,
        supplier: supplier.trim(),
        savedSupplierId: savedSupplierId || null,
        description: description.trim(),
        amount: normalizedAmount,
        spendType: "common",
        status,
        date: new Date().toISOString().slice(0, 10),
        notes: notes.trim(),
        fromDashboard: false,
      };
      const response = await fetch("/api/my/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "EXPENSE_CREATE_FAILED");
      }
      setSupplier("");
      setSavedSupplierId("");
      setAmount("");
      setDescription("");
      setNotes("");
      setCustomItem("");
      setSubcategory(WEDDING_BUDGET_CATEGORIES[category][0]);
      showToast(t("expensesPage.messages.successAdded"), "success");
      await onCreated?.();
    } catch (error) {
      showToast(t("expensesPage.messages.saveError", { error: error instanceof Error ? error.message : "EXPENSE_CREATE_FAILED" }), "error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "min-h-11 w-full rounded border border-gray-300 px-3 py-2";
  return (
    <form onSubmit={submit} className={compact ? "space-y-4" : "mb-6 rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm sm:p-6"}>
      <h3 className="mb-4 text-center font-semibold">{t("expensesPage.form.new")}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">{t("expensesPage.form.category")}<select className={`${inputClass} mt-1`} value={category} onChange={(e) => { const next = e.target.value; setCategory(next); setSubcategory(WEDDING_BUDGET_CATEGORIES[next][0]); }}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-medium">{t("expensesPage.form.subcategory")}<select className={`${inputClass} mt-1`} value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>{WEDDING_BUDGET_CATEGORIES[category].map((item) => <option key={item}>{item}</option>)}<option value={CUSTOM}>{t("expensesPage.form.customItem")}</option></select></label>
        {subcategory === CUSTOM ? <label className="block text-sm font-medium sm:col-span-2">{t("expensesPage.form.customItem")}<input required className={`${inputClass} mt-1`} value={customItem} onChange={(e) => setCustomItem(e.target.value)} /></label> : null}
        <label className="block text-sm font-medium">{t("expensesPage.form.amount")}<input required min="0.01" step="0.01" inputMode="decimal" type="number" className={`${inputClass} mt-1`} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("expensesPage.form.placeholders.amount")} /></label>
        <label className="block text-sm font-medium">
          {t("branch50Financial.savedSupplier")}
          <select
            className={`${inputClass} mt-1`}
            value={savedSupplierId}
            onChange={(event) => {
              const id = event.target.value;
              setSavedSupplierId(id);
              const selected = savedSuppliers.find((item) => item.id === id);
              if (selected?.supplier?.name) setSupplier(selected.supplier.name);
            }}
          >
            <option value="">{t("branch50Financial.noSavedSupplier")}</option>
            {savedSuppliers.map((item) => <option key={item.id} value={item.id}>{item.supplier?.name || t("branch50Financial.savedSupplierFallback")}</option>)}
          </select>
          {savedSuppliers.length === 0 ? <span className="mt-1 block text-xs text-gray-600">{t("branch50Financial.noSavedSuppliersHelp")}</span> : null}
        </label>
        <label className="block text-sm font-medium">{t("expensesPage.form.supplier")}<input className={`${inputClass} mt-1`} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={t("expensesPage.form.placeholders.supplier")} /></label>
        <label className="block text-sm font-medium">{t("expensesPage.form.paymentStatus")}<select className={`${inputClass} mt-1`} value={status} onChange={(e) => setStatus(e.target.value as "pending" | "approved")}><option value="pending">{t("expensesPage.status.pending")}</option><option value="approved">{t("expensesPage.status.approved")}</option></select></label>
        <label className="block text-sm font-medium">{t("expensesPage.form.description")}<input className={`${inputClass} mt-1`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("expensesPage.form.placeholders.description")} /></label>
        <label className="block text-sm font-medium sm:col-span-2">{t("expensesPage.form.notes")}<textarea className={`${inputClass} mt-1`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("expensesPage.form.placeholders.notes")} /></label>
      </div>
      <button type="submit" disabled={saving || !amount || (subcategory === CUSTOM && !customItem.trim())} className="mt-4 min-h-11 rounded-lg bg-[#A3B59D] px-6 py-2 text-white hover:bg-[#8a9d84] disabled:opacity-50">{saving ? t("loading", { fallback: "…" }) : t("expensesPage.buttons.save")}</button>
    </form>
  );
}
