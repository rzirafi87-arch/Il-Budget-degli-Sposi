export type RetirementCategory = { name: string; subs: string[] };

// RETIREMENT PARTY (Festa di Pensionamento) – struttura completa con 10 categorie
export function getRetirementTemplate(_country: string): RetirementCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  return [
    {
      name: "Cerimonia o Momento Simbolico",
      subs: [
        "Scelta luogo della celebrazione (azienda, ristorante, casa privata, sala)",
        "Breve discorso o cerimonia di ringraziamento",
        "Presentatore o collega che conduce il momento",
        "Omaggio simbolico (targa, libro, album, video)",
        "Proiezione foto o video 'carriera e ricordi'",
        "Brindisi inaugurale o taglio torta"
      ]
    },
    {
      name: "Location e Allestimento",
      subs: [
        "Selezione location (ristorante, giardino, sala eventi, terrazza)",
        "Affitto sala o spazio esterno",
        "Allestimento elegante e sobrio (fiori, piante, luci calde)",
        "Tavoli e mise en place coordinati",
        "Tableau e segnaposti",
        "Photobooth con tema 'nuovi inizi' o 'libertà'",
        "Decorazioni personalizzate (foto di carriera, oggetti simbolici)"
      ]
    },
    {
      name: "Catering / Ristorazione",
      subs: [
        "Cena servita o buffet conviviale",
        "Sweet table e dessert personalizzati",
        "Torta 'Buona Pensione' o con dedica personalizzata",
        "Bevande, vini e brindisi",
        "Servizio catering o ristorante"
      ]
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Inviti digitali o cartacei (tema oro, verde, avorio, beige)",
        "Coordinato grafico (menù, segnaposti, ringraziamenti)",
        "Tableau, cartellonistica e backdrop",
        "QR code per raccolta foto e video",
        "Biglietti ringraziamento personalizzati"
      ]
    },
    {
      name: "Foto, Video e Contenuti",
      subs: [
        "Fotografo / videomaker",
        "Shooting con colleghi e famiglia",
        "Reel o mini video commemorativo",
        "Proiezione 'la mia carriera in 5 minuti'",
        "Album digitale o cornice ricordo"
      ]
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "DJ o musica di sottofondo live (jazz, acustica, lounge)",
        "Playlist personalizzata 'ricordi e futuro'",
        "Brevi interventi o dediche da colleghi e amici",
        "Piccolo spettacolo comico o sorpresa",
        "Karaoke finale o ballo simbolico"
      ]
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Regalo collettivo (viaggio, esperienza, oggetto simbolico)",
        "Bomboniere o gift box per invitati",
        "Targhe o riconoscimenti professionali",
        "Biglietti e dediche scritte",
        "Album delle dediche o guestbook"
      ]
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Outfit elegante ma sobrio (in linea con il tono della festa)",
        "Trucco / parrucco (per servizi fotografici)",
        "Accessori coordinati (foulard, gioielli, dettagli oro o sabbia)",
        "Shooting pre-evento"
      ]
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Parcheggi ospiti",
        "Navetta o trasporto colleghi",
        "Trasporto materiali / allestimenti",
        "Pernottamento ospiti (se evento fuori città)"
      ]
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget stimato",
        "Acconti fornitori",
        "Saldi",
        "Spese extra",
        "Totale finale",
        "Regali ricevuti"
      ]
    }
  ];
}

// Budget percentages per categoria (totale 100%)
export function getRetirementBudgetPercentages(): Record<string, number> {
  return {
    "Cerimonia o Momento Simbolico": 8,      // €320 su €4000
    "Location e Allestimento": 28,            // €1120
    "Catering / Ristorazione": 32,            // €1280
    "Inviti e Grafica": 5,                    // €200
    "Foto, Video e Contenuti": 10,            // €400
    "Musica e Intrattenimento": 7,            // €280
    "Regali e Ringraziamenti": 6,             // €240
    "Abbigliamento e Beauty": 2,              // €80
    "Trasporti e Logistica": 2,               // €80
    "Gestione Budget": 0                      // Tracking only
  };
}

// Timeline fasi evento (da SQL seed)
export type TimelinePhase = {
  phase: string;
  weeks_before: string;
  tasks: string[];
};

export function getRetirementTimeline(): TimelinePhase[] {
  return [
    {
      phase: "Ideazione e Pianificazione",
      weeks_before: "2-3 mesi prima",
      tasks: [
        "Scegli data e location",
        "Definisci tipo di festa (intima, formale aziendale, familiare)",
        "Contatta fotografo / videomaker",
        "Richiedi preventivi catering / ristorante / torta",
        "Prenota musica o intrattenimento",
        "Stila lista invitati",
        "Imposta budget nell'app"
      ]
    },
    {
      phase: "Conferme e Fornitori",
      weeks_before: "1 mese prima",
      tasks: [
        "Invia inviti ufficiali",
        "Conferma fiori e decorazioni",
        "Ordina torta e dolci personalizzati",
        "Scegli outfit e accessori",
        "Conferma fotografo / videomaker",
        "Organizza regalo collettivo"
      ]
    },
    {
      phase: "Rifinitura",
      weeks_before: "2 settimane prima",
      tasks: [
        "Invia brief fornitori (orari, scaletta, colori)",
        "Prepara playlist e interventi musicali",
        "Raccogli foto e video ricordi da proiettare",
        "Stampa menù, segnaposti, cartellonistica",
        "Controlla acconti e saldi"
      ]
    },
    {
      phase: "Coordinamento Finale",
      weeks_before: "1 settimana prima",
      tasks: [
        "Ultimo check con location e catering",
        "Organizza trasporto materiali e fornitori",
        "Stampa checklist evento",
        "Prepara regali e bomboniere"
      ]
    },
    {
      phase: "Giorno dell'Evento",
      weeks_before: "Giorno 0",
      tasks: [
        "Allestimento e preparazione",
        "Shooting e accoglienza ospiti",
        "Brindisi e discorso",
        "Cena o buffet",
        "Proiezione ricordi e momenti simbolici",
        "Taglio torta e musica",
        "Ringraziamenti finali"
      ]
    },
    {
      phase: "Chiusura e Ricordi",
      weeks_before: "Dopo l'evento",
      tasks: [
        "Invia ringraziamenti a colleghi e fornitori",
        "Raccogli foto e video",
        "Completa pagamenti",
        "Aggiorna bilancio finale",
        "Crea album digitale o video ricordo"
      ]
    }
  ];
}

// Campi personalizzati evento pensione
export type EventField = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  required?: boolean;
};

export function getRetirementFields(): EventField[] {
  return [
    {
      name: "party_type",
      label: "Tipo di festa",
      type: "select",
      options: [
        "Cena formale aziendale",
        "Apericena con colleghi",
        "Pranzo familiare",
        "Festa in locale",
        "Evento intimo (amici stretti)"
      ],
      required: true
    },
    {
      name: "theme",
      label: "Tema e colori",
      type: "select",
      options: [
        "Golden Retirement (oro e nero)",
        "New Beginnings (verde salvia e avorio)",
        "Travel Theme (mappe e viaggi)",
        "Classic Elegance (beige e bianco)",
        "Vintage Memories (seppia e legno)"
      ],
      required: false
    },
    {
      name: "guest_count",
      label: "Numero ospiti previsti",
      type: "number",
      required: true
    },
    {
      name: "ceremony_type",
      label: "Cerimonia simbolica",
      type: "select",
      options: [
        "Breve discorso aziendale",
        "Consegna targa e omaggio",
        "Proiezione video carriera",
        "Solo brindisi informale",
        "Nessuna cerimonia formale"
      ],
      required: false
    },
    {
      name: "collective_gift",
      label: "Regalo collettivo principale",
      type: "select",
      options: [
        "Viaggio (crociera, tour, weekend)",
        "Esperienza (corso, attività sportiva)",
        "Oggetto simbolico (orologio, gioiello)",
        "Buono regalo shopping/ristorante",
        "Album ricordi personalizzato",
        "Altro"
      ],
      required: false
    },
    {
      name: "budget_total",
      label: "Budget totale disponibile (€)",
      type: "number",
      required: true
    }
  ];
}

// Suggerimenti fornitori per evento pensione
export type VendorSuggestion = {
  category: string;
  suggestions: string[];
};

export function getRetirementVendorSuggestions(): VendorSuggestion[] {
  return [
    {
      category: "Location e Catering",
      suggestions: [
        "Ristoranti eleganti con sale private",
        "Agriturismi con spazi esterni",
        "Hotel con sale congressi",
        "Club aziendali o circoli ricreativi",
        "Ville storiche o case di campagna"
      ]
    },
    {
      category: "Fotografi e Videomaker",
      suggestions: [
        "Fotografi eventi corporate",
        "Videomaker documentaristi (per video carriera)",
        "Servizi foto + video combo",
        "Fotobooth professionali con stampa istantanea"
      ]
    },
    {
      category: "Musica e Intrattenimento",
      suggestions: [
        "DJ specializzati eventi aziendali",
        "Band jazz o acustiche",
        "Duo piano e voce",
        "Quartetto d'archi (per eleganza formale)",
        "Comici o intrattenitori per sorprese"
      ]
    },
    {
      category: "Grafica e Stampa",
      suggestions: [
        "Tipografie per inviti personalizzati",
        "Designer grafici per coordinato evento",
        "Servizi online per partecipazioni digitali",
        "Stamperie per welcome board e tableau"
      ]
    },
    {
      category: "Regali e Gadget",
      suggestions: [
        "Gioiellerie per orologi/gioielli simbolici",
        "Agenzie viaggi per gift travel",
        "Artigiani per targhe personalizzate",
        "E-commerce per gift box corporate"
      ]
    },
    {
      category: "Allestimenti",
      suggestions: [
        "Fioristi specializzati eventi corporate",
        "Noleggio arredi e decorazioni",
        "Service audio/video per proiezioni",
        "Allestitori professionali"
      ]
    }
  ];
}
