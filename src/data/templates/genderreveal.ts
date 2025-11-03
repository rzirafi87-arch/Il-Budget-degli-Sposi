export type GenderRevealCategory = { name: string; subs: string[] };

// Gender Reveal – struttura completa con 10 categorie e sottocategorie
export function getGenderRevealTemplate(_country: string): GenderRevealCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: GenderRevealCategory[] = [
    {
      name: "Location e Allestimento",
      subs: [
        "Scelta location (giardino, terrazza, sala, spiaggia, casa)",
        "Noleggio tavoli, sedute e coperture",
        "Allestimento a tema 'boy or girl' o neutro",
        "Balloon wall e backdrop con scritta personalizzata",
        "Tavolo principale con torta o box rivelazione",
        "Decorazioni floreali o naturali (gypsophila, pampas)",
        "Luci decorative, candele, lanterne",
        "Noleggio carretto dolci o photo corner",
      ],
    },
    {
      name: "Momento Rivelazione",
      subs: [
        "Confetti / polveri colorate / palloncino da scoppiare",
        "Torta con interno colorato",
        "Busta sorpresa dal ginecologo (gender envelope)",
        "Fuochi freddi o cannoni spara coriandoli",
        "Box con palloncini colorati",
        "Coordinamento audio/video per il momento rivelazione",
        "Cronologia rivelazione (musica, countdown, foto, video)",
      ],
    },
    {
      name: "Catering / Dolci e Bevande",
      subs: [
        "Buffet dolce e salato",
        "Sweet table coordinato con tema",
        "Torta 'boy or girl'",
        "Cupcake, cake pops, biscotti colorati",
        "Bevande e cocktail analcolici",
        "Servizio catering o rinfresco organizzato",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Inviti digitali o cartacei",
        "Tema grafico personalizzato (rosa vs azzurro, neutro)",
        "Segnaposti, cartellonistica e backdrop grafico",
        "QR code per raccolta foto e video",
        "Biglietti di ringraziamento",
      ],
    },
    {
      name: "Foto, Video e Social",
      subs: [
        "Fotografo e/o videomaker",
        "Shooting pre-evento (futura mamma/papà)",
        "Ripresa del momento rivelazione",
        "Reel o video social dedicato",
        "Angolo foto con accessori 'Team Boy / Team Girl'",
        "Polaroid corner o cornice personalizzata",
      ],
    },
    {
      name: "Intrattenimento",
      subs: [
        "Giochi a tema (indovina il sesso, quiz, scommesse)",
        "Musica dal vivo o playlist",
        "Presentatore / amico che gestisce la rivelazione",
        "Animazione bambini (se presenti)",
        "Proiezione breve video o ecografia emozionale",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Mini gift per ospiti (candela, biscotto, confetti, piantina)",
        "Biglietti ringraziamento",
        "Libro dediche o cornice ricordi",
        "Bomboniere a tema neutro",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Outfit dei genitori coordinato",
        "Trucco e parrucco (futura mamma)",
        "Accessori a tema (coroncina, spilla 'Team Boy/Girl')",
        "Shooting prima della rivelazione",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Trasporto materiali / decorazioni",
        "Parcheggi ospiti",
        "Noleggio auto o van",
        "Alloggio ospiti (se fuori città)",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget stimato",
        "Acconti fornitori",
        "Spese extra",
        "Regali ricevuti",
        "Totale finale",
      ],
    },
  ];
  return base;
}

export function getGenderRevealBudgetPercentages() {
  // Percentuali indicative per ripartire il budget (somma ~100)
  return {
    "Location e Allestimento": 30,
    "Momento Rivelazione": 15,
    "Catering / Dolci e Bevande": 25,
    "Inviti e Grafica": 5,
    "Foto, Video e Social": 15,
    "Intrattenimento": 5,
    "Regali e Ringraziamenti": 3,
    "Abbigliamento e Beauty": 5,
    "Trasporti e Logistica": 2,
    "Gestione Budget": 0,
  } as Record<string, number>;
}

export function getGenderRevealTimeline() {
  return [
    {
      phase: "1 mese prima: Ideazione e Pianificazione",
      months_before: 1,
      tasks: [
        "Scegli data e location (giardino, terrazza, sala, casa)",
        "Ricevi il referto del sesso del bambino (busta sigillata dal ginecologo)",
        "Scegli tema grafico e palette colori (rosa vs azzurro, neutro natural chic)",
        "Prenota fotografo / videomaker",
        "Richiedi preventivi per torta e catering",
        "Prepara lista invitati e inviti digitali",
        "Imposta budget nell'app",
      ],
    },
    {
      phase: "2-3 settimane prima: Preparativi e Fornitori",
      months_before: 0.6,
      tasks: [
        "Invia inviti ufficiali",
        "Ordina torta rivelazione (con interno colorato)",
        "Prenota fornitore balloon / cannoni coriandoli",
        "Definisci allestimenti e fiori (pampas, gypsophila)",
        "Scegli outfit coppia",
        "Conferma fotografo e regia del momento",
      ],
    },
    {
      phase: "1 settimana prima: Rifinitura e Coordinamento",
      months_before: 0.25,
      tasks: [
        "Brief finale con tutti i fornitori",
        "Stampa cartellonistica e coordinato grafico",
        "Prepara playlist e countdown audio",
        "Ricevi dolci personalizzati (cupcake, cake pops, biscotti)",
        "Prepara mini gift ospiti",
      ],
    },
    {
      phase: "Giorno del Gender Reveal",
      months_before: 0,
      tasks: [
        "Allestimento e test audio/video mattina",
        "Shooting iniziale di coppia",
        "Accoglienza ospiti e presentazione",
        "Countdown e rivelazione del sesso del bambino (MOMENTO CLOU!)",
        "Taglio torta / lancio coriandoli",
        "Musica, brindisi, giochi e foto",
        "Ringraziamenti e saluti con consegna mini gift",
      ],
    },
    {
      phase: "Dopo l'evento: Chiusura e Ricordi",
      months_before: -0.25,
      tasks: [
        "Invia ringraziamenti digitali o cartoline",
        "Condividi video rivelazione sui social",
        "Completa saldi fornitori",
        "Aggiorna bilancio finale in app",
        "Crea mini album digitale",
      ],
    },
  ];
}

export function getGenderRevealFields() {
  return {
    revelation_method: {
      label: "Metodo di Rivelazione",
      type: "select",
      options: [
        "Torta con interno colorato",
        "Palloncino da scoppiare",
        "Box con palloncini",
        "Cannoni spara coriandoli",
        "Confetti/polveri colorate",
        "Fuochi freddi",
        "Busta sorpresa",
      ],
      placeholder: "Seleziona il metodo principale",
    },
    theme: {
      label: "Tema Grafico",
      type: "select",
      options: [
        "Rosa vs Azzurro classico",
        "Natural chic neutro",
        "Vintage pastello",
        "Boho chic",
        "Minimal moderno",
        "Personalizzato",
      ],
      placeholder: "Stile decorativo",
    },
    location_type: {
      label: "Tipo di Location",
      type: "select",
      options: ["Giardino", "Terrazza", "Sala", "Spiaggia", "Casa", "Villa", "Altro"],
      placeholder: "Dove si terrà l'evento?",
    },
    guest_count: {
      label: "Numero Ospiti Stimato",
      type: "number",
      placeholder: "Es: 30, 50, 80",
    },
    budget_total: {
      label: "Budget Totale Stimato (€)",
      type: "number",
      placeholder: "Es: 3500",
    },
  };
}

export function getGenderRevealVendorSuggestions() {
  return {
    "Location e Allestimento": [
      "Location per eventi outdoor/indoor",
      "Noleggio arredi (tavoli, sedie, gazebo)",
      "Balloon artist / decoratori balloon wall",
      "Fioristi specializzati in fiori secchi (pampas, gypsophila)",
      "Fornitori luci e lanterne decorative",
    ],
    "Momento Rivelazione": [
      "Pasticcerie per torte rivelazione",
      "Fornitori effetti speciali (cannoni, fuochi freddi)",
      "Fornitori palloncini colorati / box sorpresa",
      "Tecnici audio/video per coordinamento momento clou",
    ],
    "Catering / Dolci e Bevande": [
      "Catering per eventi privati",
      "Pasticcerie creative (cupcake, cake pops)",
      "Bartender / mixologist (cocktail analcolici)",
      "Fornitori sweet table",
    ],
    "Foto, Video e Social": [
      "Fotografi specializzati in eventi familiari",
      "Videomaker per reel e contenuti social",
      "Photobooth provider con props tematici",
      "Servizi polaroid instant",
    ],
  };
}
