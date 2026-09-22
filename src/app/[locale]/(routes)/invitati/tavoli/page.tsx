/* Le tipizzazioni esplicite eliminano la necessità di any */
"use client";

import { useLocale, useTranslations } from "next-intl";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useEffect, useState } from "react";

type AssignedGuest = { guestId: string; seatNumber: number; guestName?: string };
type Table = {
  id?: string;
  tableNumber?: number;
  tableName?: string;
  tableType?: string;
  totalSeats: number;
  notes?: string;
  assignedGuests: AssignedGuest[];
};

type AvailableGuest = {
  id: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  familyGroupId?: string | null;
  familyName?: string | null;
  excludeFromFamilyTable?: boolean;
};

export default function TavoliPage() {
  const t = useTranslations("guestsPage.tables");
  const locale = useLocale() || "it";
  const supabase = getBrowserClient();
  const [tables, setTables] = useState<Table[]>([]);
  const [availableGuests, setAvailableGuests] = useState<AvailableGuest[]>([]);
  const [seatsPerTable, setSeatsPerTable] = useState<number>(8);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function bearer() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("AUTHENTICATION_REQUIRED");
    return token;
  }

  async function loadTables() {
      setLoading(true);
      try {
        const token = await bearer();
        const res = await fetch("/api/my/tables", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "TABLES_READ_FAILED");
        interface ApiTable { id?: string; tableNumber?: number; tableName?: string; tableType?: string; totalSeats?: number; notes?: string; assignedGuests?: { guestId: string; seatNumber: number; guestName?: string }[] }
        const apiTables: ApiTable[] = json.tables || [];
        setTables(apiTables.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          tableName: t.tableName,
          tableType: t.tableType,
          totalSeats: Number(t.totalSeats || 0),
          notes: t.notes,
          assignedGuests: (t.assignedGuests || []).map((ag) => ({
            guestId: ag.guestId,
            seatNumber: ag.seatNumber,
            guestName: ag.guestName,
          })),
        })));
        setAvailableGuests(json.availableGuests || []);
      } catch {
        setMessage(t("errors.TABLE_NETWORK_ERROR"));
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    void loadTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="pt-6">{t("loading")}</div>;
  }

  const totalTables = tables.length;
  const totalSeats = tables.reduce((s, t) => s + (t.totalSeats || 0), 0);
  const assignedSeats = tables.reduce((s, t) => s + (t.assignedGuests?.length || 0), 0);
  const availableSeats = totalSeats - assignedSeats;

  function autoAssignByFamily() {
    const allGuests: AvailableGuest[] = [
      ...availableGuests,
      ...tables.flatMap((table) => table.assignedGuests.map((guest) => ({
        id: guest.guestId,
        name: guest.guestName || guest.guestId,
        guestType: "common" as const,
      }))),
    ];
    if (allGuests.length === 0) {
      setMessage(t("noGuests"));
      return;
    }

    // Separate included (family table) and excluded (cousins/others)
    const inc = allGuests.filter(g => !g.excludeFromFamilyTable);
    const exc = allGuests.filter(g => g.excludeFromFamilyTable);

    // Group included by family
    const byFamily = new Map<string, { name: string; members: AvailableGuest[] }>();
    for (const g of inc) {
      const key = g.familyGroupId || `no-family`;
      const fam = byFamily.get(key) || { name: g.familyName || t("withoutFamily"), members: [] };
      fam.members.push(g);
      byFamily.set(key, fam);
    }

    const newTables: Table[] = [];
    let tableCounter = 1;

    // Helper to create chunked tables
    function createTablesForGroup(label: string, members: AvailableGuest[], type: string) {
      for (let i = 0; i < members.length; i += seatsPerTable) {
        const slice = members.slice(i, i + seatsPerTable);
        const tableName = type === "family" && members.length <= seatsPerTable
          ? t("namedTable", {label})
          : `${type === "family" ? t("namedTable", {label}) : t("cousinsTable")} ${Math.floor(i / seatsPerTable) + 1}`;
        const assigned: AssignedGuest[] = slice.map((g, idx) => ({ guestId: g.id, seatNumber: idx + 1, guestName: g.name }));
        newTables.push({
          tableNumber: tableCounter++,
          tableName,
          tableType: type,
          totalSeats: seatsPerTable,
          notes: "",
          assignedGuests: assigned,
        });
      }
    }

    // Families (included)
    for (const [key, fam] of byFamily.entries()) {
      if (key === 'no-family') continue; // handle later
      if (fam.members.length === 0) continue;
      createTablesForGroup(t("namedFamily", {name: fam.name}), fam.members, "family");
    }

    // Guests without family but included ? group into generic tables
    const noFamilyIncluded = byFamily.get('no-family')?.members || [];
    if (noFamilyIncluded.length > 0) {
      createTablesForGroup(t("friends"), noFamilyIncluded, "friends");
    }

    // Excluded across families ? Cugini tables
    if (exc.length > 0) {
      // Keep a stable order by familyName and name
      const sortedExc = [...exc].sort((a, b) => (a.familyName || '').localeCompare(b.familyName || '') || a.name.localeCompare(b.name));
      createTablesForGroup(t("cousins"), sortedExc, "cousins");
    }

    setTables(newTables);
    setAvailableGuests([]);
    setMessage(t("generated", {tables: newTables.length, guests: allGuests.length}));
  }

  function addTable() {
    const nextNumber = Math.max(0, ...tables.map((table) => table.tableNumber || 0)) + 1;
    setTables((current) => [...current, {
      tableNumber: nextNumber,
      tableName: "",
      tableType: "round",
      totalSeats: seatsPerTable,
      notes: "",
      assignedGuests: [],
    }]);
  }

  function assignGuest(tableIndex: number, guestId: string) {
    const guest = availableGuests.find((candidate) => candidate.id === guestId);
    if (!guest) return;
    setTables((current) => current.map((table, index) => index === tableIndex ? {
      ...table,
      assignedGuests: [...table.assignedGuests, {
        guestId: guest.id,
        guestName: guest.name,
        seatNumber: table.assignedGuests.length + 1,
      }],
    } : table));
    setAvailableGuests((current) => current.filter((candidate) => candidate.id !== guestId));
  }

  function unassignGuest(tableIndex: number, guest: AssignedGuest) {
    setTables((current) => current.map((table, index) => index === tableIndex ? {
      ...table,
      assignedGuests: table.assignedGuests
        .filter((assignment) => assignment.guestId !== guest.guestId)
        .map((assignment, seatIndex) => ({ ...assignment, seatNumber: seatIndex + 1 })),
    } : table));
    setAvailableGuests((current) => [...current, {
      id: guest.guestId,
      name: guest.guestName || guest.guestId,
      guestType: "common" as const,
    }].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function removeTable(index: number) {
    const table = tables[index];
    if (!window.confirm(t("confirmDelete"))) return;
    if (table.id) {
      try {
        const token = await bearer();
        const res = await fetch(`/api/my/tables?id=${encodeURIComponent(table.id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "TABLE_DELETE_FAILED");
      } catch {
        setMessage(t("errors.TABLE_SAVE_FAILED"));
        return;
      }
    }
    const returned = table.assignedGuests.map((guest) => ({ id: guest.guestId, name: guest.guestName || guest.guestId, guestType: "common" as const }));
    setAvailableGuests((current) => [...current, ...returned].sort((a, b) => a.name.localeCompare(b.name)));
    setTables((current) => current.filter((_, tableIndex) => tableIndex !== index));
  }

  async function saveTables() {
    setSaving(true);
    setMessage(null);
    try {
      const token = await bearer();
      const res = await fetch('/api/my/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tables, replace: true }),
      });
      if (!res.ok) {
        const j = await res.json();
        setMessage(t(`errors.${j.error || "TABLE_SAVE_FAILED"}`));
      } else {
        setMessage(t("saved"));
        await loadTables();
      }
    } catch {
      setMessage(t("errors.TABLE_NETWORK_ERROR"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="pt-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="font-serif text-3xl">{t("pageTitle")}</h1>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href={`/${locale}/invitati`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("back")}</Link>
          <button onClick={autoAssignByFamily} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm" style={{ background: 'var(--color-sage)' }}>{t("autoAssign")}</button>
          <button onClick={addTable} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("addTable")}</button>
        </div>
      </div>

      <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
          <div className="p-4 bg-gray-50 rounded-lg border">{t("totalTables")}: <strong>{totalTables}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">{t("totalSeats")}: <strong>{totalSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">{t("assignedSeats")}: <strong>{assignedSeats}</strong></div>
          <div className="p-4 bg-gray-50 rounded-lg border">{t("availableSeats")}: <strong>{availableSeats}</strong></div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <label htmlFor="seats-per-table" className="font-semibold">{t("seatsPerTable")}</label>
          <input id="seats-per-table" type="number" min={4} max={14} value={seatsPerTable} onChange={(e) => setSeatsPerTable(Number(e.target.value || 8))} className="border rounded px-2 py-1 w-20" />
          <span className="text-gray-500">{t("recommended")}</span>
        </div>
        {message && <div className="mt-3 text-sm p-2 rounded border bg-gray-50">{message}</div>}
      </div>

      {/* Preview simple list */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white/70">
        {tables.length === 0 ? (
          <p className="text-sm text-gray-600">{t("empty")}</p>
        ) : (
          <div className="space-y-3">
            {tables.map((table, idx) => (
              <div data-testid={table.id ? `table-${table.id}` : `table-new-${idx}`} key={table.id || `new-${idx}`} className="border rounded p-3 space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[7rem_1fr_7rem_auto]">
                  <input aria-label={t("tableNumber")} type="number" min={1} value={table.tableNumber || ""} onChange={(event) => setTables((current) => current.map((item, index) => index === idx ? { ...item, tableNumber: Number(event.target.value) } : item))} className="rounded border px-3 py-2" />
                  <input aria-label={t("tableName")} value={table.tableName || ""} onChange={(event) => setTables((current) => current.map((item, index) => index === idx ? { ...item, tableName: event.target.value } : item))} placeholder={t("tableName")} className="rounded border px-3 py-2" />
                  <input aria-label={t("capacity")} type="number" min={1} max={100} value={table.totalSeats} onChange={(event) => setTables((current) => current.map((item, index) => index === idx ? { ...item, totalSeats: Number(event.target.value) } : item))} className="rounded border px-3 py-2" />
                  <button type="button" onClick={() => void removeTable(idx)} className="rounded border border-red-200 px-3 py-2 text-sm text-red-700">{t("deleteTable")}</button>
                </div>
                <div className="text-xs text-gray-500 mb-2">{t("tableDetails", {type: table.tableType || "n/a", seats: table.totalSeats, assigned: table.assignedGuests.length})}</div>
                <ul className="space-y-2 text-sm">
                  {table.assignedGuests.map((ag) => (
                    <li key={ag.guestId} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                      <span>{ag.guestName || ag.guestId}</span>
                      <button type="button" onClick={() => unassignGuest(idx, ag)} className="text-sm text-red-700">{t("unassign")}</button>
                    </li>
                  ))}
                </ul>
                {table.assignedGuests.length < table.totalSeats && availableGuests.length > 0 && (
                  <select aria-label={t("assignGuest")} value="" onChange={(event) => assignGuest(idx, event.target.value)} className="w-full rounded border px-3 py-2 sm:max-w-md">
                    <option value="">{t("assignGuest")}</option>
                    {availableGuests.map((guest) => <option key={guest.id} value={guest.id}>{guest.name}</option>)}
                  </select>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <button onClick={saveTables} disabled={saving} className="px-4 py-2 rounded text-white" style={{ background: 'var(--color-sage)' }}>{saving ? t("saving") : t("save")}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
