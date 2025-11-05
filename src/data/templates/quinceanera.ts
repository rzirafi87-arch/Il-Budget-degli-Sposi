import type { CategoryTemplate } from "./types";

/**
 * QUINCEAÑERA - 15th Birthday Celebration (Latin American Tradition)
 * Traditional coming-of-age celebration for girls turning 15
 * Budget: €8,000 - €20,000+
 * Country: MX, AR, BR, CO, other Latin American countries
 */

export function getQuinceaneraTemplate(country = "mx"): CategoryTemplate[] {
  return [
    {
      name: "Cerimonia Religiosa",
      subs: [
        "Messa o servizio religioso",
        "Chiesa o tempio - prenotazione",
        "Coordinamento con sacerdote",
        "Bouquet quinceañera",
        "Decorazioni chiesa",
        "Musica cerimonia (coro, organista)",
        "Libretti messa",
        "Offerte e donazioni chiesa",
      ],
    },
    {
      name: "Location Ricevimento",
      subs: [
        "Sala ricevimento o venue",
        "Sopralluogo e caparra",
        "Allestimento spazi",
        "Parcheggi e accessibilità",
        "Permessi e autorizzazioni",
        "Catering e servizio tavola",
      ],
    },
    {
      name: "Abbigliamento Quinceañera",
      subs: [
        "Abito da ballo principale (vestido)",
        "Secondo abito per festa (cambio d'abito)",
        "Corona o tiara",
        "Scarpe eleganti",
        "Gioielli e accessori",
        "Prove abiti e modifiche",
        "Parrucchiere e makeup",
        "Manicure e pedicure",
      ],
    },
    {
      name: "Corte d'Onore (Damas y Chambelanes)",
      subs: [
        "Abiti damas (damigelle)",
        "Abiti chambelanes (cavalieri)",
        "Accessori corte d'onore",
        "Prove coreografie e balli",
        "Coordinamento gruppo",
        "Regalo corte d'onore",
      ],
    },
    {
      name: "Decorazioni e Allestimenti",
      subs: [
        "Tema e concept visivo",
        "Centrotavola e fiori",
        "Palloncini e drappeggi",
        "Arco floreale o backdrop",
        "Illuminazione decorativa",
        "Segnaletica e tableau",
        "Candele (15 candele tradizionali)",
        "Tavolo regali e guestbook",
      ],
    },
    {
      name: "Catering e Torta",
      subs: [
        "Menu completo (pranzo o cena)",
        "Aperitivo o cocktail benvenuto",
        "Torta quinceañera (multi-tier)",
        "Dolci e dessert table",
        "Open bar e bevande",
        "Servizio staff e camerieri",
        "Mise en place e stoviglie",
      ],
    },
    {
      name: "Inviti e Comunicazione",
      subs: [
        "Design inviti personalizzati",
        "Stampa inviti e buste",
        "Save the date",
        "Invio e tracking RSVP",
        "Menu cards e segnaposti",
        "Programma cerimonia",
        "Thank you cards post-evento",
      ],
    },
    {
      name: "Intrattenimento e Musica",
      subs: [
        "DJ o band live",
        "Musica vals tradizionale (waltz quinceañera)",
        "Coreografia vals con padre",
        "Ballo sorpresa con corte d'onore",
        "Animazione e giochi",
        "Photobooth o corner selfie",
        "Video montaggio crescita",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo professionista",
        "Videomaker per highlights",
        "Album fotografico",
        "Servizio foto pre-quinceañera (studio)",
        "Stampa foto in tempo reale",
        "Drone per riprese (se outdoor)",
      ],
    },
    {
      name: "Tradizioni e Simboli",
      subs: [
        "Corona (cambio corona da bambina ad adulta)",
        "Ultima bambola (simbolo infanzia)",
        "15 rose (da familiari e amici)",
        "15 candele (con dediche speciali)",
        "Brindisi champagne (primo bicchiere)",
        "Scarpe (cambio scarpe flat→tacchi)",
        "Libro firme o capsula tempo",
      ],
    },
    {
      name: "Regali e Omaggi",
      subs: [
        "Bomboniere per ospiti",
        "Favors personalizzati",
        "Sacchetti confetti o dolciumi",
        "Regali corte d'onore",
        "Regali padrini/madrine",
        "Guestbook o album firme",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto o limousine quinceañera",
        "Trasferimento chiesa-location",
        "Navetta ospiti",
        "Parcheggi riservati",
        "Coordinamento orari",
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
        "Report finale spese",
      ],
    },
  ];
}

export function getQuinceaneraBudgetPercentages(): Record<string, number> {
  return {
    "Cerimonia Religiosa": 5,
    "Location Ricevimento": 20,
    "Abbigliamento Quinceañera": 15,
    "Corte d'Onore (Damas y Chambelanes)": 12,
    "Decorazioni e Allestimenti": 10,
    "Catering e Torta": 20,
    "Inviti e Comunicazione": 3,
    "Intrattenimento e Musica": 8,
    "Foto e Video": 10,
    "Tradizioni e Simboli": 3,
    "Regali e Omaggi": 2,
    "Trasporti e Logistica": 2,
    "Gestione Budget": 0,
  };
}

export function getQuinceaneraTimeline() {
  return [
    {
      phase: "12+ MESI PRIMA",
      title: "Scegli data quinceañera",
      description: "Pianificazione Iniziale",
      daysBefore: 365,
    },
    {
      phase: "12+ MESI PRIMA",
      title: "Stabilisci budget totale famiglia",
      description: "Pianificazione Iniziale",
      daysBefore: 365,
    },
    {
      phase: "12+ MESI PRIMA",
      title: "Crea lista ospiti preliminare",
      description: "Pianificazione Iniziale",
      daysBefore: 365,
    },
    {
      phase: "12+ MESI PRIMA",
      title: "Prenota chiesa per messa",
      description: "Pianificazione Iniziale",
      daysBefore: 365,
    },
    {
      phase: "12+ MESI PRIMA",
      title: "Seleziona tema e colori festa",
      description: "Pianificazione Iniziale",
      daysBefore: 365,
    },
    {
      phase: "9 MESI PRIMA",
      title: "Seleziona e prenota location ricevimento",
      description: "Location e Fornitori",
      daysBefore: 270,
    },
    {
      phase: "9 MESI PRIMA",
      title: "Ingaggia catering",
      description: "Location e Fornitori",
      daysBefore: 270,
    },
    {
      phase: "9 MESI PRIMA",
      title: "Prenota fotografo e videomaker",
      description: "Location e Fornitori",
      daysBefore: 270,
    },
    {
      phase: "9 MESI PRIMA",
      title: "Inizia ricerca DJ o band",
      description: "Location e Fornitori",
      daysBefore: 270,
    },
    {
      phase: "9 MESI PRIMA",
      title: "Scegli corte d'onore (damas y chambelanes)",
      description: "Location e Fornitori",
      daysBefore: 270,
    },
    {
      phase: "6 MESI PRIMA",
      title: "Ordina abito principale quinceañera",
      description: "Abiti e Dettagli",
      daysBefore: 180,
    },
    {
      phase: "6 MESI PRIMA",
      title: "Design e ordine inviti",
      description: "Abiti e Dettagli",
      daysBefore: 180,
    },
    {
      phase: "6 MESI PRIMA",
      title: "Prenota DJ/band",
      description: "Abiti e Dettagli",
      daysBefore: 180,
    },
    {
      phase: "6 MESI PRIMA",
      title: "Pianifica coreografie vals e ballo sorpresa",
      description: "Abiti e Dettagli",
      daysBefore: 180,
    },
    {
      phase: "6 MESI PRIMA",
      title: "Ordina abiti corte d'onore",
      description: "Abiti e Dettagli",
      daysBefore: 180,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Invia inviti ufficiali",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Tracking RSVP",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Conferma menu con catering",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Inizia prove vals con padre e chambelanes",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Ordina decorazioni e fiori",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "3 MESI PRIMA",
      title: "Prepara video montaggio crescita",
      description: "Comunicazione e Prove",
      daysBefore: 90,
    },
    {
      phase: "1 MESE PRIMA",
      title: "Prove abiti e modifiche finali",
      description: "Rifinitura",
      daysBefore: 30,
    },
    {
      phase: "1 MESE PRIMA",
      title: "Finalizza numero ospiti e tableau",
      description: "Rifinitura",
      daysBefore: 30,
    },
    {
      phase: "1 MESE PRIMA",
      title: "Conferma tutti fornitori",
      description: "Rifinitura",
      daysBefore: 30,
    },
    {
      phase: "1 MESE PRIMA",
      title: "Prove generali vals e ballo sorpresa",
      description: "Rifinitura",
      daysBefore: 30,
    },
    {
      phase: "1 MESE PRIMA",
      title: "Ordina torta quinceañera",
      description: "Rifinitura",
      daysBefore: 30,
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Ultima prova vals",
      description: "Controlli Finali",
      daysBefore: 7,
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Conferma orari con tutti fornitori",
      description: "Controlli Finali",
      daysBefore: 7,
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Prepara kit emergenza",
      description: "Controlli Finali",
      daysBefore: 7,
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Ritira abiti e accessori",
      description: "Controlli Finali",
      daysBefore: 7,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Messa di ringraziamento",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Cerimonia cambio corona",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Vals tradizionale con padre",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Ballo sorpresa con corte d'onore",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Cena celebrativa",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Taglio torta e festeggiamenti",
      description: "Feliz Quinceañera!",
      daysBefore: 0,
    },
    {
      phase: "POST-EVENTO",
      title: "Invia thank you cards",
      description: "Ringraziamenti",
      daysBefore: -7,
    },
    {
      phase: "POST-EVENTO",
      title: "Ricevi foto e video finali",
      description: "Ringraziamenti",
      daysBefore: -7,
    },
  ];
}

export function getQuinceaneraFields() {
  return [
    {
      key: "theme",
      label: "Tema festa",
      type: "text" as const,
      placeholder: "es. 'Fairy Tale', 'Masquerade', 'Garden Party'",
      required: false,
    },
    {
      key: "color_scheme",
      label: "Schema colori",
      type: "text" as const,
      placeholder: "es. 'Rosa e oro', 'Viola e argento'",
      required: false,
    },
    {
      key: "church_name",
      label: "Nome chiesa/tempio",
      type: "text" as const,
      required: false,
    },
    {
      key: "court_size",
      label: "Numero corte d'onore (totale damas + chambelanes)",
      type: "number" as const,
      placeholder: "14",
      required: false,
    },
    {
      key: "vals_song",
      label: "Canzone vals tradizionale",
      type: "text" as const,
      placeholder: "es. 'Tiempo de Vals'",
      required: false,
    },
    {
      key: "surprise_dance_song",
      label: "Canzone ballo sorpresa",
      type: "text" as const,
      required: false,
    },
  ];
}

export function getQuinceaneraVendorSuggestions() {
  return {
    "Abbigliamento Quinceañera": [
      "Atelier specializzati quinceañera",
      "Negozi abiti da cerimonia",
      "Boutique sposa e quinceañera",
    ],
    "Corte d'Onore (Damas y Chambelanes)": [
      "Negozi abiti formali",
      "Rental abiti da cerimonia",
      "Atelier personalizzati",
    ],
    "Catering e Torta": [
      "Catering latinoamericano",
      "Pasticcerie specializzate torte evento",
      "Ristoranti con servizio catering",
    ],
    "Intrattenimento e Musica": [
      "DJ specializzati quinceañeras",
      "Band mariachi (se tradizione messicana)",
      "Coreografi vals e balli",
    ],
    "Decorazioni e Allestimenti": [
      "Wedding planner / Event designer",
      "Fioristi specializzati eventi",
      "Noleggio decorazioni tema",
    ],
    "Foto e Video": [
      "Fotografi quinceañera experience",
      "Videomaker eventi sociali",
      "Photobooth rental",
    ],
  };
}
