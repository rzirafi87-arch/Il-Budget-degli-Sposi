"use client";
export const dynamic = "force-dynamic";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

// Appointment model
type Appointment = {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  location?: string;
  notes?: string;
};

const supabase = getBrowserClient();

export default function AppuntamentiPage() {
  const t = useTranslations();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState<Appointment>({ title: "", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      const r = await fetch("/api/my/appointments", { headers });
      const j = await r.json();
      setAppointments(j.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage(t("mustAuth", { default: "Sign in to save appointments" }));
        setSaving(false);
        return;
      }
      const r = await fetch("/api/my/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json();
        setMessage(j.error || t("error", { default: "Save error" }));
      } else {
        setMessage(t("saved", { default: "Appointment added" }));
        setForm({ title: "", date: new Date().toISOString().slice(0, 10), location: "", notes: "" });
        await loadAppointments();
        setTimeout(() => setMessage(null), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm(t("confirmDelete", { default: "Delete this appointment?" }))) return;
    const { data } = await supabase.auth.getSession();
    const jwt = data.session?.access_token;
    if (!jwt) return;
    await fetch(`/api/my/appointments/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } });
    await loadAppointments();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t("appointments.title", { default: "Appointments & Deadlines" })}</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      {!loading && appointments.some((a) => !a.id) && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {t("appointments.suggested", {
            default:
              "This sample agenda is auto-generated for the wedding: personalize it by adding your real appointments.",
          })}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-6 p-4 bg-white rounded-xl shadow flex flex-col gap-3">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={t("appointments.formTitle", { default: "Appointment title" })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="location"
          value={form.location || ""}
          onChange={handleChange}
          placeholder={t("appointments.formLocation", { default: "Location" })}
          className="border rounded px-3 py-2"
        />
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          placeholder={t("appointments.formNotes", { default: "Notes" })}
          className="border rounded px-3 py-2"
        />
        <button type="submit" className="bg-[#A3B59D] text-white px-4 py-2 rounded font-semibold" disabled={saving}>
          {saving ? t("loading", { default: "Saving..." }) : t("appointments.addBtn", { default: "Add appointment" })}
        </button>
      </form>

      {loading ? (
        <div className="text-gray-500">{t("loading", { default: "Loading..." })}</div>
      ) : (
        <ul className="space-y-3">
          {appointments.length === 0 && (
            <li className="text-gray-500">{t("appointments.empty", { default: "No appointments added." })}</li>
          )}
          {appointments.map((a, index) => (
            <li
              key={a.id ?? `appointment-${index}`}
              className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-bold text-green-800">{a.title}</div>
                <div className="text-sm text-gray-700">{t("appointments.dateLabel", { default: "Date" })}: {a.date}</div>
                {a.location && <div className="text-sm text-gray-700">{t("appointments.locationLabel", { default: "Location" })}: {a.location}</div>}
                {a.notes && <div className="text-sm text-gray-600">{a.notes}</div>}
              </div>
              {a.id && (
                <button onClick={() => handleDelete(a.id)} className="text-red-600 text-xs hover:underline">{t("delete", { default: "Delete" })}</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
