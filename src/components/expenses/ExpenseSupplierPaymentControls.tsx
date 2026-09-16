"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import { FormEvent, useId, useState } from "react";

type SavedSupplier = {
  id: string;
  supplier?: { id: string; name: string | null } | null;
};

type Reminder = {
  id: string;
  expenseId: string;
  amount: number;
  dueDate: string;
  reminderDate: string | null;
  notes: string | null;
  isPaid: boolean;
  paidDate: string | null;
};

type Props = {
  expenseId: string;
  expenseAmount: number;
  savedSupplierId: string | null;
  onChanged: () => void | Promise<void>;
};

export function ExpenseSupplierPaymentControls({
  expenseId,
  expenseAmount,
  savedSupplierId,
  onChanged,
}: Props) {
  const t = useTranslations("branch50Financial");
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [suppliers, setSuppliers] = useState<SavedSupplier[]>([]);
  const [linkedId, setLinkedId] = useState(savedSupplierId ?? "");
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [amount, setAmount] = useState(String(expenseAmount || ""));
  const [dueDate, setDueDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [paidDate, setPaidDate] = useState("");
  const [status, setStatus] = useState("");

  async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const { data } = await getBrowserClient().auth.getSession();
    if (!data.session) throw new Error("AUTHENTICATION_REQUIRED");
    return fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });
  }

  function applyReminder(value: Reminder | null) {
    setReminder(value);
    setAmount(String(value?.amount ?? expenseAmount ?? ""));
    setDueDate(value?.dueDate ?? "");
    setReminderDate(value?.reminderDate ?? "");
    setNotes(value?.notes ?? "");
    setIsPaid(value?.isPaid ?? false);
    setPaidDate(value?.paidDate ?? "");
  }

  async function loadPanel() {
    setLoading(true);
    setStatus("");
    try {
      const [suppliersResponse, remindersResponse] = await Promise.all([
        authenticatedFetch("/api/my/suppliers"),
        authenticatedFetch("/api/payment-reminders"),
      ]);
      if (!suppliersResponse.ok || !remindersResponse.ok) throw new Error("LOAD_FAILED");
      const [suppliersBody, remindersBody] = await Promise.all([
        suppliersResponse.json(),
        remindersResponse.json(),
      ]);
      setSuppliers(suppliersBody.savedSuppliers ?? []);
      applyReminder(
        (remindersBody.reminders ?? []).find(
          (item: Reminder) => item.expenseId === expenseId,
        ) ?? null,
      );
    } catch {
      setStatus(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await loadPanel();
  }

  async function saveLink() {
    setSavingLink(true);
    setStatus("");
    try {
      const response = await authenticatedFetch("/api/my/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: expenseId, savedSupplierId: linkedId || null }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "LINK_FAILED");
      setStatus(linkedId ? t("linkSaved") : t("linkRemoved"));
      await onChanged();
    } catch (error) {
      setStatus(
        error instanceof Error && error.message === "EXPENSE_HAS_PAYMENT_REMINDER"
          ? t("unlinkReminderFirst")
          : t("saveError"),
      );
    } finally {
      setSavingLink(false);
    }
  }

  async function saveReminder(event: FormEvent) {
    event.preventDefault();
    setSavingReminder(true);
    setStatus("");
    try {
      const response = await authenticatedFetch("/api/payment-reminders", {
        method: reminder ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(reminder ? { id: reminder.id } : {}),
          expenseId,
          amount: Number(amount),
          dueDate,
          reminderDate: reminderDate || null,
          notes: notes.trim() || null,
          ...(reminder ? { isPaid, paidDate: isPaid ? paidDate || null : null } : {}),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "REMINDER_SAVE_FAILED");
      applyReminder(body.reminder);
      setStatus(t(reminder ? "reminderUpdated" : "reminderCreated"));
    } catch {
      setStatus(t("reminderSaveError"));
    } finally {
      setSavingReminder(false);
    }
  }

  async function deleteReminder() {
    if (!reminder) return;
    setSavingReminder(true);
    setStatus("");
    try {
      const response = await authenticatedFetch(
        `/api/payment-reminders?id=${encodeURIComponent(reminder.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("REMINDER_DELETE_FAILED");
      applyReminder(null);
      setStatus(t("reminderDeleted"));
    } catch {
      setStatus(t("reminderDeleteError"));
    } finally {
      setSavingReminder(false);
    }
  }

  const inputClass = "mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";
  return (
    <div className="mt-3 text-left">
      <button
        type="button"
        className="min-h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61745c]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => void toggle()}
      >
        {open ? t("closeControls") : t("openControls")}
      </button>

      {open ? (
        <div id={panelId} className="mt-3 min-w-0 space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          {loading ? <p role="status">{t("loading")}</p> : (
            <>
              <fieldset className="space-y-2">
                <legend className="font-semibold">{t("supplierLinkTitle")}</legend>
                <label className="block text-sm font-medium">
                  {t("savedSupplier")}
                  <select className={inputClass} value={linkedId} onChange={(event) => setLinkedId(event.target.value)}>
                    <option value="">{t("noSavedSupplier")}</option>
                    {suppliers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.supplier?.name || t("savedSupplierFallback")}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" disabled={savingLink || linkedId === (savedSupplierId ?? "")} onClick={() => void saveLink()} className="min-h-11 rounded-lg bg-[#61745c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {savingLink ? t("saving") : t("saveLink")}
                </button>
              </fieldset>

              {linkedId ? (
                <form onSubmit={saveReminder} className="space-y-3 border-t border-gray-200 pt-4">
                  <h4 className="font-semibold">{reminder ? t("editReminder") : t("newReminder")}</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium">{t("amount")}<input required min="0.01" step="0.01" inputMode="decimal" type="number" className={inputClass} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                    <label className="block text-sm font-medium">{t("dueDate")}<input required type="date" className={inputClass} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
                    <label className="block text-sm font-medium">{t("reminderDate")}<input type="date" className={inputClass} value={reminderDate} max={dueDate || undefined} onChange={(event) => setReminderDate(event.target.value)} /></label>
                    {reminder ? <label className="flex min-h-11 items-center gap-2 self-end text-sm font-medium"><input type="checkbox" checked={isPaid} onChange={(event) => { setIsPaid(event.target.checked); if (!event.target.checked) setPaidDate(""); }} />{t("paid")}</label> : null}
                    {reminder && isPaid ? <label className="block text-sm font-medium">{t("paidDate")}<input required type="date" className={inputClass} value={paidDate} onChange={(event) => setPaidDate(event.target.value)} /></label> : null}
                    <label className="block text-sm font-medium sm:col-span-2">{t("notes")}<textarea maxLength={1000} rows={2} className={inputClass} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" disabled={savingReminder || !amount || !dueDate || (isPaid && !paidDate)} className="min-h-11 rounded-lg bg-[#61745c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                      {savingReminder ? t("saving") : t("saveReminder")}
                    </button>
                    {reminder ? <button type="button" disabled={savingReminder} onClick={() => void deleteReminder()} className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">{t("deleteReminder")}</button> : null}
                  </div>
                </form>
              ) : <p className="text-sm text-gray-600">{t("linkBeforeReminder")}</p>}
            </>
          )}
          {status ? <p role="status" aria-live="polite" className="text-sm font-medium">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
