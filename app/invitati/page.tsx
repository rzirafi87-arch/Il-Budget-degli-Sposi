"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";
import ExportButton from "@/components/ExportButton";

const supabase = getBrowserClient();

type MenuPreference = "carne" | "pesce" | "baby" | "animazione" | "vegetariano" | "posto_tavolo";

type Guest = {
  id?: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  isMainContact: boolean;
  familyGroupId?: string;
  familyGroupName?: string;
  invitationDate: string;
  rsvpDeadline: string;
  rsvpReceived: boolean;
  attending: boolean;
  menuPreferences: MenuPreference[];
  receivesBomboniera: boolean;
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

export default function InvitatiPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [nonInvitedRecipients, setNonInvitedRecipients] = useState<NonInvitedRecipient[]>([]);
  const [defaultRsvpDeadline, setDefaultRsvpDeadline] = useState<string>("");
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
        invitationDate: "",
        rsvpDeadline: defaultRsvpDeadline,
        rsvpReceived: false,
        attending: false,
        menuPreferences: [],
        receivesBomboniera: false,
        notes: "",
      },
    ]);
  };

  const updateGuest = (id: string | undefined, field: keyof Guest, value: any) => {
    if (!id) return;
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const deleteGuest = (id: string | undefined) => {
    if (!id) return;
    setGuests(guests.filter((g) => g.id !== id));
  };

  const createFamily = () => {
    if (!newFamilyName.trim()) {
      setMessage("❌ Inserisci un nome per la famiglia");
      return;
    }
    const newFamily: FamilyGroup = {
      id: `temp-family-${Date.now()}`,
      familyName: newFamilyName,
      notes: "",
    };
    setFamilyGroups([...familyGroups, newFamily]);
    setNewFamilyName("");
    setShowFamilyModal(false);
    setMessage("✅ Famiglia creata! Ora assegna gli invitati alla famiglia.");
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

  const updateNonInvited = (id: string | undefined, field: keyof NonInvitedRecipient, value: any) => {
    if (!id) return;
    setNonInvitedRecipients(nonInvitedRecipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
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
        setMessage("❌ Devi essere autenticato per salvare. Clicca su 'Registrati' in alto.");
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
        setMessage(`❌ Errore: ${json.error || "Impossibile salvare"}`);
      } else {
        setMessage("✅ Invitati salvati con successo!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setMessage("❌ Errore di rete");
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

  const menuCounts = {
    carne: guests.filter((g) => g.attending && g.menuPreferences.includes("carne")).length,
    pesce: guests.filter((g) => g.attending && g.menuPreferences.includes("pesce")).length,
    baby: guests.filter((g) => g.attending && g.menuPreferences.includes("baby")).length,
    animazione: guests.filter((g) => g.attending && g.menuPreferences.includes("animazione")).length,
    vegetariano: guests.filter((g) => g.attending && g.menuPreferences.includes("vegetariano")).length,
    posto_tavolo: guests.filter((g) => g.attending && g.menuPreferences.includes("posto_tavolo")).length,
  };

  if (loading) {
    return (
      <section className="pt-6">
        <h2 className="font-serif text-3xl mb-6">Invitati</h2>
        <p className="text-gray-500">Caricamento...</p>
      </section>
    );
  }

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Gestione Invitati</h2>

      {/* Carosello immagini */}
      <ImageCarousel images={PAGE_IMAGES.invitati} height="280px" />

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">{message}</div>
      )}

      {/* Deadline RSVP Globale */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data massima per la risposta (RSVP) - Uguale per tutti
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
        <h3 className="font-semibold text-lg mb-4">Riepilogo Partecipanti</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-gray-600">Sposa</div>
            <div className="text-2xl font-bold text-pink-600">{totalByType.bride}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-gray-600">Sposo</div>
            <div className="text-2xl font-bold text-blue-600">{totalByType.groom}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
            <div className="text-gray-600">Comuni</div>
            <div className="text-2xl font-bold text-gray-700">{totalByType.common}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-gray-600">Totale partecipanti</div>
            <div className="text-2xl font-bold text-green-600">{totalGuests}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🍖 Carne:</span>
            <span className="font-semibold">{menuCounts.carne}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🐟 Pesce:</span>
            <span className="font-semibold">{menuCounts.pesce}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>👶 Baby:</span>
            <span className="font-semibold">{menuCounts.baby}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🎪 Animazione:</span>
            <span className="font-semibold">{menuCounts.animazione}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🥗 Vegetariano:</span>
            <span className="font-semibold">{menuCounts.vegetariano}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>🪑 Posto tavolo:</span>
            <span className="font-semibold">{menuCounts.posto_tavolo}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">🎁 Bomboniere necessarie:</span>
            <span className="font-bold text-purple-600">{totalBomboniere}</span>
          </div>
        </div>
      </div>

      {/* Gestione Famiglie */}
      <div className="mb-6 p-6 rounded-2xl border-3 border-purple-600 bg-purple-50/70 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">👨‍👩‍👧‍👦 Gruppi Famiglia</h3>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold shadow-md"
          >
            + Aggiungi Famiglia
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Crea gruppi famiglia per organizzare meglio gli invitati. Il contatto principale rappresenta tutta la famiglia.
        </p>
        {familyGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Nessuna famiglia creata. Clicca "Aggiungi Famiglia" per iniziare.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyGroups.map((family) => {
              const familyMembers = guests.filter(g => g.familyGroupId === family.id);
              const mainContact = familyMembers.find(g => g.isMainContact);
              return (
                <div key={family.id} className="p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{family.familyName}</h4>
                    <button
                      onClick={() => deleteFamily(family.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="mb-1">👤 Contatto: {mainContact?.name || "Non assegnato"}</div>
                    <div>👥 Membri: {familyMembers.length}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Aggiungi Famiglia */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-gray-900">Crea Nuovo Gruppo Famiglia</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Famiglia</label>
            <input
              type="text"
              className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
              placeholder="es. Famiglia Rossi"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={createFamily}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
              >
                Crea Famiglia
              </button>
              <button
                onClick={() => { setShowFamilyModal(false); setNewFamilyName(""); }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabella Invitati */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-lg">Lista Invitati</h3>
          <div className="flex gap-2">
            <ExportButton
              data={guests}
              filename="invitati"
              type="csv"
              className="text-sm"
            >
              📥 Esporta CSV
            </ExportButton>
            <button
              onClick={addGuest}
              className="px-4 py-2 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8fa085] text-sm font-semibold"
            >
              + Aggiungi Invitato
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
                <th className="px-2 py-2 text-left font-medium text-gray-700">Tipo</th>
                <th className="px-2 py-2 text-left font-medium text-gray-700">Famiglia</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Contatto principale</th>
                <th className="px-2 py-2 text-left font-medium text-gray-700">Data invito</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Risposta ricevuta</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Partecipa</th>
                <th className="px-2 py-2 text-left font-medium text-gray-700">Preferenze menu</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Bomboniera</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Note</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                    Nessun invitato ancora. Clicca su "Aggiungi Invitato" per iniziare.
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
                        placeholder="Nome completo"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="border border-gray-200 rounded px-1 py-1 w-full text-xs"
                        value={guest.guestType}
                        onChange={(e) => updateGuest(guest.id, "guestType", e.target.value)}
                      >
                        <option value="common">Comune</option>
                        <option value="bride">Sposa</option>
                        <option value="groom">Sposo</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="border border-gray-200 rounded px-1 py-1 w-full text-xs"
                        value={guest.familyGroupId || ""}
                        onChange={(e) => {
                          const familyId = e.target.value || undefined;
                          const familyName = familyGroups.find(f => f.id === familyId)?.familyName;
                          updateGuest(guest.id, "familyGroupId", familyId);
                          updateGuest(guest.id, "familyGroupName", familyName);
                        }}
                      >
                        <option value="">-- Nessuna --</option>
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
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={guest.invitationDate}
                        onChange={(e) => updateGuest(guest.id, "invitationDate", e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.rsvpReceived}
                        onChange={(e) => updateGuest(guest.id, "rsvpReceived", e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={guest.attending}
                        onChange={(e) => updateGuest(guest.id, "attending", e.target.checked)}
                        className="w-4 h-4"
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
                          >
                            {pref === "carne" && "🍖"}
                            {pref === "pesce" && "🐟"}
                            {pref === "baby" && "👶"}
                            {pref === "animazione" && "🎪"}
                            {pref === "vegetariano" && "🥗"}
                            {pref === "posto_tavolo" && "🪑"}
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
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={guest.notes}
                        onChange={(e) => updateGuest(guest.id, "notes", e.target.value)}
                        placeholder="Note..."
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                        title="Elimina"
                      >
                        ✕
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
          <h3 className="font-semibold text-lg">Bomboniere / Confetti per Non Invitati</h3>
          <button
            onClick={addNonInvited}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
          >
            + Aggiungi Persona
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Bomboniera</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Confetti</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Note</th>
                <th className="px-2 py-2 text-center font-medium text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {nonInvitedRecipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nessuna persona non invitata che riceve bomboniere/confetti.
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
                        placeholder="Nome"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={recipient.receivesBomboniera}
                        onChange={(e) => updateNonInvited(recipient.id, "receivesBomboniera", e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={recipient.receivesConfetti}
                        onChange={(e) => updateNonInvited(recipient.id, "receivesConfetti", e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="border border-gray-200 rounded px-2 py-1 w-full text-xs"
                        value={recipient.notes}
                        onChange={(e) => updateNonInvited(recipient.id, "notes", e.target.value)}
                        placeholder="Note..."
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => deleteNonInvited(recipient.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                        title="Elimina"
                      >
                        ✕
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
          {saving ? "Salvataggio..." : "💾 Salva tutto"}
        </button>
      </div>
    </section>
  );
}
