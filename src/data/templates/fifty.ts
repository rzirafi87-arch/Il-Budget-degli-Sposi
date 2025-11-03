export type FiftyCategory = { name: string; subs: string[] };

// 50° Compleanno – struttura completa con 10 categorie e sottocategorie
export function getFiftyTemplate(_country: string): FiftyCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: FiftyCategory[] = [
    {
      name: "Concept e Location",
      subs: [
        "Definizione tema (moodboard oro, nude, sabbia, salvia)",
        "Location esclusiva (villa, terrazza, resort, ristorante panoramico)",
        "Allestimento elegante (tavoli, tessuti, mise en place)",
        "Decorazioni floreali (bouquet tavoli, centrotavola)",
        "Illuminazione scenografica (luci calde, lanterne, candele)",
        "Angolo ricordi/guestbook (corner con foto e props)",
      ],
    },
    {
      name: "Catering / Ristorazione",
      subs: [
        "Cena placée gourmet (servizio completo con menù degustazione)",
        "Aperitivo di benvenuto (finger food, welcome drink)",
        "Torta personalizzata 50 anni (torta a piani con elementi oro)",
        "Degustazione vini selezionati (abbinamento vini premium, champagne)",
        "Servizio catering/brigata sala (personale, coordinamento)",
        "Corner digestivi & sigari (amari, whisky, area sigari)",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Inviti premium (stampa letterpress o digitali animati)",
        "Coordinato grafico (menu, segnaposti, segnaletica)",
        "Tableau e disposizione tavoli",
        "Guestbook digitale / QR code (raccolta foto/video ospiti)",
        "Welcome sign e cartellonistica",
        "Biglietti di ringraziamento",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo professionista (reportage evento)",
        "Videomaker e storytelling (video emozionale con montaggio)",
        "Shooting pre-evento (servizio fotografico festeggiato)",
        "Polaroid / instant corner (postazione libera ospiti)",
        "Album o cofanetto ricordi (album stampato o digitale deluxe)",
      ],
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "DJ / band live (lounge, dance, revival anni 70-90)",
        "Presentatore / master of ceremony (gestione brindisi, sorprese)",
        "Playlist su misura (scaletta personalizzata)",
        "Spettacolo luci / laser show (effetti scenici)",
        "Proiezione video '50 anni di ricordi' (montaggio clip famiglia/amici)",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Outfit festeggiato/a (abito su misura o sartoria)",
        "Servizio sartoria/stylist (consulenza look, prove)",
        "Hair & make-up professionale (trucco e acconciatura serata)",
        "Accessori dedicati (gioielli, scarpe, cravatta/papillon)",
        "Trattamenti spa o barber (relax pre-evento, spa day)",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Lista desideri / raccolta fondi (registry digitale)",
        "Gift table / angolo regali (allestimento area dedicata)",
        "Bomboniere o gift bag (box personalizzate, gourmet)",
        "Thank-you gift per ospiti speciali (regali famiglia/amici stretti)",
        "Cartoline e note di ringraziamento (messaggi scritti a mano)",
      ],
    },
    {
      name: "Intrattenimento Extra",
      subs: [
        "Corner degustazione / mixology (sommelier o bartender dedicato)",
        "Area lounge e cigar corner (divanetti, atmosfera soft)",
        "Animazione per ospiti (mentalista, caricaturista, performer)",
        "Fuochi d'artificio freddi (finale spettacolare)",
        "Esperienza signature (degustazione whisky, sigari, cioccolato)",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Transfer festeggiato/a (auto con autista o auto d'epoca)",
        "Navetta ospiti (servizio autobus/navette)",
        "Pernottamento ospiti (hotel o B&B per chi arriva da fuori)",
        "Trasporto fornitori/allestimenti",
        "Assistente logistica evento (coordinamento tempistiche)",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget stimato",
        "Acconti versati",
        "Saldi fornitori",
        "Spese extra / imprevisti",
        "Regali ricevuti",
        "Totale finale",
      ],
    },
  ];
  return base;
}

export function getFiftyBudgetPercentages() {
  // Percentuali indicative per ripartire il budget (somma ~100)
  return {
    "Concept e Location": 25,
    "Catering / Ristorazione": 32,
    "Inviti e Grafica": 4,
    "Foto e Video": 12,
    "Musica e Intrattenimento": 12,
    "Abbigliamento e Beauty": 6,
    "Regali e Ringraziamenti": 3,
    "Intrattenimento Extra": 4,
    "Trasporti e Logistica": 2,
    "Gestione Budget": 0,
  } as Record<string, number>;
}

export function getFiftyTimeline() {
  return [
    {
      phase: "3 mesi prima: Ideazione e Pianificazione",
      months_before: 3,
      tasks: [
        "Definisci tema e concept (oro, eleganza, vintage, moderno)",
        "Fissa data e location (villa, terrazza, ristorante esclusivo)",
        "Crea lista invitati (amici storici, famiglia, colleghi)",
        "Richiedi preventivi catering e location",
        "Prenota fotografo e videomaker",
        "Imposta budget iniziale nell'app",
        "Inizia coordinato grafico (inviti, palette colori)",
      ],
    },
    {
      phase: "2 mesi prima: Conferme e Fornitori",
      months_before: 2,
      tasks: [
        "Conferma location e firma contratti",
        "Ordina inviti e invia save-the-date",
        "Prenota DJ/band e intrattenimento",
        "Seleziona menù degustazione e vini",
        "Ordina torta personalizzata 50 anni",
        "Prenota servizi beauty (spa, barber, make-up)",
        "Definisci allestimenti floreali e luci",
      ],
    },
    {
      phase: "1 mese prima: Dettagli e Rifinitura",
      months_before: 1,
      tasks: [
        "Conferma ospiti e finalizza tableau",
        "Ordina outfit festeggiato/a (sartoria)",
        "Prepara video '50 anni di ricordi' (montaggio)",
        "Stampa coordinato grafico (menu, segnaposti, welcome sign)",
        "Organizza trasporti (auto festeggiato, navetta ospiti)",
        "Versa acconti finali fornitori",
        "Prepara bomboniere e gift bag",
      ],
    },
    {
      phase: "1 settimana prima: Countdown finale",
      months_before: 0.25,
      tasks: [
        "Brief finale con tutti i fornitori",
        "Prova trucco e parrucco",
        "Prepara playlist personalizzata",
        "Verifica allestimenti e prove luci",
        "Stampa checklist del giorno",
        "Coordina logistica evento (tempistiche, flussi)",
      ],
    },
    {
      phase: "Giorno del 50° Compleanno",
      months_before: 0,
      tasks: [
        "Allestimento location mattina",
        "Shooting pre-evento festeggiato/a",
        "Preparazione (hair, make-up, outfit)",
        "Accoglienza ospiti e aperitivo di benvenuto",
        "Cena gourmet e brindisi",
        "Proiezione video ricordi e speech",
        "Taglio torta 50 anni",
        "DJ set e festa con luci/laser show",
        "Fuochi d'artificio freddi finale",
      ],
    },
    {
      phase: "Dopo l'evento: Chiusura e Ricordi",
      months_before: -0.25,
      tasks: [
        "Invia ringraziamenti digitali/cartoline",
        "Condividi foto e video sui social",
        "Completa saldi fornitori",
        "Aggiorna bilancio finale in app",
        "Crea album fotografico deluxe",
      ],
    },
  ];
}

export function getFiftyFields() {
  return {
    celebration_style: {
      label: "Stile Celebrazione",
      type: "select",
      options: [
        "Elegante e formale (cena gourmet)",
        "Lounge e casual chic (aperitivo esclusivo)",
        "Festa danzante (DJ e revival)",
        "Intimo e familiare (cena ristretta)",
        "Vintage nostalgico (anni 70-80)",
        "Moderno e minimalista",
      ],
      placeholder: "Seleziona lo stile",
    },
    theme: {
      label: "Tema e Colori",
      type: "text",
      placeholder: "Es: Oro e nude, Gatsby, Vintage 70s, Minimal chic",
    },
    guest_count: {
      label: "Numero Ospiti Stimato",
      type: "number",
      placeholder: "Es: 50, 80, 120",
    },
    milestone_focus: {
      label: "Focus Milestone",
      type: "select",
      options: [
        "Retrospettiva vita (video ricordi)",
        "Festa e balli (DJ, intrattenimento)",
        "Degustazione gourmet (vini, cibi pregiati)",
        "Esperienza signature (whisky, sigari, mixology)",
        "Sorprese ospiti (speech, tributi)",
      ],
      placeholder: "Cosa vuoi enfatizzare?",
    },
    budget_total: {
      label: "Budget Totale Stimato (€)",
      type: "number",
      placeholder: "Es: 5000",
    },
  };
}

export function getFiftyVendorSuggestions() {
  return {
    "Concept e Location": [
      "Ville storiche per eventi esclusivi",
      "Ristoranti gourmet con terrazza panoramica",
      "Resort con sale eleganti",
      "Agriturismi di charme",
      "Loft industriali con allestimenti su misura",
    ],
    "Catering / Ristorazione": [
      "Chef stellati o catering di alta gamma",
      "Pasticcerie per torte milestone",
      "Sommelier per abbinamenti vini premium",
      "Bartender specializzati in mixology",
    ],
    "Foto e Video": [
      "Fotografi specializzati in eventi milestone",
      "Videomaker documentaristici",
      "Studi per album deluxe e cofanetti",
      "Servizi photobooth professionali",
    ],
    "Musica e Intrattenimento": [
      "DJ specializzati in revival anni 70-90",
      "Band live (soul, jazz, pop)",
      "Presentatori/maestri di cerimonia",
      "Fornitori effetti speciali (luci, laser, fuochi freddi)",
    ],
  };
}
