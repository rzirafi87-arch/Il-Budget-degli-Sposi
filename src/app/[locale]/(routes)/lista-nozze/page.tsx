"use client";

import PageInfoNote from "@/components/PageInfoNote";
import { formatCurrency } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type GiftItem = {
  id?: string;
  type: string;
  name: string;
  description?: string;
  price?: number | null;
  url?: string;
  priority?: "high" | "medium" | "low";
  status?: "wanted" | "received" | "archived";
  notes?: string;
};

const GIFT_TYPES = ["honeymoon", "cash", "experiences", "furniture", "appliances", "luxury", "charity", "vouchers", "smartHome", "other"] as const;

export default function ListaNozzePage() {
  const locale = useLocale();
  const t = useTranslations("milestone9.giftList");
  const supabase = getBrowserClient();
  const eventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const isWedding = eventType === "wedding";
  const [items, setItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<GiftItem>({
    type: "honeymoon",
    name: "",
    description: "",
    price: undefined,
    url: "",
    priority: "medium",
    status: "wanted",
    notes: "",
  });

  async function bearer() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("AUTHENTICATION_REQUIRED");
    return token;
  }

  async function loadItems() {
    setLoading(true);
    setMessage(null);
    try {
      const token = await bearer();
      const res = await fetch("/api/my/gift-list", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "GIFT_LIST_READ_FAILED");
      setItems(json.items || []);
    } catch {
      setMessage(t("operationError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveItem = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = await bearer();
      const res = await fetch("/api/my/gift-list", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newItem, id: editingId || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        setMessage(`${j.error || t("errors.generic")}`);
      } else {
        const j = await res.json();
        setItems((prev) => editingId
          ? prev.map((item) => item.id === editingId ? j.item : item)
          : [j.item, ...prev]);
        setMessage(t(editingId ? "updated" : "added"));
        setEditingId(null);
        setNewItem({
          type: "honeymoon", name: "", description: "", price: undefined, url: "",
          priority: "medium", status: "wanted", notes: "",
        });
        setTimeout(() => setMessage(null), 2500);
      }
    } catch {
      setMessage(t("errors.network"));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: GiftItem) => {
    setEditingId(item.id || null);
    setNewItem({ ...item, price: item.price ?? undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItem({ type: "honeymoon", name: "", description: "", price: undefined, url: "", priority: "medium", status: "wanted", notes: "" });
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setMessage(null);
    try {
      const token = await bearer();
      const res = await fetch(`/api/my/gift-list?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "GIFT_LIST_DELETE_FAILED");
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
      setMessage(t("deleted"));
    } catch {
      setMessage(t("operationError"));
    }
  };

  return (
    <section className="pt-6">
      <div className="mb-2 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h2 className="font-serif text-3xl">{t("title")}</h2>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {isWedding && (
            <Link href={`/${locale}/entrate`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("income")}</Link>
          )}
          <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("dashboard")}</Link>
        </div>
      </div>

      {!isWedding && (
        <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50 mb-6">
          <p className="text-gray-900">
            {t("weddingOnly")}
          </p>
        </div>
      )}

      {isWedding && (
      <PageInfoNote
        icon="🎁"
        title={t("info.title")}
        description={t("info.description")}
        tips={[t("info.tips.honeymoon"), t("info.tips.cash"), t("info.tips.links"), t("info.tips.purchased"), t("info.tips.priority")]}
        eventTypeSpecific={{
          wedding: t("info.events.wedding"), baptism: t("info.events.baptism"), birthday: t("info.events.birthday"), graduation: t("info.events.graduation")
        }}
  />)}

      {message && (
        <div className="my-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      {isWedding && (
      <div className="mb-6 p-5 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <h3 className="font-semibold mb-3">{t(editingId ? "editGift" : "addGift")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.type")}</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              {GIFT_TYPES.map((key) => (
                <option key={key} value={key}>{t(`types.${key}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.name")}</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder={t("fields.namePlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.price")}</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={newItem.price || ""}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) || undefined })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Link</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">{t("fields.description")}</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              rows={2}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.priority")}</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as GiftItem["priority"] })}
            >
              <option value="high">{t("priorities.high")}</option>
              <option value="medium">{t("priorities.medium")}</option>
              <option value="low">{t("priorities.low")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.status")}</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as GiftItem["status"] })}
            >
              <option value="wanted">{t("statuses.wanted")}</option>
              <option value="received">{t("statuses.received")}</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">{t("fields.notes")}</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder={t("fields.notesPlaceholder")}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={saveItem}
            disabled={saving || !newItem.name.trim()}
            className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
          >
            {saving ? t("saving") : t(editingId ? "saveChanges" : "add")}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="ml-2 rounded-lg border px-6 py-2 hover:bg-gray-50">
              {t("cancel")}
            </button>
          )}
        </div>
  </div>
  )}

      {isWedding && (loading ? (
        <div className="text-gray-500">{t("loading")}</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 rounded-xl border bg-white/70">{t("empty")}</div>
      ) : (
        <div className="grid gap-4">
          {items.map((it) => (
            <div data-testid={it.id ? `gift-item-${it.id}` : undefined} key={it.id || it.name + it.type} className="rounded-xl border bg-white/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">{t(`types.${it.type}`)} · {t(`priorities.${it.priority}`)}</div>
                {it.description && (
                  <div className="text-sm text-gray-700 mt-1">{it.description}</div>
                )}
                {it.url && (
                  <a className="text-sm text-blue-600 underline" href={it.url} target="_blank" rel="noreferrer">Link</a>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                {typeof it.price === "number" && (
                  <div className="font-bold">{formatCurrency(it.price)}</div>
                )}
                <div className="text-xs text-gray-500">{t(`statuses.${it.status}`)}</div>
                {it.id && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(it)} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">{t("edit")}</button>
                    <button type="button" onClick={() => void deleteItem(it.id!)} className="rounded border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">{t("delete")}</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
