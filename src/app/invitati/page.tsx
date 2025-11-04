"use client";

import ExportButton from "@/components/ExportButton";
import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import { getUserCountrySafe } from "@/constants/geo";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";

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
      setMessage("? Inserisci un nome per la famiglia");
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
    setMessage("? Famiglia creata! Salvataggio in corso...");

    // Salva automaticamente la nuova famiglia
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage("? Devi essere autenticato per salvare. Clicca su 'Registrati' in alto.");
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
        setMessage(`? Errore salvataggio famiglia: ${json.error || "Impossibile salvare"}`);
      } else {
        setMessage("? Famiglia creata e salvata! Ora puoi assegnare gli invitati.");
        setTimeout(() => setMessage(null), 3000);
        // Ricarica i dati per ottenere l'ID reale dal database
        await loadData();
      }
    } catch (err) {
      console.error("Errore salvataggio famiglia:", err);
      setMessage("? Errore di rete durante il salvataggio della famiglia");
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
        setMessage("? Devi essere autenticato per salvare. Clicca su 'Registrati' in alto.");
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
        setMessage(`? Errore: ${json.error || "Impossibile salvare"}`);
      } else {
        setMessage("? Invitati salvati con successo!");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore salvataggio:", err);
  setMessage("? Errore di rete");
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
      <h2 className="font-serif text-3xl mb-2">Gestione Invitati</h2>
      <p className="text-gray-900 mb-6 text-sm sm:text-base leading-relaxed font-semibold">
        Organizza la lista degli invitati, gestisci le famiglie, traccia le risposte RSVP e pianifica la disposizione dei tavoli.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("guests")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "guests"
              ? "text-white border-b-4 rounded-t-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
          }`}
          style={activeTab === "guests" ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          ?? Invitati
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "tables"
              ? "text-white border-b-4 rounded-t-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"
          }`}
          style={activeTab === "tables" ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          ?? Tavoli
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
        icon="??"
        title="Gestione Completa degli Invitati"
        description="In questa pagina puoi creare e gestire la lista completa degli invitati. Organizza le persone per gruppi familiari, traccia le conferme RSVP, registra le preferenze del menù, e gestisci l'assegnazione ai tavoli. Puoi anche tracciare chi riceve bomboniere anche senza essere invitato al ricevimento."
        tips={[
          "Crea gruppi familiari per organizzare gli invitati e assegnarli automaticamente allo stesso tavolo",
          "Usa il flag 'Escludi da tavolo famiglia' per separare alcuni membri (es. cugini vs genitori)",
          "Traccia le conferme RSVP per sapere quanti parteciperanno realmente",
          "Registra le preferenze del menù (carne, pesce, vegetariano, baby) per comunicarle al catering",
          "La sezione 'Non Invitati' serve per chi riceve solo bomboniera/confetti senza partecipare"
        ]}
        eventTypeSpecific={{
          wedding: "Per il matrimonio, gestisci invitati della sposa, dello sposo e comuni. Organizza per famiglie e assegna i tavoli in modo strategico per creare un'atmosfera piacevole.",
          baptism: "Per il battesimo, traccia padrino, madrina, familiari e amici. La lista è generalmente più piccola e familiare.",
          birthday: "Per il compleanno, organizza gli invitati per gruppi (famiglia, amici, colleghi) per una migliore gestione.",
          graduation: "Per la laurea, invita familiari, amici e compagni di studi. Traccia le conferme per organizzare il buffet o il pranzo."
        }}
      />

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
            <div className="text-gray-800 font-semibold">Sposa</div>
            <div className="text-2xl font-bold text-pink-600">{totalByType.bride}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-gray-800 font-semibold">Sposo</div>
            <div className="text-2xl font-bold text-blue-600">{totalByType.groom}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
            <div className="text-gray-800 font-semibold">Comuni</div>
            <div className="text-2xl font-bold text-gray-700">{totalByType.common}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-gray-800 font-semibold">Totale partecipanti</div>
            <div className="text-2xl font-bold text-green-600">{totalGuests}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Carne:</span>
            <span className="font-semibold">{menuCounts.carne}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Pesce:</span>
            <span className="font-semibold">{menuCounts.pesce}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Baby:</span>
            <span className="font-semibold">{menuCounts.baby}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Animazione:</span>
            <span className="font-semibold">{menuCounts.animazione}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Vegetariano:</span>
            <span className="font-semibold">{menuCounts.vegetariano}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span>?? Posto tavolo:</span>
            <span className="font-semibold">{menuCounts.posto_tavolo}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-800 font-semibold">?? Bomboniere necessarie:</span>
            <span className="font-bold text-purple-600">{totalBomboniere}</span>
          </div>
        </div>
      </div>

      {/* Gestione Famiglie */}
      <div className="mb-6 p-6 rounded-2xl border-3 border-purple-600 bg-purple-50/70 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">??????????? Gruppi Famiglia</h3>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold shadow-md"
          >
            + Aggiungi Famiglia
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-3">
         Crea gruppi famiglia per organizzare meglio gli invitati. Il contatto principale rappresenta tutta la famiglia. 
         <strong className="text-purple-700">?? Suggerimento:</strong> Usa la colonna &quot;?? Tavolo separato&quot; per escludere alcuni membri (es. cugini) dall&apos;assegnazione automatica al tavolo famiglia.
        </p>
        {familyGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Nessuna famiglia creata. Clicca &quot;Aggiungi Famiglia&quot; per iniziare.</div>
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
                      placeholder="Nome famiglia"
                    />
                    <button
                      onClick={() => deleteFamily(family.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                      title="Elimina famiglia"
                    >
                      ?
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="mb-1">?? Contatto: {mainContact?.name || "Non assegnato"}</div>
                      <div className="flex justify-between items-center">
                        <span>?? Totale: {familyMembers.length}</span>
                        <span className="text-green-700">? Tavolo famiglia: {familyMembersIncluded.length}</span>
                      </div>
                      {familyMembersExcluded.length > 0 && (
                        <div className="mt-1 text-orange-600">
                          ?? Tavolo separato: {familyMembersExcluded.length} ({familyMembersExcluded.map(g => g.name).join(', ')})
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
              ?? Esporta CSV
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
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Nome</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">Tipo</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">Famiglia</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Contatto principale</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-900 whitespace-nowrap" title="Escludi dall'assegnazione automatica al tavolo famiglia">?? Tavolo separato</th>
                  <th className="px-2 py-2 text-left font-semibold text-gray-900">Data invito</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Risposta ricevuta</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Partecipa</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-900">Preferenze menu</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Bomboniera</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Note</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {guests.length === 0 ? (
                <tr>
                    <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                    Nessun invitato ancora. Clicca su &quot;Aggiungi Invitato&quot; per iniziare.
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
                        className="border border-gray-200 rounded px-1 py-1 w-full text-xs bg-white"
                        value={guest.familyGroupId || ""}
                        onChange={(e) => {
                          const familyId = e.target.value || undefined;
                          const family = familyGroups.find(f => f.id === familyId);
                          console.log("Famiglia selezionata - ID:", familyId, "Nome:", family?.familyName);
                          console.log("Famiglie disponibili:", familyGroups);
                          
                          updateGuestMultiple(guest.id, {
                            familyGroupId: familyId,
                            familyGroupName: family?.familyName
                          });
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
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={guest.excludeFromFamilyTable}
                          onChange={(e) => updateGuest(guest.id, "excludeFromFamilyTable", e.target.checked)}
                          className="w-4 h-4"
                          disabled={!guest.familyGroupId}
                          title={guest.familyGroupId ? "Escludi questo invitato dal tavolo famiglia (es. per cugini)" : "Assegna prima a una famiglia"}
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
                            {pref === "carne" && "??"}
                            {pref === "pesce" && "??"}
                            {pref === "baby" && "??"}
                            {pref === "animazione" && "??"}
                            {pref === "vegetariano" && "??"}
                            {pref === "posto_tavolo" && "??"}
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
                        ?
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
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Nome</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Bomboniera</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Confetti</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900">Note</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-900">Azioni</th>
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
                        ?
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
          {saving ? "Salvataggio..." : "?? Salva tutto"}
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
      return <p className="text-gray-500">Caricamento tavoli...</p>;
    }

    return (
      <>
        <div className="mb-6 p-5 sm:p-6 rounded-2xl border-3 border-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl">
          <h3 className="font-bold text-lg mb-4 text-gray-900">?? Riepilogo Tavoli</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
            <div className="p-4 bg-white rounded-xl border-2 border-blue-500 shadow-md">
              <div className="text-gray-800 font-bold">Tavoli Totali</div>
              <div className="text-3xl font-bold text-blue-700">{totalTables}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-green-500 shadow-md">
              <div className="text-gray-800 font-bold">Posti Totali</div>
              <div className="text-3xl font-bold text-green-700">{totalSeats}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-purple-500 shadow-md">
              <div className="text-gray-800 font-bold">Posti Assegnati</div>
              <div className="text-3xl font-bold text-purple-700">{assignedSeats}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-orange-500 shadow-md">
              <div className="text-gray-800 font-bold">Posti Liberi</div>
              <div className="text-3xl font-bold text-orange-700">{availableSeats}</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-300 bg-white/70">
          <p className="text-sm text-gray-600">
            La gestione dettagliata della disposizione dei tavoli è disponibile tramite l&apos;API <code className="bg-gray-100 px-2 py-1 rounded">/api/my/tables</code>.
            Qui puoi vedere il riepilogo dei tavoli configurati e dei posti assegnati.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Per una gestione avanzata della disposizione, considera di implementare un&apos;interfaccia drag-and-drop dedicata.
          </p>
          <div className="mt-4">
            <a href="/invitati/tavoli" className="inline-block px-4 py-2 rounded-full text-white hover:opacity-90" style={{ background: 'var(--color-sage)' }}>
              Apri pagina Tavoli
            </a>
          </div>
        </div>
      </>
    );
  }
}




