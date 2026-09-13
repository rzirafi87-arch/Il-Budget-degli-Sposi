"use client";

import PageInfoNote from "@/components/PageInfoNote";
import { formatCurrency } from "@/lib/locale";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type GiftItem = {
  id?: string;
  type: string;
  name: string;
  description?: string;
  price?: number;
  url?: string;
  priority?: "alta" | "media" | "bassa";
  status?: "desiderato" | "acquistato";
  notes?: string;
};

const GIFT_TYPES = ["honeymoon", "cash", "experiences", "furniture", "appliances", "luxury", "charity", "vouchers", "smartHome", "other"] as const;
const GIFT_TYPE_VALUES: Record<(typeof GIFT_TYPES)[number], string> = {
  honeymoon: "Contributo viaggio di nozze", cash: "Cassa comune", experiences: "Esperienze (cene, spa, tour)",
  furniture: "Arredamento", appliances: "Elettrodomestici", luxury: "Beni di lusso", charity: "Beneficenza",
  vouchers: "Buoni regalo", smartHome: "Tech & Smart Home", other: "Altro",
};

export default function ListaNozzePage() {
  const locale = useLocale();
  const t = useTranslations("milestone9.giftList");
  const eventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const isWedding = eventType === "wedding";
  const [items, setItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<GiftItem>({
    type: GIFT_TYPE_VALUES.honeymoon,
    name: "",
    description: "",
    price: undefined,
    url: "",
    priority: "media",
    status: "desiderato",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my/gift-list");
        const json = await res.json();
        setItems(json.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addItem = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/my/gift-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const j = await res.json();
        setMessage(`${j.error || t("errors.generic")}`);
      } else {
        const j = await res.json();
        setItems((prev) => [j.item, ...prev]);
        setMessage(t("added"));
        setNewItem({
          type: GIFT_TYPE_VALUES.honeymoon, name: "", description: "", price: undefined, url: "",
          priority: "media", status: "desiderato", notes: "",
        });
        setTimeout(() => setMessage(null), 2500);
      }
    } catch {
      setMessage(t("errors.network"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pt-6">
      <div className="flex items-start justify-between mb-2">
        <h2 className="font-serif text-3xl">{t("title")}</h2>
        <div className="flex gap-2">
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
        <h3 className="font-semibold mb-3">{t("addGift")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.type")}</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              {GIFT_TYPES.map((key) => (
                <option key={key} value={GIFT_TYPE_VALUES[key]}>{t(`types.${key}`)}</option>
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
              <option value="alta">{t("priorities.high")}</option>
              <option value="media">{t("priorities.medium")}</option>
              <option value="bassa">{t("priorities.low")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("fields.status")}</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as GiftItem["status"] })}
            >
              <option value="desiderato">{t("statuses.wanted")}</option>
              <option value="acquistato">{t("statuses.purchased")}</option>
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
            onClick={addItem}
            disabled={saving}
            className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
          >
            {saving ? t("saving") : t("add")}
          </button>
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
            <div key={it.id || it.name + it.type} className="rounded-xl border bg-white/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">{it.type} · {it.priority}</div>
                {it.description && (
                  <div className="text-sm text-gray-700 mt-1">{it.description}</div>
                )}
                {it.url && (
                  <a className="text-sm text-blue-600 underline" href={it.url} target="_blank" rel="noreferrer">Link</a>
                )}
              </div>
              <div className="text-right">
                {typeof it.price === "number" && (
                  <div className="font-bold">{formatCurrency(it.price)}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">{it.status === "acquistato" ? t("statuses.purchased") : t("statuses.wanted")}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

