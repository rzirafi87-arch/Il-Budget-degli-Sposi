/**
 * Template per Evento Culturale/Charity/Gala
 * Eventi di beneficenza, gala, mostre, concerti, eventi culturali
 */

export interface CharityGalaCategory {
  category: string;
  subcategories: string[];
}

export interface CharityGalaTimelineItem {
  phase: string;
  item: string;
  timing: string;
}

/**
 * Struttura completa delle categorie e sottocategorie per evento Charity/Gala
 */
export function getCharityGalaTemplate(): CharityGalaCategory[] {
  return [
    {
      category: "Pianificazione e Organizzazione",
      subcategories: [
        "Event planner/Organizzatore",
        "Coordinatore giorno evento",
        "Consulente fundraising",
        "Permessi e autorizzazioni",
        "Assicurazioni evento",
        "Materiali stampati/Programmi",
        "Segnaletica e indicazioni",
        "Sicurezza e staff",
        "Altro (Pianificazione)"
      ]
    },
    {
      category: "Location e Allestimento",
      subcategories: [
        "Affitto location/Sala",
        "Deposito cauzionale",
        "Arredamento e allestimento",
        "Decorazioni tema",
        "Fiori e centrotavola",
        "Illuminazione scenografica",
        "Palco/Pedana",
        "Tappeto rosso",
        "Altro (Location)"
      ]
    },
    {
      category: "Catering e Bevande",
      subcategories: [
        "Servizio catering completo",
        "Aperitivo di benvenuto",
        "Cena di gala",
        "Dessert e dolci",
        "Bar e bevande",
        "Servizio sommelier",
        "Personale di sala",
        "Noleggio stoviglie/posate",
        "Altro (Catering)"
      ]
    },
    {
      category: "Intrattenimento e Spettacolo",
      subcategories: [
        "Artisti/Performer principali",
        "Band/Orchestra",
        "DJ",
        "Presentatore/Conduttore",
        "Spettacoli dal vivo",
        "Asta benefica",
        "Intrattenimento bambini",
        "Attività interattive",
        "Altro (Intrattenimento)"
      ]
    },
    {
      category: "Tecnologia Audio/Video",
      subcategories: [
        "Impianto audio",
        "Schermi e proiettori",
        "Luci sceniche",
        "Regia audio/video",
        "Microfoni wireless",
        "Live streaming",
        "Registrazione evento",
        "Presentazioni multimediali",
        "Altro (A/V)"
      ]
    },
    {
      category: "Comunicazione e Promozione",
      subcategories: [
        "Inviti personalizzati",
        "Sito web evento",
        "Social media marketing",
        "Ufficio stampa",
        "Pubblicità",
        "Materiale promozionale",
        "Newsletter",
        "Campagna email",
        "Altro (Comunicazione)"
      ]
    },
    {
      category: "Raccolta Fondi",
      subcategories: [
        "Sistema donazioni online",
        "Lotteria/Tombola",
        "Asta silenziosa",
        "Vendita merchandising",
        "Sponsor e partnership",
        "Benefattori VIP",
        "Gadget beneficenza",
        "Certificati donatori",
        "Altro (Fundraising)"
      ]
    },
    {
      category: "Fotografia e Video",
      subcategories: [
        "Fotografo professionista",
        "Videomaker",
        "Photobooth",
        "Drone riprese aeree",
        "Album foto evento",
        "Streaming live",
        "Time-lapse",
        "Editing video",
        "Altro (Foto/Video)"
      ]
    },
    {
      category: "Ospiti e VIP",
      subcategories: [
        "Guest of honor",
        "Ospiti speciali",
        "Tavoli riservati VIP",
        "Lounge esclusiva",
        "Servizio limousine",
        "Security personale",
        "Gift bag ospiti",
        "Hospitality suite",
        "Altro (VIP)"
      ]
    },
    {
      category: "Registrazione e Check-in",
      subcategories: [
        "Sistema registrazione online",
        "Check-in desk",
        "Badge e pass",
        "Lista ospiti",
        "Tablet/Totem check-in",
        "Personale accoglienza",
        "Welcome pack",
        "Guardaroba",
        "Altro (Registrazione)"
      ]
    },
    {
      category: "Trasporti e Logistica",
      subcategories: [
        "Navetta ospiti",
        "Parcheggio/Valet",
        "Trasporto materiali",
        "Trasporto artisti",
        "Coordinamento logistico",
        "Magazzino temporaneo",
        "Montaggio/Smontaggio",
        "Servizio taxi",
        "Altro (Trasporti)"
      ]
    },
    {
      category: "Materiali e Gadget",
      subcategories: [
        "Merchandising evento",
        "Gadget promozionali",
        "Brochure e cataloghi",
        "Borse personalizzate",
        "Penne e blocchi notes",
        "Roll-up e banner",
        "Espositori",
        "Materiale informativo",
        "Altro (Materiali)"
      ]
    },
    {
      category: "Budget e Amministrazione",
      subcategories: [
        "Riserva imprevisti",
        "Spese amministrative",
        "Consulenza fiscale",
        "Software gestione evento",
        "Contabilità",
        "Report finanziari",
        "Altro (Budget)"
      ]
    }
  ];
}

/**
 * Distribuzione percentuale budget consigliata per evento Charity/Gala
 */
export function getCharityGalaBudgetPercentages() {
  return {
    "Pianificazione e Organizzazione": 10,
    "Location e Allestimento": 20,
    "Catering e Bevande": 25,
    "Intrattenimento e Spettacolo": 15,
    "Tecnologia Audio/Video": 8,
    "Comunicazione e Promozione": 7,
    "Raccolta Fondi": 3,
    "Fotografia e Video": 4,
    "Ospiti e VIP": 3,
    "Registrazione e Check-in": 2,
    "Trasporti e Logistica": 2,
    "Materiali e Gadget": 1
  };
}

/**
 * Timeline completa per evento Charity/Gala
 */
export function getCharityGalaTimeline(): CharityGalaTimelineItem[] {
  return [
    // Fase 1: Pianificazione (12-18 mesi prima)
    { phase: "Pianificazione", item: "Definire obiettivi e causa benefica", timing: "12-18 mesi prima" },
    { phase: "Pianificazione", item: "Formare comitato organizzatore", timing: "12-18 mesi prima" },
    { phase: "Pianificazione", item: "Stabilire budget totale", timing: "12-18 mesi prima" },
    { phase: "Pianificazione", item: "Scegliere data e orario", timing: "12 mesi prima" },
    { phase: "Pianificazione", item: "Prenotare location", timing: "10-12 mesi prima" },
    { phase: "Pianificazione", item: "Assumere event planner (opzionale)", timing: "10-12 mesi prima" },

    // Fase 2: Organizzazione (6-12 mesi prima)
    { phase: "Organizzazione", item: "Definire tema e concept", timing: "9-12 mesi prima" },
    { phase: "Organizzazione", item: "Confermare artisti/intrattenimento", timing: "9-12 mesi prima" },
    { phase: "Organizzazione", item: "Prenotare catering", timing: "8-10 mesi prima" },
    { phase: "Organizzazione", item: "Avviare ricerca sponsor", timing: "8-10 mesi prima" },
    { phase: "Organizzazione", item: "Creare lista ospiti VIP", timing: "8 mesi prima" },
    { phase: "Organizzazione", item: "Lanciare campagna comunicazione", timing: "6-8 mesi prima" },
    { phase: "Organizzazione", item: "Prenotare servizi A/V", timing: "6 mesi prima" },
    { phase: "Organizzazione", item: "Organizzare asta/lotteria", timing: "6 mesi prima" },

    // Fase 3: Comunicazione (3-6 mesi prima)
    { phase: "Comunicazione", item: "Inviare inviti cartacei/digitali", timing: "4-6 mesi prima" },
    { phase: "Comunicazione", item: "Attivare vendita biglietti online", timing: "4-6 mesi prima" },
    { phase: "Comunicazione", item: "Lanciare sito web evento", timing: "4-5 mesi prima" },
    { phase: "Comunicazione", item: "Campagna social media", timing: "3-6 mesi prima" },
    { phase: "Comunicazione", item: "Comunicati stampa", timing: "3-4 mesi prima" },
    { phase: "Comunicazione", item: "Email marketing settimanale", timing: "3-6 mesi prima" },

    // Fase 4: Preparazione (1-3 mesi prima)
    { phase: "Preparazione", item: "Finalizzare menù con catering", timing: "2-3 mesi prima" },
    { phase: "Preparazione", item: "Confermare sponsor e donatori", timing: "2-3 mesi prima" },
    { phase: "Preparazione", item: "Ordinare materiali e gadget", timing: "2 mesi prima" },
    { phase: "Preparazione", item: "Pianificare allestimento location", timing: "1-2 mesi prima" },
    { phase: "Preparazione", item: "Organizzare trasporti e logistica", timing: "1-2 mesi prima" },
    { phase: "Preparazione", item: "Conferme ospiti e seating plan", timing: "1 mese prima" },
    { phase: "Preparazione", item: "Prove tecniche A/V", timing: "2-3 settimane prima" },
    { phase: "Preparazione", item: "Brief staff e volontari", timing: "1-2 settimane prima" },

    // Fase 5: Evento e Follow-up (giorno evento e dopo)
    { phase: "Evento", item: "Allestimento location", timing: "Giorno prima/mattina evento" },
    { phase: "Evento", item: "Check-in ospiti e registrazione", timing: "Giorno evento - apertura" },
    { phase: "Evento", item: "Aperitivo di benvenuto", timing: "Giorno evento - inizio" },
    { phase: "Evento", item: "Cena di gala", timing: "Giorno evento - sera" },
    { phase: "Evento", item: "Intrattenimento e spettacoli", timing: "Giorno evento - durante" },
    { phase: "Evento", item: "Asta benefica e raccolta fondi", timing: "Giorno evento - durante" },
    { phase: "Evento", item: "Ringraziamenti e chiusura", timing: "Giorno evento - fine" },
    { phase: "Follow-up", item: "Smontaggio e pulizia", timing: "Giorno dopo" },
    { phase: "Follow-up", item: "Ringraziamenti ospiti e sponsor", timing: "1 settimana dopo" },
    { phase: "Follow-up", item: "Condivisione foto/video evento", timing: "2 settimane dopo" },
    { phase: "Follow-up", item: "Report finale raccolta fondi", timing: "1 mese dopo" },
    { phase: "Follow-up", item: "Valutazione e feedback", timing: "1-2 mesi dopo" }
  ];
}
