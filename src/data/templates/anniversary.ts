export type AnniversaryCategory = { name: string; subs: string[] };

// Anniversario di Matrimonio – struttura completa con 10 categorie e sottocategorie
export function getAnniversaryTemplate(_country: string): AnniversaryCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: AnniversaryCategory[] = [
    {
      name: "Cerimonia e Rinnovo Promesse",
      subs: [
        "Prenotazione chiesa o luogo simbolico",
        "Celebrazione religiosa o laica",
        "Offerta per la parrocchia / celebrante",
        "Fioraio per altare o arco cerimonia",
        "Musica per cerimonia",
        "Decorazioni e mise en place cerimonia",
        "Rinnovo anelli o scambio simbolico",
      ],
    },
    {
      name: "Location e Ricevimento",
      subs: [
        "Scelta location (ristorante, villa, giardino, terrazza, spiaggia)",
        "Affitto sala o spazio esterno",
        "Allestimento tavoli e decorazioni a tema",
        "Luci e candele decorative",
        "Tavolo d'onore e segnaposti",
        "Tableau o angolo foto ricordi",
        "Tovagliato e stoviglie coordinati",
        "Bomboniere o gift box",
      ],
    },
    {
      name: "Catering e Ristorazione",
      subs: [
        "Pranzo o cena servita",
        "Buffet o apericena elegante",
        "Dolce e torta personalizzata",
        "Brindisi e champagne",
        "Bevande e vini selezionati",
        "Servizio catering o menu ristorante",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Abiti per la coppia",
        "Parrucchiere e make-up",
        "Accessori coordinati",
        "Outfit figli e parenti stretti",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo e videomaker",
        "Shooting di coppia pre-evento",
        "Servizio reportage durante la festa",
        "Mini video racconto o reel",
        "Angolo foto / photobooth",
        "Album o cornice digitale",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Partecipazioni digitali o cartacee",
        "Coordinato grafico",
        "Tableau, segnaposti, menu",
        "Biglietti di ringraziamento",
        "QR code per raccolta foto/video",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Lista regali o Gift Wallet digitale",
        "Regali simbolici reciproci",
        "Bomboniere o gift bag ospiti",
        "Biglietti di ringraziamento",
      ],
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "DJ o band live",
        "Cantante per la cerimonia",
        "Playlist personalizzata",
        "Proiezione video ricordi o slideshow",
        "Ballo di coppia simbolico",
        "Artisti o performer (violinista, sassofonista, ballerini)",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto per la coppia",
        "Navetta ospiti",
        "Parcheggi e permessi",
        "Pernottamenti ospiti",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget stimato",
        "Acconti versati",
        "Saldi fornitori",
        "Spese extra",
        "Regali ricevuti",
        "Totale finale",
      ],
    },
  ];
  return base;
}

export function getAnniversaryBudgetPercentages() {
  // Percentuali indicative per ripartire il budget (somma ~100)
  return {
    "Cerimonia e Rinnovo Promesse": 12,
    "Location e Ricevimento": 25,
    "Catering e Ristorazione": 28,
    "Abbigliamento e Beauty": 8,
    "Foto e Video": 12,
    "Inviti e Grafica": 5,
    "Regali e Ringraziamenti": 4,
    "Musica e Intrattenimento": 4,
    "Trasporti e Logistica": 2,
    "Gestione Budget": 0,
  } as Record<string, number>;
}

export function getAnniversaryTimeline() {
  return [
    {
      phase: "3-4 mesi prima: Idea e impostazione evento",
      months_before: 4,
      tasks: [
        "Definisci tipo di anniversario (argento 25°, oro 50°, nozze carta, celebrazione intima)",
        "Fissa data e location (chiesa/luogo simbolico + spazio ricevimento)",
        "Scegli tema visivo e colori (argento, oro, salvia, avorio)",
        "Contatta fotografo e videomaker",
        "Richiedi preventivi catering",
        "Progetta inviti e grafica",
        "Imposta budget iniziale",
      ],
    },
    {
      phase: "2 mesi prima: Conferme e fornitori",
      months_before: 2,
      tasks: [
        "Conferma location e fornitori (firma contratti)",
        "Prenota fiorista e allestimento",
        "Ricerca outfit coppia (abiti cerimonia e ricevimento)",
        "Ordina torta personalizzata",
        "Invia inviti ufficiali",
        "Scegli bomboniere",
      ],
    },
    {
      phase: "1 mese prima: Definizione dettagli",
      months_before: 1,
      tasks: [
        "Conferma musicisti o DJ (scaletta e performance)",
        "Stabilisci programma giornata (cerimonia → ricevimento → festa)",
        "Prepara tableau e menù",
        "Conferma shooting pre-evento",
        "Organizza trasporti (auto coppia + navetta ospiti)",
        "Versa acconti finali",
      ],
    },
    {
      phase: "2 settimane prima: Rifinitura",
      months_before: 0.5,
      tasks: [
        "Prova trucco e parrucco",
        "Brief finale con tutti i fornitori",
        "Stampa checklist del giorno",
        "Verifica pernottamenti ospiti fuori città",
        "Prepara regali simbolici reciproci",
      ],
    },
    {
      phase: "Giorno dell'anniversario: Celebrazione",
      months_before: 0,
      tasks: [
        "Preparazione (trucco, outfit, accessori)",
        "Cerimonia / rinnovo promesse",
        "Shooting fotografico post-cerimonia",
        "Ricevimento e brindisi",
        "Taglio torta e discorso",
        "Proiezione video ricordi",
        "Ballo di coppia simbolico",
        "Festa con musica e balli",
      ],
    },
    {
      phase: "Dopo l'evento: Chiusura e ricordi",
      months_before: -1,
      tasks: [
        "Ringraziamenti digitali/cartoline",
        "Raccolta foto/video",
        "Saldi fornitori",
        "Bilancio finale (stimato/speso)",
        "Album fotografico o video ricordo",
      ],
    },
  ];
}

export function getAnniversaryFields() {
  return {
    anniversary_year: {
      label: "Anno di Anniversario",
      type: "select",
      options: ["1° anno", "5° anno", "10° anno", "25° argento", "50° oro", "Altro"],
      placeholder: "Seleziona l'anniversario",
    },
    ceremony_type: {
      label: "Tipo di Cerimonia",
      type: "select",
      options: ["Rinnovo promesse religioso", "Rinnovo promesse laico", "Solo ricevimento", "Celebrazione intima"],
      placeholder: "Cerimonia religiosa, laica o solo festa?",
    },
    theme: {
      label: "Tema e Colori",
      type: "text",
      placeholder: "Es: Argento e bianco, Oro e avorio, Romantico vintage",
    },
    guest_count: {
      label: "Numero Ospiti Stimato",
      type: "number",
      placeholder: "Es: 50, 100, 150",
    },
    budget_total: {
      label: "Budget Totale Stimato (€)",
      type: "number",
      placeholder: "Es: 8000",
    },
  };
}

export function getAnniversaryVendorSuggestions() {
  return {
    "Cerimonia e Rinnovo Promesse": [
      "Chiesa della tua prima cerimonia",
      "Celebrante laico specializzato in rinnovi",
      "Fiorai specializzati in eventi romantici",
      "Musicisti per cerimonie (arpa, violino, quartetto d'archi)",
    ],
    "Location e Ricevimento": [
      "Location simbolica (dove vi siete sposati, dove vi siete conosciuti)",
      "Ristoranti eleganti",
      "Ville con giardino",
      "Terrazze panoramiche",
      "Location sul lago o mare",
    ],
    "Catering e Ristorazione": [
      "Ristoranti raffinati",
      "Catering di lusso",
      "Pasticcerie per torte personalizzate",
      "Sommelier per selezione vini",
    ],
    "Foto e Video": [
      "Fotografi matrimonialisti",
      "Videomaker documentaristici",
      "Drone operator",
      "Photobooth provider",
    ],
  };
}
