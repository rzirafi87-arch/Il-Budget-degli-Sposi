"use client";

import ExportButton from "@/components/ExportButton";
import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import { getUserCountrySafe } from "@/constants/geo";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Trash2, Users, X } from "lucide-react";

const supabase = getBrowserClient();

type MenuPreference = "carne" | "pesce" | "baby" | "animazione" | "vegetariano" | "posto_tavolo";

type Guest = {
  id?: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  isMainContact: boolean;
  familyGroupId?: string;
  familyGroupName?: string;
  excludeFromFamilyTable: boolean;
  invitationDate: string;
  rsvpDeadline: string;
  rsvpReceived: boolean;
  attending: boolean;
  menuPreferences: MenuPreference[];
  receivesBomboniera: boolean;
  allergiesIntolerances: string;
  notes: string;
};

type FamilyGroup = {
  id?: string;
  familyName: string;
  mainContactGuestId?: string;
  notes: string;
};

type NonInvitedRecipient = {
  id?: string;
  name: string;
  receivesBomboniera: boolean;
  receivesConfetti: boolean;
  notes: string;
};

type Table = {
  totalSeats: number;
  assignedGuests: { id: string }[];
};

export default function InvitatiPage() {
  const t = useTranslations("guestsPage");
  const [activeTab, setActiveTab] = useState<"guests" | "tables">("guests");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [nonInvitedRecipients, setNonInvitedRecipients] = useState<NonInvitedRecipient[]>([]);
  const [defaultRsvpDeadline, setDefaultRsvpDeadline] = useState<string>("");
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const country = getUserCountrySafe();
  const locale = useLocale() || "it";

  // Table arrangement state
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    loadData();
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const res = await fetch("/api/my/tables");
      const json = await res.json();
      setTables((json.tables || []).map((t: Record<string, unknown>) => ({
        totalSeats: Number(t.totalSeats || 0),
        assignedGuests: (t.assignedGuests as string[]) || [],
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTables(false);
    }
  };

  const loadData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const res = await fetch("/api/my/guests", { headers });
      const json = await res.json();

      setGuests(json.guests || []);
      setFamilyGroups(json.familyGroups || []);
      setNonInvitedRecipients(json.nonInvitedRecipients || []);
      setDefaultRsvpDeadline(json.defaultRsvpDeadline || "");
    } catch (err) {
      console.error("Errore caricamento invitati:", err);
    } finally {
      setLoading(false);
    }
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        id: `temp-${Date.now()}`,
        name: "",
        guestType: "common",
        isMainContact: false,
        excludeFromFamilyTable: false,
        invitationDate: "",
        rsvpDeadline: defaultRsvpDeadline,
        rsvpReceived: false,
        attending: false,
        menuPreferences: [],
        receivesBomboniera: false,
        allergiesIntolerances: "",
        notes: "",
      },
    ]);
  };

  const updateGuest = (id: string | undefined, field: keyof Guest, value: string | boolean | string[]) => {
    if (!id) return;
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const updateGuestMultiple = (id: string | undefined, updates: Partial<Guest>) => {
    if (!id) return;
    setGuests(guests.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGuest = (id: string | undefined) => {
    if (!id) return;
    setGuests(guests.filter((g) => g.id !== id));
  };

  const createFamily = async () => {
    if (!newFamilyName.trim()) {
      setMessage(t("messages.familyNameRequired"));
      return;
    }
    const newFamily: FamilyGroup = {
      id: `temp-family-${Date.now()}`,
      familyName: newFamilyName,
      notes: "",
    };
    const updatedFamilies = [...familyGroups, newFamily];
    setFamilyGroups(updatedFamilies);
    setNewFamilyName("");
    setShowFamilyModal(false);
    setMessage(t("messages.familySaving"));

    // Salva automaticamente la nuova famiglia
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage(t("messages.authRequired"));
        return;
      }

      const res = await fetch("/api/my/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ guests, familyGroups: updatedFamilies, nonInvitedRecipients, defaultRsvpDeadline }),
      });

      if (!res.ok) {
        const json = await res.json();
        setMessage(t(`errors.${json.error || "FAMILY_SAVE_FAILED"}`));
      } else {
        setMessage(t("messages.familySaved"));
        setTimeout(() => setMessage(null), 3000);
        // Ricarica i dati per ottenere l'ID reale dal database
        await loadData();
      }
    } catch (err) {
      console.error("Errore salvataggio famiglia:", err);
      setMessage(t("errors.FAMILY_NETWORK_ERROR"));
    }
  };

  const updateFamilyName = (familyId: string | undefined, newName: string) => {
    if (!familyId) return;
    // Aggiorna il nome della famiglia
    setFamilyGroups(familyGroups.map(f => f.id === familyId ? { ...f, familyName: newName } : f));
    // Aggiorna anche il nome negli invitati associati
    setGuests(guests.map(g => g.familyGroupId === familyId ? { ...g, familyGroupName: newName } : g));
  };

  const deleteFamily = (familyId: string | undefined) => {
    if (!familyId) return;
    // Rimuovi il collegamento family_group_id dagli invitati
    setGuests(guests.map(g => g.familyGroupId === familyId ? { ...g, familyGroupId: undefined, familyGroupName: undefined } : g));
    setFamilyGroups(familyGroups.filter(f => f.id !== familyId));
  };

  const toggleMenuPreference = (id: string | undefined, pref: MenuPreference) => {
    if (!id) return;
    setGuests(
      guests.map((g) => {
        if (g.id !== id) return g;
        const prefs = g.menuPreferences.includes(pref)
          ? g.menuPreferences.filter((p) => p !== pref)
          : [...g.menuPreferences, pref];
        return { ...g, menuPreferences: prefs };
      })
    );
  };

  const addNonInvited = () => {
    setNonInvitedRecipients([
      ...nonInvitedRecipients,
      {
        id: `temp-ni-${Date.now()}`,
        name: "",
        receivesBomboniera: false,
        receivesConfetti: false,
        notes: "",
      },
    ]);
  };

  const updateNonInvited = (id: string | undefined, field: keyof NonInvitedRecipient, value: string | boolean) => {
    if (!id) return;
    setNonInvitedRecipients(nonInvitedRecipients.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const deleteNonInvited = (id: string | undefined) => {
    if (!id) return;
    setNonInvitedRecipients(nonInvitedRecipients.filter((r) => r.id !== id));
  };

  const saveData = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage(t("messages.authRequired"));
        setSaving(false);
        return;
      }

      const res = await fetch("/api/my/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ guests, familyGroups, nonInvitedRecipients, defaultRsvpDeadline }),
      });

      if (!res.ok) {
        const json = await res.json();
        setMessage(t(`errors.${json.error || "GUEST_SNAPSHOT_SAVE_FAILED"}`));
      } else {
        await loadData();
        setMessage(t("messages.guestsSaved"));
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setMessage(t("errors.GUEST_NETWORK_ERROR"));
    } finally {
      setSaving(false);
    }
  };

  const totalGuests = guests.filter((g) => g.attending).length;
  const totalByType = {
    bride: guests.filter((g) => g.guestType === "bride" && g.attending).length,
    groom: guests.filter((g) => g.guestType === "groom" && g.attending).length,
    common: guests.filter((g) => g.guestType === "common" && g.attending).length,
  };
  const totalBomboniere = guests.filter((g) => g.attending && g.receivesBomboniera).length;
  const totalAllergies = guests.filter((g) => g.attending && g.allergiesIntolerances.trim()).length;

  const menuCounts = {
    carne: guests.filter((g) => g.attending && g.menuPreferences.includes("carne")).length,
    pesce: guests.filter((g) => g.attending && g.menuPreferences.includes("pesce")).length,
    baby: guests.filter((g) => g.attending && g.menuPreferences.includes("baby")).length,
    animazione: guests.filter((g) => g.attending && g.menuPreferences.includes("animazione")).length,
    vegetariano: guests.filter((g) => g.attending && g.menuPreferences.includes("vegetariano")).length,
    posto_tavolo: guests.filter((g) => g.attending && g.menuPreferences.includes("posto_tavolo")).length,
  };

  if (loading) {
    return <LoadingState label={t("loading")} cards={4} />;
  }

  return (
    <section>
      <PageHeader
        eyebrow={t("header.eyebrow")}
        title={t("title")}
        description={t("header.description")}
        icon={<Users size={24} aria-hidden />}
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label={t("tabs.label")}>
        <button
          onClick={() => setActiveTab("guests")}
          className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition-colors ${activeTab === "guests" ? "bg-white text-fg shadow-soft-sm" : "text-muted-fg hover:text-fg"}`}
          role="tab"
          aria-selected={activeTab === "guests"}
        >
          {t("tabs.guests")}
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`flex-1 rounded-lg px-4 py-2.5 font-semibold transition-colors ${activeTab === "tables" ? "bg-white text-fg shadow-soft-sm" : "text-muted-fg hover:text-fg"}`}
          role="tab"
          aria-selected={activeTab === "tables"}
        >
          {t("tabs.tables")}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "guests" && renderGuestsTab()}
      {activeTab === "tables" && renderTablesTab()}
    </section>
  );

  function renderGuestsTab() {
    return (
      <>
        {/* Carosello immagini */}
        <ImageCarousel images={getPageImages("invitati", country)} height="280px" />

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      <PageInfoNote
        icon="👥"
        title={t("sections.guestsManagement")}
        description={t("info.description")}
        tips={[
          t("info.tips.families"), t("info.tips.separate"), t("info.tips.rsvp"),
          t("info.tips.menu"), t("info.tips.nonInvited")
        ]}
        eventTypeSpecific={{
          wedding: t("info.events.wedding"), baptism: t("info.events.baptism"),
          birthday: t("info.events.birthday"), graduation: t("info.events.graduation")
        }}
      />

      {/* Deadline RSVP Globale */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("rsvpDeadline")}
        </label>
        <input
          type="date"
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          value={defaultRsvpDeadline}
          onChange={(e) => setDefaultRsvpDeadline(e.target.value)}
        />
      </div>

      {/* Statistiche */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">{t("summary.title")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-gray-800 font-semibold">{t("guestTypes.bride")}</div>
            <div className="text-2xl font-bold text-pink-600">{totalByType.bride}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-gray-800 font-semibold">{t("guestTypes.groom")}</div>
            <div className="text-2xl font-bold text-blue-600">{totalByType.groom}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
            <div className="text-gray-800 font-semibold">{t("guestTypes.common")}</div>
            <div className="text-2xl font-bold text-gray-700">{totalByType.common}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-gray-800 font-semibold">{t("summary.attendees")}</div>
            <div className="text-2xl font-bold text-green-600">{totalGuests}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🥩 {t("menu.meat")}:</span>
            <span className="font-semibold">{menuCounts.carne}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🐟 {t("menu.fish")}:</span>
            <span className="font-semibold">{menuCounts.pesce}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>👶 {t("menu.child")}:</span>
            <span className="font-semibold">{menuCounts.baby}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🎪 {t("menu.entertainment")}:</span>
            <span className="font-semibold">{menuCounts.animazione}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🥗 {t("menu.vegetarian")}:</span>
            <span className="font-semibold">{menuCounts.vegetariano}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>💺 {t("menu.seat")}:</span>
            <span className="font-semibold">{menuCounts.posto_tavolo}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-800 font-semibold">🎁 {t("summary.favours")}:</span>
            <span className="font-bold text-purple-600">{totalBomboniere}</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-800 font-semibold">{t("summary.allergies")}:</span>
            <span className="font-bold text-amber-700">{totalAllergies}</span>
          </div>
        </div>
      </div>

      {/* Gestione Famiglie */}
      <div className="app-card app-card--md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">{t("sections.familyGroups")}</h3>
          <AppButton
            onClick={() => setShowFamilyModal(true)}
            size="sm"
          >
            <Plus size={17} aria-hidden /> {t("families.add")}
          </AppButton>
        </div>
  <p className="text-xs text-gray-600 mb-3">
          {t("families.helper")} <strong className="text-purple-700">💡 {t("families.tipLabel")}</strong> {t("families.tip")}
  </p>
        {familyGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-4">{t("families.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyGroups.map((family) => {
              const familyMembers = guests.filter(g => g.familyGroupId === family.id);
                const familyMembersIncluded = familyMembers.filter(g => !g.excludeFromFamilyTable);
                const familyMembersExcluded = familyMembers.filter(g => g.excludeFromFamilyTable);
              const mainContact = familyMembers.find(g => g.isMainContact);
              return (
                <div key={family.id} className="p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      className="font-bold text-gray-800 border-b-2 border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none bg-transparent flex-1 mr-2"
                      value={family.familyName}
                      onChange={(e) => updateFamilyName(family.id, e.target.value)}
                      placeholder={t("families.name")}
                    />
                    <button
                      onClick={() => deleteFamily(family.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      title={t("families.delete")}
                      aria-label={t("families.deleteNamed", {name: family.familyName})}
                    >
                      ?
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="mb-1">👤 {t("families.contact")}: {mainContact?.name || t("families.unassigned")}</div>
                      <div className="flex justify-between items-center">
                        <span>👥 {t("summary.total")}: {familyMembers.length}</span>
                        <span className="text-green-700">🪑 {t("families.familyTable")}: {familyMembersIncluded.length}</span>
                      </div>
                      {familyMembersExcluded.length > 0 && (
                        <div className="mt-1 text-orange-600">
                          🚫 {t("families.separateTable")}: {familyMembersExcluded.length} ({familyMembersExcluded.map(g => g.name).join(', ')})
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Aggiungi Famiglia */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" role="presentation">
          <div className="app-card app-card--lg max-h-[min(90vh,42rem)] w-full max-w-md overflow-y-auto shadow-soft-xl" role="dialog" aria-modal="true" aria-labelledby="family-modal-title">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 id="family-modal-title" className="font-bold text-xl text-gray-900">{t("families.createTitle")}</h3>
              <button type="button" className="app-button app-button--ghost app-button--icon" onClick={() => { setShowFamilyModal(false); setNewFamilyName(""); }} aria-label={t("actions.closeDialog")}>
                <X size={20} aria-hidden />
              </button>
            </div>
            <label htmlFor="new-family-name" className="block text-sm font-medium text-gray-700 mb-2">{t("families.name")}</label>
            <input
              type="text"
              className="app-input mb-4"
              id="new-family-name"
              placeholder={t("families.namePlaceholder")}
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
            <div className="flex gap-3">
              <AppButton
                onClick={createFamily}
                className="flex-1"
              >
                {t("families.create")}
              </AppButton>
              <AppButton
                onClick={() => { setShowFamilyModal(false); setNewFamilyName(""); }}
                variant="outline"
                className="flex-1"
              >
                {t("actions.cancel")}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Tabella Invitati */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-lg">{t("list.title")}</h3>
          <div className="flex gap-2">
            <ExportButton
              data={guests}
              filename="invitati"
              type="csv"
              className="text-sm"
            >
              ⬇️ {t("actions.exportCsv")}
            </ExportButton>
            <AppButton
              onClick={addGuest}
              size="sm"
            >
              <Plus size={17} aria-hidden /> {t("list.add")}
            </AppButton>
          </div>
        </div>

        <div className="app-table-shell">
          <table className="app-table text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2 text-left font-semibold text-gray-900">{t("columns.name")}</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">{t("columns.type")}</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">{t("columns.family")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.mainContact")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900 whitespace-nowrap" title={t("columns.separateHelp")}>🚫 {t("columns.separate")}</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">{t("columns.invitationDate")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.rsvpReceived")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.attending")}</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">{t("columns.menu")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.favour")}</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">{t("columns.allergies")}</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">{t("columns.notes")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {guests.length === 0 ? (
                <tr>
                    <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                    {t("list.empty")}
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={guest.name}
                        onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
                        placeholder={t("list.namePlaceholder")}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="border border-gray-200 rounded px-1 py-1 w-full text-xs"
                        value={guest.guestType}
                        onChange={(e) => updateGuest(guest.id, "guestType", e.target.value)}
                      >
                        <option value="common">{t("guestTypes.common")}</option>
                        <option value="bride">{t("guestTypes.bride")}</option>
                        <option value="groom">{t("guestTypes.groom")}</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="border border-gray-200 rounded px-1 py-1 w-full text-xs bg-white"
                        value={guest.familyGroupId || ""}
                        onChange={(e) => {
                          const familyId = e.target.value || undefined;
                          const family = familyGroups.find(f => f.id === familyId);
                          updateGuestMultiple(guest.id, {
                            familyGroupId: familyId,
                            familyGroupName: family?.familyName
                          });
                        }}
                      >
                        <option value="">{t("families.none")}</option>
                        {familyGroups.map(f => (
                          <option key={f.id} value={f.id}>{f.familyName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.isMainContact}
                        onChange={(e) => updateGuest(guest.id, "isMainContact", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.mainContact", {name: guest.name || t("list.guestFallback")})}
                      />
                    </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={guest.excludeFromFamilyTable}
                          onChange={(e) => updateGuest(guest.id, "excludeFromFamilyTable", e.target.checked)}
                          className="w-4 h-4"
                          disabled={!guest.familyGroupId}
                          title={guest.familyGroupId ? t("families.excludeGuest") : t("families.assignFirst")}
                          aria-label={t("fieldLabels.separateTable", {name: guest.name || t("list.guestFallback")})}
                        />
                      </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={guest.invitationDate}
                        onChange={(e) => updateGuest(guest.id, "invitationDate", e.target.value)}
                        aria-label={t("fieldLabels.invitationDate", {name: guest.name || t("list.guestFallback")})}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.rsvpReceived}
                        onChange={(e) => updateGuest(guest.id, "rsvpReceived", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.rsvp", {name: guest.name || t("list.guestFallback")})}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.attending}
                        onChange={(e) => updateGuest(guest.id, "attending", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.attending", {name: guest.name || t("list.guestFallback")})}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(["carne", "pesce", "baby", "animazione", "vegetariano", "posto_tavolo"] as MenuPreference[]).map((pref) => (
                          <button
                            key={pref}
                            onClick={() => toggleMenuPreference(guest.id, pref)}
                            className={`px-2 py-1 text-[10px] rounded ${
                              guest.menuPreferences.includes(pref)
                                ? "bg-[#A3B59D] text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                            aria-label={t(`menu.${pref}`)}
                            aria-pressed={guest.menuPreferences.includes(pref)}
                          >
                            {pref === "carne" && "🥩"}
                            {pref === "pesce" && "🐟"}
                            {pref === "baby" && "👶"}
                            {pref === "animazione" && "🎪"}
                            {pref === "vegetariano" && "🥗"}
                            {pref === "posto_tavolo" && "💺"}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.receivesBomboniera}
                        onChange={(e) => updateGuest(guest.id, "receivesBomboniera", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.favour", {name: guest.name || t("list.guestFallback")})}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="min-w-40 border border-gray-200 rounded px-2 py-2 w-full text-xs"
                        value={guest.allergiesIntolerances}
                        onChange={(e) => updateGuest(guest.id, "allergiesIntolerances", e.target.value)}
                        placeholder={t("list.allergiesPlaceholder")}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={guest.notes}
                        onChange={(e) => updateGuest(guest.id, "notes", e.target.value)}
                        placeholder={t("columns.notes")}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="app-button app-button--ghost app-button--icon text-red-600 hover:text-red-800"
                        title={t("actions.delete")}
                        aria-label={t("actions.deleteGuest", {name: guest.name || t("list.guestFallback")})}
                      >
                        <Trash2 size={17} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabella Non Invitati che ricevono bomboniere/confetti */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">{t("nonInvited.title")}</h3>
          <button
            onClick={addNonInvited}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
          >
            {t("nonInvited.add")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2 text-left font-semibold text-gray-900">{t("columns.name")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.favour")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("nonInvited.confetti")}</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">{t("columns.notes")}</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {nonInvitedRecipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t("nonInvited.empty")}
                  </td>
                </tr>
              ) : (
                nonInvitedRecipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={recipient.name}
                        onChange={(e) => updateNonInvited(recipient.id, "name", e.target.value)}
                        placeholder={t("columns.name")}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={recipient.receivesBomboniera}
                        onChange={(e) => updateNonInvited(recipient.id, "receivesBomboniera", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.favour", {name: recipient.name || t("nonInvited.personFallback")})}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={recipient.receivesConfetti}
                        onChange={(e) => updateNonInvited(recipient.id, "receivesConfetti", e.target.checked)}
                        className="w-4 h-4"
                        aria-label={t("fieldLabels.confetti", {name: recipient.name || t("nonInvited.personFallback")})}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={recipient.notes}
                        onChange={(e) => updateNonInvited(recipient.id, "notes", e.target.value)}
                        placeholder={t("columns.notes")}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteNonInvited(recipient.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                        title={t("actions.delete")}
                        aria-label={t("actions.deleteRecipient", {name: recipient.name || t("nonInvited.personFallback")})}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pulsante Salva */}
      <div className="flex justify-end">
        <button
          onClick={saveData}
          disabled={saving}
          className="px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] disabled:opacity-50 font-semibold"
        >
          {saving ? t("actions.saving") : t("actions.saveAll")}
        </button>
      </div>
    </>
  );
  }

  function renderTablesTab() {
    const totalTables = tables.length;
    const totalSeats = tables.reduce((sum, t) => sum + (t.totalSeats || 0), 0);
    const assignedSeats = tables.reduce((sum, t) => sum + (t.assignedGuests?.length || 0), 0);
    const availableSeats = totalSeats - assignedSeats;

    if (loadingTables) {
      return <p className="text-gray-500">{t("tables.loading")}</p>;
    }

    return (
      <>
        <div className="mb-6 p-5 sm:p-6 rounded-2xl border-3 border-gray-600 bg-linear-to-br from-gray-200 to-gray-300 shadow-xl">
          <h3 className="font-bold text-lg mb-4 text-gray-900">🪑 {t("tables.summary")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
            <div className="p-4 bg-white rounded-xl border-2 border-blue-500 shadow-md">
              <div className="text-gray-800 font-bold">{t("tables.totalTables")}</div>
              <div className="text-3xl font-bold text-blue-700">{totalTables}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-green-500 shadow-md">
              <div className="text-gray-800 font-bold">{t("tables.totalSeats")}</div>
              <div className="text-3xl font-bold text-green-700">{totalSeats}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-purple-500 shadow-md">
              <div className="text-gray-800 font-bold">{t("tables.assignedSeats")}</div>
              <div className="text-3xl font-bold text-purple-700">{assignedSeats}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-orange-500 shadow-md">
              <div className="text-gray-800 font-bold">{t("tables.availableSeats")}</div>
              <div className="text-3xl font-bold text-orange-700">{availableSeats}</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-300 bg-white/70">
          <p className="text-sm text-gray-600">
            {t("tables.description")}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {t("tables.advanced")}
          </p>
          <div className="mt-4">
            <Link href={`/${locale}/invitati/tavoli`} className="inline-block px-4 py-2 rounded-full text-white hover:opacity-90" style={{ background: 'var(--color-sage)' }}>
              {t("tables.open")}
            </Link>
          </div>
        </div>
      </>
    );
  }
}
