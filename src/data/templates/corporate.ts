export type CorporateCategory = { name: string; subs: string[] };

// Evento Aziendale – struttura completa per meeting, convention, team building, gala aziendali
export function getCorporateTemplate(_country: string): CorporateCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: CorporateCategory[] = [
    {
      name: "Pianificazione e Project Management",
      subs: [
        "Definizione obiettivi evento (team building, lancio prodotto, formazione, gala)",
        "Scelta data e durata evento (mezza giornata, giornata intera, multi-day)",
        "Brief iniziale con stakeholder aziendali",
        "Coordinamento con event planner o agenzia specializzata",
        "Timeline progetto e milestone",
        "Budget approval e gestione spese",
        "Assicurazione evento e coperture",
      ],
    },
    {
      name: "Location e Spazi",
      subs: [
        "Ricerca e selezione venue (hotel congress center, villa, spazio industriale, outdoor)",
        "Affitto sale meeting / plenaria / breakout rooms",
        "Sopralluogo location e verifica capienza",
        "Verifica accessibilità e parcheggi",
        "Servizi WiFi ad alta velocità",
        "Sala regia / back office organizzatori",
        "Aree lounge e networking",
      ],
    },
    {
      name: "Tecnologia e AV (Audio Video)",
      subs: [
        "Noleggio proiettori, schermi LED, maxischermi",
        "Impianto audio professionale e microfoni wireless",
        "Service luci intelligenti e scenografie",
        "Regia video live e streaming platform",
        "Videoconferenza ibrida (partecipanti online + fisici)",
        "App evento o piattaforma digitale per partecipanti",
        "Supporto tecnico on-site",
      ],
    },
    {
      name: "Catering e F&B",
      subs: [
        "Coffee break mattina e pomeriggio",
        "Pranzo aziendale (buffet, servizio al tavolo, box lunch)",
        "Aperitivo networking o cocktail serale",
        "Cena di gala (se evento multi-day o celebrativo)",
        "Open bar o beverage station",
        "Menù personalizzati (vegetariano, vegano, intolleranze)",
        "Servizio catering e personale sala",
      ],
    },
    {
      name: "Allestimento e Brand Identity",
      subs: [
        "Scenografia palco e backdrop brandizzati",
        "Rollup, totem, banner aziendali",
        "Desk registrazione e accredito ospiti",
        "Segnaletica direzionale e wayfinding",
        "Allestimento tavoli con branded kit",
        "Fiori e decorazioni eleganti corporate style",
        "Area photo opportunity con logo aziendale",
      ],
    },
    {
      name: "Speaker e Contenuti",
      subs: [
        "Ricerca e ingaggio speaker / relatori esterni",
        "Moderatore o conduttore professionista",
        "Preparazione presentazioni e slide deck",
        "Video istituzionali o spot aziendali",
        "Workshop facilitator o trainer",
        "Panel discussion o tavole rotonde",
        "Q&A e sessioni interattive",
      ],
    },
    {
      name: "Team Building e Intrattenimento",
      subs: [
        "Attività team building (outdoor, indoor, creative)",
        "Giochi aziendali e ice breaker",
        "Spettacolo serale (band live, DJ, artisti)",
        "Gala dinner con premiazioni",
        "Awards ceremony / riconoscimenti dipendenti",
        "Esperienze uniche (chef show, wine tasting, escape room aziendale)",
      ],
    },
    {
      name: "Comunicazione e Marketing",
      subs: [
        "Save the date digitale per partecipanti",
        "Inviti personalizzati e reminder",
        "Campagna email e comunicazione interna",
        "Social media strategy (hashtag, live posting)",
        "Ufficio stampa e comunicati",
        "Creazione landing page evento",
        "Post-evento recap e thank you",
      ],
    },
    {
      name: "Foto, Video e Documentazione",
      subs: [
        "Fotografo corporate per reportage evento",
        "Videomaker per aftermovie aziendale",
        "Riprese live streaming o webcast",
        "Drone per riprese aeree location",
        "Fotobooth brandizzato per ospiti",
        "Editing video e consegna materiali",
        "Galleria foto digitale condivisa",
      ],
    },
    {
      name: "Gadget e Materiali",
      subs: [
        "Welcome kit partecipanti (borsa, block notes, penna, USB)",
        "Gadget brandizzati (powerbank, bottiglie, t-shirt)",
        "Badge e lanyard personalizzati",
        "Cartelline e materiali stampati",
        "Omaggi o gift finali (vino, libri, prodotti aziendali)",
        "Packaging e confezionamento premium",
      ],
    },
    {
      name: "Logistica e Trasporti",
      subs: [
        "Trasferimenti aeroporto-hotel per ospiti VIP",
        "Navetta shuttle per partecipanti",
        "Noleggio bus o van aziendali",
        "Parcheggi riservati e valet service",
        "Coordinamento check-in hotel per ospiti fuori sede",
        "Transfer organizzati per attività team building",
      ],
    },
    {
      name: "Ospitalità e Pernottamenti",
      subs: [
        "Prenotazione blocco camere hotel",
        "Room list e rooming list",
        "Welcome desk hotel per partecipanti",
        "Colazioni e servizi in hotel",
        "Upgrade per speaker e VIP",
        "Check-out coordinato",
      ],
    },
    {
      name: "Sicurezza e Compliance",
      subs: [
        "Servizio sicurezza e vigilanza evento",
        "Gestione accrediti e badge elettronici",
        "Privacy policy e GDPR compliance",
        "Assicurazione RC organizzatore",
        "Permessi e autorizzazioni (se evento pubblico)",
        "Servizio medico o primo soccorso",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget totale approvato",
        "Acconti fornitori e service provider",
        "Spese impreviste e contingency",
        "Saldi finali post-evento",
        "Report finanziario e ROI evento",
        "Riepilogo finale costi",
      ],
    },
  ];
  return base;
}

// Budget percentuali per categoria
export function getCorporateBudgetPercentages(): Record<string, number> {
  return {
    "Pianificazione e Project Management": 8,
    "Location e Spazi": 18,
    "Tecnologia e AV (Audio Video)": 15,
    "Catering e F&B": 20,
    "Allestimento e Brand Identity": 10,
    "Speaker e Contenuti": 8,
    "Team Building e Intrattenimento": 7,
    "Comunicazione e Marketing": 3,
    "Foto, Video e Documentazione": 5,
    "Gadget e Materiali": 3,
    "Logistica e Trasporti": 2,
    "Ospitalità e Pernottamenti": 0, // Spesso coperto separatamente
    "Sicurezza e Compliance": 1,
    "Gestione Budget": 0,
  };
}

// Timeline per evento aziendale
export type TimelinePhase = {
  phase: string;
  title?: string;
  months_before?: number;
  days_before?: number;
  tasks: string[];
};

export function getCorporateTimeline(): TimelinePhase[] {
  return [
    {
      phase: "4-6 MESI PRIMA",
      title: "Ideazione e Approvazione",
      months_before: 5,
      tasks: [
        "Definisci obiettivi evento con management",
        "Stabilisci budget e approval interno",
        "Seleziona data evitando conflitti aziendali",
        "Identifica target partecipanti (n° persone, ruoli)",
        "Decidi format evento (convention, team building, gala)",
        "Ingaggia event planner o agenzia (se necessario)",
      ],
    },
    {
      phase: "3 MESI PRIMA",
      title: "Prenotazioni e Fornitori Principali",
      months_before: 3,
      tasks: [
        "Prenota location definitiva",
        "Conferma service AV e tecnologia",
        "Ingaggia speaker o relatori esterni",
        "Prenota catering e F&B",
        "Blocca camere hotel per ospiti",
        "Definisci concept scenografico e branding",
        "Avvia comunicazione interna save-the-date",
      ],
    },
    {
      phase: "2 MESI PRIMA",
      title: "Contenuti e Dettagli Operativi",
      months_before: 2,
      tasks: [
        "Finalizza agenda evento e timing sessioni",
        "Prepara slide e contenuti presentazioni",
        "Ordina gadget e materiali brandizzati",
        "Conferma attività team building o entertainment",
        "Invia inviti formali e gestisci RSVP",
        "Coordina trasporti e logistica",
        "Pianifica riprese foto/video",
      ],
    },
    {
      phase: "1 MESE PRIMA",
      title: "Rifinitura e Coordinamento",
      months_before: 1,
      tasks: [
        "Sopralluogo finale location con tutti i fornitori",
        "Verifica setup tecnico (audio, luci, video)",
        "Prepara badge e welcome kit partecipanti",
        "Riconferma menù catering e intolleranze",
        "Testa piattaforma streaming (se evento ibrido)",
        "Stampa materiali e segnaletica",
        "Brief finale con tutto lo staff",
      ],
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Countdown Finale",
      days_before: 7,
      tasks: [
        "Riconferma tutti i fornitori (orari, numeri, contatti)",
        "Invia reminder finale a partecipanti",
        "Prepara run of show dettagliato minuto per minuto",
        "Versa saldi acconti rimanenti",
        "Organizza prove tecniche e soundcheck",
        "Prepara emergency kit e piano B",
      ],
    },
    {
      phase: "GIORNO EVENTO",
      title: "Execution Day 🎯",
      days_before: 0,
      tasks: [
        "Setup location ore mattina presto",
        "Test finale audio, video, luci",
        "Accredito partecipanti e welcome desk",
        "Esecuzione programma secondo run of show",
        "Gestione imprevisti real-time",
        "Networking e socializzazione guidata",
        "Chiusura evento e ringraziamenti",
        "Smontaggio e check-out location",
      ],
    },
    {
      phase: "POST-EVENTO",
      title: "Follow-up e Reportistica",
      days_before: -7,
      tasks: [
        "Raccogli feedback partecipanti (survey)",
        "Ricevi foto e video finali da professionisti",
        "Crea aftermovie o recap video",
        "Invia thank you note a speaker e VIP",
        "Chiudi budget e report finanziario",
        "Condividi galleria foto con partecipanti",
        "Report ROI e KPI evento per management",
      ],
    },
  ];
}

// Campi personalizzati per evento aziendale
export type EventField = {
  name: string;
  type: "text" | "select" | "number" | "date";
  options?: string[];
  label: string;
  placeholder?: string;
};

export function getCorporateFields(): EventField[] {
  return [
    {
      name: "event_format",
      type: "select",
      label: "Formato Evento",
      options: [
        "Convention aziendale",
        "Team building",
        "Lancio prodotto",
        "Gala / Awards ceremony",
        "Formazione / Training",
        "Kick-off sales",
        "Meeting strategico",
        "Celebrazione milestone aziendale",
      ],
    },
    {
      name: "participants_count",
      type: "number",
      label: "Numero Partecipanti",
      placeholder: "es. 150",
    },
    {
      name: "event_duration",
      type: "select",
      label: "Durata Evento",
      options: [
        "Mezza giornata",
        "Giornata intera",
        "2 giorni",
        "3+ giorni (convention)",
      ],
    },
    {
      name: "hybrid_mode",
      type: "select",
      label: "Modalità",
      options: [
        "Solo presenza fisica",
        "Ibrido (fisico + online)",
        "Solo virtuale",
      ],
    },
    {
      name: "catering_type",
      type: "select",
      label: "Tipo Catering",
      options: [
        "Solo coffee break",
        "Coffee break + pranzo",
        "Full day (colazione + pranzo + aperitivo)",
        "Con cena di gala",
      ],
    },
    {
      name: "budget_range",
      type: "select",
      label: "Range Budget",
      options: [
        "< €10.000",
        "€10.000 - €25.000",
        "€25.000 - €50.000",
        "€50.000 - €100.000",
        "> €100.000",
      ],
    },
  ];
}

// Suggerimenti fornitori
export type VendorSuggestion = {
  category: string;
  suggestions: string[];
};

export function getCorporateVendorSuggestions(): VendorSuggestion[] {
  return [
    {
      category: "Event Planner Aziendali",
      suggestions: [
        "Agenzie specializzate in eventi corporate (Communica, Filmmaster Events)",
        "PCO (Professional Conference Organizer)",
        "Event manager freelance con portfolio corporate",
        "Team building companies (Evotre, Gymland)",
      ],
    },
    {
      category: "Location Corporate",
      suggestions: [
        "Hotel congress center (Hilton, Marriott, Sheraton)",
        "Convention center (MiCo Milano, Fiera Roma)",
        "Ville storiche o dimore d'epoca",
        "Spazi industriali riconvertiti (ex fabbriche, loft)",
        "Location outdoor per team building (agriturismi, resort)",
      ],
    },
    {
      category: "Tecnologia AV",
      suggestions: [
        "Service audio/video professionali (Agorà, AV Set)",
        "Streaming platform (Zoom Events, Hopin, Teams Live)",
        "App evento (EventMobi, Whova, Eventbrite)",
        "Noleggio attrezzature (schermi LED, proiettori 4K)",
      ],
    },
    {
      category: "Catering Corporate",
      suggestions: [
        "Catering aziendali certificati (Cateringpoint, Bon Wei)",
        "Chef show o cooking experience",
        "Food truck per eventi outdoor",
        "Servizio luxury catering per gala",
      ],
    },
    {
      category: "Speaker e Formatori",
      suggestions: [
        "Speaker bureau (Speaker's Corner, Speakers Academy)",
        "Motivational speaker e coach aziendali",
        "Facilitatori workshop e team building",
        "Moderatori professionisti per convention",
      ],
    },
  ];
}
