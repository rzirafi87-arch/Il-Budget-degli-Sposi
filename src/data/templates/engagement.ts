export type EngagementCategory = { name: string; subs: string[] };

// Festa di Fidanzamento – struttura completa con 11 categorie e 58 sottocategorie
export function getEngagementTemplate(_country: string): EngagementCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: EngagementCategory[] = [
    {
      name: "Cerimonia o Momento Simbolico",
      subs: [
        "Scelta della data e del luogo (privato o pubblico)",
        "Cerimonia simbolica o scambio di promesse / anello",
        "Officiante o amico incaricato del momento",
        "Musica di sottofondo (violino, chitarra, voce)",
        "Decorazioni per l'area cerimonia (arco, fiori, candele)",
        "Servizio fotografico per il momento clou",
      ],
    },
    {
      name: "Location e Allestimento",
      subs: [
        "Selezione location (villa, terrazza, ristorante, giardino, spiaggia)",
        "Affitto sala o spazio esterno",
        "Decorazioni a tema (palette colori, luci, fiori, materiali naturali)",
        "Tavoli, sedute, tovagliato coordinato",
        "Luci decorative, lanterne e candele",
        "Photobooth o backdrop personalizzato",
        "Tableau o angolo 'storia della coppia'",
      ],
    },
    {
      name: "Catering / Ristorazione",
      subs: [
        "Pranzo, cena o apericena",
        "Buffet o servizio al tavolo",
        "Sweet table e torta di fidanzamento",
        "Bevande e cocktail personalizzati",
        "Servizio catering o ristorante",
        "Brindisi simbolico",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Outfit dei fidanzati (abito elegante o boho chic)",
        "Trucco e parrucco",
        "Accessori coordinati (gioielli, boutonnière, scarpe)",
        "Acconciatura e styling",
      ],
    },
    {
      name: "Foto, Video e Contenuti",
      subs: [
        "Fotografo professionista",
        "Videomaker o videografo",
        "Shooting di coppia pre-evento",
        "Servizio reportage durante la festa",
        "QR code per raccolta foto e video ospiti",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Partecipazioni digitali o cartacee",
        "Coordinato grafico (tableau, segnaposti, menu)",
        "Monogramma personalizzato coppia",
        "Biglietti di ringraziamento",
        "Timeline 'storia della coppia' stampata",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Lista regali o Gift Wallet digitale",
        "Bomboniere o gift bag per ospiti",
        "Biglietti di ringraziamento post-evento",
        "Pensierini per testimoni o VIP",
      ],
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "DJ o band live per la festa",
        "Cantante o musicista per cerimonia simbolica",
        "Playlist personalizzata",
        "Proiezione video 'storia della coppia' o slideshow foto",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto elegante per la coppia",
        "Navetta o transfer ospiti",
        "Parcheggi e permessi",
        "Alloggio ospiti fuori sede",
      ],
    },
    {
      name: "Intrattenimento Extra",
      subs: [
        "Artisti o performer (violinista, ballerini, caricaturista)",
        "Giochi interattivi o quiz sulla coppia",
        "Angolo wish jar (barattolo desideri)",
        "Votazione tema o colore futuro matrimonio",
        "Live streaming per amici lontani",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Contingenze e imprevisti",
        "Mance e liberalità varie",
        "Assicurazione evento",
        "Cancelleria e stampati vari",
        "Spese amministrative e organizzazione",
      ],
    },
  ];

  return base;
}

// Budget percentages suggerite per Festa di Fidanzamento (totale €5.000)
export const ENGAGEMENT_BUDGET_PERCENTAGES = {
  "Cerimonia o Momento Simbolico": 10, // €500
  "Location e Allestimento": 25, // €1.250
  "Catering / Ristorazione": 30, // €1.500
  "Abbigliamento e Beauty": 8, // €400
  "Foto, Video e Contenuti": 20, // €1.000
  "Inviti e Grafica": 4, // €200
  "Regali e Ringraziamenti": 3, // €150
  "Musica e Intrattenimento": 8, // €400
  "Trasporti e Logistica": 4, // €200
  "Intrattenimento Extra": 4, // €200
  "Gestione Budget": 4, // €200
};

// Timeline suggerita per Festa di Fidanzamento (2-3 mesi di pianificazione)
export const ENGAGEMENT_TIMELINE = [
  {
    phase: "Ideazione e Prenotazioni (2-3 mesi prima)",
    tasks: [
      "Definire data e tipo di festa (intima, media, grande)",
      "Definire budget totale e dividere per categorie",
      "Scegliere stile: Natural Chic, Boho, Elegante, Modern",
      "Selezionare e prenotare location",
      "Ingaggiare fotografo/videomaker",
      "Definire lista ospiti preliminare",
      "Scegliere palette colori e tema grafico",
    ],
  },
  {
    phase: "Conferme Fornitori (1 mese prima)",
    tasks: [
      "Confermare menu con catering/ristorante",
      "Definire scaletta cerimonia simbolica e musica",
      "Ordinare inviti cartacei o inviare digitali",
      "Prenotare servizi beauty (trucco, parrucco)",
      "Confermare shooting di coppia pre-evento",
      "Organizzare photobooth e backdrop",
      "Pianificare timeline 'storia della coppia'",
    ],
  },
  {
    phase: "Rifinitura (2 settimane prima)",
    tasks: [
      "Finalizzare tableau, segnaposti e menu",
      "Confermare numero ospiti definitivo",
      "Preparare bomboniere e gift bag",
      "Controllare abiti e accessori coppia",
      "Creare slideshow o video 'storia della coppia'",
    ],
  },
  {
    phase: "Coordinamento Finale (1 settimana prima)",
    tasks: [
      "Rundown dettagliato con fornitori",
      "Ultimo check location e allestimenti",
      "Prove trucco e parrucco (se previste)",
      "Stampare ultimi materiali grafici",
    ],
  },
  {
    phase: "Giorno della Festa",
    tasks: [
      "Arrivo in location e check setup",
      "Cerimonia simbolica o scambio promesse",
      "Shooting fotografico coppia",
      "Ricevimento e brindisi ospiti",
      "Proiezione video 'storia della coppia'",
      "Festa, musica e celebrazione",
    ],
  },
  {
    phase: "Post-Evento",
    tasks: [
      "Raccogliere foto e video da ospiti (via QR code)",
      "Invio biglietti di ringraziamento",
      "Ritiro bomboniere non consegnate",
      "Ricevere e selezionare foto/video finali",
      "Condivisione ricordi sui social",
    ],
  },
];

// Campi evento personalizzati per Festa di Fidanzamento
export const ENGAGEMENT_EVENT_FIELDS = {
  engagementStyle: {
    label: "Stile Festa",
    type: "select" as const,
    options: ["Natural Chic", "Boho Elegante", "Modern Minimalist", "Classic Romantic"],
  },
  ceremonyType: {
    label: "Tipo Cerimonia",
    type: "select" as const,
    options: [
      "Scambio anello simbolico",
      "Promesse reciproche",
      "Benedizione informale",
      "Solo ricevimento (no cerimonia)",
    ],
  },
  coupleStory: {
    label: "Storia della Coppia (timeline)",
    type: "textarea" as const,
    placeholder: "Primo incontro, date importanti, proposta...",
  },
  monogram: {
    label: "Monogramma Coppia",
    type: "text" as const,
    placeholder: "Es: A&M, L+S",
  },
  guestCount: {
    label: "Numero Ospiti Previsti",
    type: "number" as const,
    min: 10,
    max: 200,
  },
  colorTheme: {
    label: "Palette Colori",
    type: "text" as const,
    placeholder: "Es: Oro, Beige Rosato, Salvia",
    defaultValue: "#D4AF37,#F8E8D8,#A3B59D",
  },
};

// Vendor suggestions per Festa di Fidanzamento
export const ENGAGEMENT_VENDOR_SUGGESTIONS = {
  "Location e Allestimento": [
    "Ville storiche con giardino",
    "Terrazze panoramiche urbane",
    "Agriturismi chic in campagna",
    "Beach club o stabilimenti balneari eleganti",
    "Ristoranti con sala privata",
  ],
  "Catering / Ristorazione": [
    "Catering gourmet per eventi privati",
    "Ristoranti stellati o alta cucina",
    "Servizio buffet finger food elegante",
    "Pasticcerie per sweet table e torta personalizzata",
  ],
  "Foto, Video e Contenuti": [
    "Fotografi specializzati in coppia e ritratti",
    "Videomaker per mini-documentario d'amore",
    "Droni per riprese aeree location",
    "Photobooth con stampa istantanea",
  ],
  "Musica e Intrattenimento": [
    "DJ per festa danzante",
    "Band jazz o acustica per atmosfera raffinata",
    "Violinisti, arpisti o chitarristi per cerimonia",
    "Cantanti per brano dedicato alla coppia",
  ],
  "Abbigliamento e Beauty": [
    "Atelier abiti da cerimonia",
    "Make-up artist professionisti",
    "Hair stylist per acconciature eleganti",
    "Noleggio smoking o abiti da sera",
  ],
};

// Budget tips per Festa di Fidanzamento
export const ENGAGEMENT_BUDGET_TIPS = [
  "Location: considera location con ristorazione inclusa per risparmiare",
  "Catering: l'apericena costa meno della cena seduta ma è ugualmente elegante",
  "Foto/Video: priorità al fotografo, il video è opzionale",
  "Decorazioni: materiali naturali e DIY riducono i costi senza sacrificare stile",
  "Inviti: le partecipazioni digitali sono ecologiche e gratuite",
  "Musica: una playlist curata può sostituire DJ per feste intime",
  "Photobooth: affittare è più economico che comprare, o usare app gratuite",
  "Timeline coppia: creare digitalmente e stampare in tipografia locale",
  "Bomboniere: piccoli pensieri personalizzati valgono più di oggetti costosi",
  "Buffet dolci: amici e parenti possono contribuire con dolci fatti in casa",
  "Contingenze: riserva 10% del budget per imprevisti",
];

// Compliance notes per Festa di Fidanzamento
export const ENGAGEMENT_COMPLIANCE_NOTES = [
  "Privacy: ottenere consenso ospiti prima di pubblicare foto sui social",
  "Location: verificare permessi per musica dal vivo o amplificata dopo orari serali",
  "Catering: controllare licenze HACCP se si opta per catering privato",
  "Photobooth: se con stampa istantanea, rispettare normative GDPR",
  "Assicurazione: consigliata per eventi in location prestigiose o con molti ospiti",
  "Contratti: formalizzare accordi con fornitori principali (location, catering, foto)",
  "Accessibilità: verificare che location sia accessibile a ospiti con disabilità",
  "Alcol: se open bar, prevedere alternative analcoliche e autisti designati",
];
