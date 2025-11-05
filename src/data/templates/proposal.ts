export type ProposalCategory = { name: string; subs: string[] };

// Proposta di Matrimonio – struttura completa per pianificare la richiesta di matrimonio perfetta
export function getProposalTemplate(_country: string): ProposalCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: ProposalCategory[] = [
    {
      name: "Pianificazione e Concept",
      subs: [
        "Scelta della data ideale",
        "Location scouting (ristorante, spiaggia, montagna, casa, viaggio)",
        "Tema o stile della proposta (romantico, avventuroso, intimo, pubblico)",
        "Piano B in caso di maltempo",
        "Ricerca fotografo professionista",
        "Coordinamento con eventuali complici (amici, famiglia)",
      ],
    },
    {
      name: "Anello di Fidanzamento",
      subs: [
        "Ricerca gioielliere o brand",
        "Scelta modello anello (solitario, trilogy, vintage, personalizzato)",
        "Acquisto o ordine anello",
        "Incisione personalizzata (se prevista)",
        "Assicurazione anello",
        "Custodia o scatola elegante",
      ],
    },
    {
      name: "Location e Allestimento",
      subs: [
        "Prenotazione location privata o pubblica",
        "Decorazioni floreali (petali, bouquet, arco di fiori)",
        "Candele, luci LED, lanterne o luminarie",
        "Tappeto o cuscini per inginocchiarsi",
        "Scritta luminosa 'Marry Me' o simili",
        "Palloncini o altri elementi decorativi",
        "Servizio di allestimento professionale",
      ],
    },
    {
      name: "Cena o Celebrazione",
      subs: [
        "Prenotazione ristorante o chef privato",
        "Menù degustazione o cena romantica",
        "Champagne o vino pregiato per brindisi",
        "Torta o dolce celebrativo",
        "Servizio catering se location privata",
        "Sorpresa post-proposta (cena con famiglia/amici)",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo per catturare il momento",
        "Videomaker per video cinematografico",
        "Drone per riprese aeree (se location outdoor)",
        "Album fotografico o libro ricordo",
        "Editing foto e video professionale",
        "Stampa foto incorniciate",
      ],
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "Musicista dal vivo (violino, chitarra, cantante)",
        "Playlist romantica personalizzata",
        "Impianto audio per diffondere musica",
        "Sorpresa musicale (flash mob, coro, serenata)",
        "DJ per festa post-proposta",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto di lusso o vintage per spostamenti",
        "Autista privato",
        "Elicottero o mongolfiera (se proposta speciale)",
        "Trasferimenti aeroporto (se proposta in viaggio)",
        "Parcheggio riservato",
        "Coordinamento orari con tutti i fornitori",
      ],
    },
    {
      name: "Sorprese e Extra",
      subs: [
        "Lettera d'amore personalizzata",
        "Video montaggio 'La nostra storia'",
        "Regalo simbolico (oltre all'anello)",
        "Messaggi da amici e parenti registrati",
        "Scatola con ricordi della relazione",
        "Fuochi d'artificio o stelle filanti",
        "Proiezione su schermo o parete",
      ],
    },
    {
      name: "Outfit e Beauty",
      subs: [
        "Outfit per chi propone (abito elegante o casual chic)",
        "Outfit per il/la partner (coordinato o sorpresa)",
        "Parrucchiere e makeup artist (se previsto)",
        "Accessori (cravatta, scarpe, gioielli)",
        "Manicure/pedicure pre-evento",
      ],
    },
    {
      name: "Comunicazione e Condivisione",
      subs: [
        "Annuncio sui social media (foto/video)",
        "Biglietti d'invito per festa post-proposta",
        "Grafica personalizzata per annuncio",
        "Chiamate a famiglia e amici per comunicare la notizia",
        "Save the date per futuro matrimonio (opzionale)",
        "Album digitale condiviso con ospiti",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget totale stimato",
        "Acconti fornitori",
        "Spese extra impreviste",
        "Saldi finali",
        "Fondo emergenze",
        "Riepilogo finale spese",
      ],
    },
  ];
  return base;
}

// Budget percentuali per categoria
export function getProposalBudgetPercentages(): Record<string, number> {
  return {
    "Pianificazione e Concept": 5,
    "Anello di Fidanzamento": 50, // Voce più importante
    "Location e Allestimento": 12,
    "Cena o Celebrazione": 10,
    "Foto e Video": 15,
    "Musica e Intrattenimento": 3,
    "Trasporti e Logistica": 2,
    "Sorprese e Extra": 2,
    "Outfit e Beauty": 1,
    "Comunicazione e Condivisione": 0,
    "Gestione Budget": 0,
  };
}

// Timeline per pianificare la proposta
export type TimelinePhase = {
  phase: string;
  title?: string;
  months_before?: number;
  days_before?: number;
  tasks: string[];
};

export function getProposalTimeline(): TimelinePhase[] {
  return [
    {
      phase: "3-6 MESI PRIMA",
      title: "Idea e Pianificazione Iniziale",
      months_before: 4.5,
      tasks: [
        "Decidi stile e concept della proposta",
        "Stabilisci budget totale disponibile",
        "Inizia ricerca anello (visite gioiellerie, online)",
        "Raccogli idee su Pinterest/Instagram per ispirazione",
        "Individua location potenziali",
        "Sonda preferenze partner (discretamente) su anelli e stile",
      ],
    },
    {
      phase: "2-3 MESI PRIMA",
      title: "Acquisti e Prenotazioni Principali",
      months_before: 2.5,
      tasks: [
        "Acquista anello di fidanzamento",
        "Prenota location definitiva",
        "Ingaggia fotografo/videomaker",
        "Prenota ristorante o catering",
        "Conferma data con eventuali complici",
        "Ordina decorazioni personalizzate (se necessario)",
      ],
    },
    {
      phase: "1 MESE PRIMA",
      title: "Dettagli e Coordinamento",
      months_before: 1,
      tasks: [
        "Conferma tutti i fornitori (foto, location, catering)",
        "Organizza allestimento location (fiori, candele, luci)",
        "Scegli e prenota outfit per te (e partner se sorpresa)",
        "Prepara playlist musicale o conferma musicisti",
        "Scrivi lettera d'amore o discorso",
        "Verifica anello (misura, custodia, incisione)",
        "Pianifica trasporti e logistica dettagliata",
      ],
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Prove e Ultimi Controlli",
      days_before: 7,
      tasks: [
        "Sopralluogo location per verificare tutto",
        "Prova generale con complici (se coinvolti)",
        "Conferma orari con fotografo e fornitori",
        "Ritira anello definitivo dal gioielliere",
        "Prepara eventuali sorprese extra (video, regali)",
        "Controlla meteo e attiva piano B se necessario",
      ],
    },
    {
      phase: "GIORNO DELLA PROPOSTA",
      title: "Il Grande Momento 💍",
      days_before: 0,
      tasks: [
        "Arrivo location con anticipo per setup finale",
        "Verifica allestimento e decorazioni",
        "Controlla di avere anello con te",
        "Relax e goditi il momento",
        "LA PROPOSTA! 🎉",
        "Brindisi e celebrazione",
        "Foto e video ricordo",
        "Cena romantica o festa con cari",
      ],
    },
    {
      phase: "POST-PROPOSTA",
      title: "Celebrazione e Condivisione",
      days_before: -1,
      tasks: [
        "Annuncia fidanzamento a famiglia e amici",
        "Condividi foto/video sui social (se desiderato)",
        "Ricevi foto/video definitivi da professionisti",
        "Ringrazia fornitori e complici",
        "Inizia pianificazione matrimonio (se previsto)",
        "Goditi il momento da neo-fidanzati! 💕",
      ],
    },
  ];
}

// Campi personalizzati per la proposta
export type EventField = {
  name: string;
  type: "text" | "select" | "number" | "date";
  options?: string[];
  label: string;
  placeholder?: string;
};

export function getProposalFields(): EventField[] {
  return [
    {
      name: "proposal_style",
      type: "select",
      label: "Stile Proposta",
      options: [
        "Romantica e intima",
        "Grande sorpresa pubblica",
        "Avventurosa (viaggio, natura)",
        "In famiglia o con amici",
        "Minimalista e discreta",
        "Lussuosa ed elegante",
      ],
    },
    {
      name: "location_type",
      type: "select",
      label: "Tipo Location",
      options: [
        "Ristorante gourmet",
        "Spiaggia al tramonto",
        "Montagna o natura",
        "Casa privata",
        "Viaggio romantico",
        "Luogo simbolico per la coppia",
        "Location storica (castello, villa)",
      ],
    },
    {
      name: "ring_budget",
      type: "number",
      label: "Budget Anello (€)",
      placeholder: "es. 5000",
    },
    {
      name: "total_guests",
      type: "number",
      label: "Ospiti Presenti (se festa post-proposta)",
      placeholder: "0 se solo coppia",
    },
    {
      name: "photographer",
      type: "select",
      label: "Servizio Fotografico",
      options: [
        "Fotografo professionista",
        "Solo video",
        "Foto + video completo",
        "Nessuno (foto proprie)",
      ],
    },
    {
      name: "special_surprise",
      type: "text",
      label: "Sorpresa Speciale",
      placeholder: "es. Video montaggio, musica dal vivo, flash mob...",
    },
  ];
}

// Suggerimenti fornitori
export type VendorSuggestion = {
  category: string;
  suggestions: string[];
};

export function getProposalVendorSuggestions(): VendorSuggestion[] {
  return [
    {
      category: "Gioiellieri",
      suggestions: [
        "Tiffany & Co. - Iconici anelli di fidanzamento",
        "Cartier - Lusso e tradizione",
        "Damiani - Eccellenza italiana",
        "Gioielleria locale con design personalizzato",
        "Pandora - Opzioni moderne e accessibili",
        "Online: Blue Nile, Brilliant Earth (certificati)",
      ],
    },
    {
      category: "Fotografi Proposta",
      suggestions: [
        "Fotografi specializzati in proposal (cerca su Instagram #proposalphotographer)",
        "Servizi 'Proposta a sorpresa' (fotografo nascosto)",
        "Paparazzi Proposals (servizio dedicato proposte)",
        "Flytographer - Fotografi locali per viaggiatori",
      ],
    },
    {
      category: "Location Romantiche",
      suggestions: [
        "Ristoranti stellati con vista panoramica",
        "Ville storiche o castelli",
        "Spiagge esclusive o lidi privati",
        "Giardini botanici o parchi",
        "Suite hotel di lusso con terrazza",
        "Luoghi simbolici per la coppia (primo appuntamento, viaggio speciale)",
      ],
    },
    {
      category: "Allestimenti e Decorazioni",
      suggestions: [
        "Fioristi specializzati in eventi romantici",
        "Noleggio luci LED e luminarie",
        "Scritte luminose personalizzate 'Marry Me'",
        "Palloncini led trasparenti con foto/messaggi",
        "Wedding planner per coordinare allestimento",
      ],
    },
    {
      category: "Esperienze Uniche",
      suggestions: [
        "Volo in mongolfiera",
        "Cena privata in barca/yacht",
        "Elicottero con vista panoramica",
        "Weekend romantico (Parigi, Venezia, Santorini)",
        "Cena sotto le stelle con astronomo",
        "Proposta durante concerto/evento speciale",
      ],
    },
  ];
}
