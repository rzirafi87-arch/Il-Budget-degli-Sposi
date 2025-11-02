// Eighteenth (Diciottesimo) template for Italy
// Provides: event fields schema, categories/subcategories, budget guide, timeline, checklist
// Based on modern 18th birthday party planning

export type EighteenthEventField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select';
  placeholder?: string;
  options?: string[];
  default?: string | number;
};

// 1) Event fields (form Diciottesimo)
export const EIGHTEENTH_EVENT_FIELDS: EighteenthEventField[] = [
  { key: 'birthdayPersonName', label: 'Nome festeggiato/a', type: 'text', placeholder: 'Es. Sofia' },
  { key: 'birthdayDate', label: 'Data di nascita', type: 'date' },
  
  { key: 'eventDate', label: 'Data festa', type: 'date' },
  { key: 'eventTime', label: 'Ora inizio', type: 'text', placeholder: 'Es. 19:00' },
  
  { key: 'locationName', label: 'Location (nome)', type: 'text', placeholder: 'Es. Villa Rose' },
  { key: 'locationAddress', label: 'Location (indirizzo)', type: 'text' },
  
  { key: 'guestCount', label: 'Numero invitati stimato', type: 'number', default: 50 },
  { key: 'theme', label: 'Tema festa', type: 'text', placeholder: 'Es. Gold Party, Natural Chic, Movie Night' },
  
  { key: 'totalBudget', label: 'Budget target (totale)', type: 'number', default: 0 },
  { key: 'bufferPct', label: 'Buffer (%)', type: 'number', default: 15 },
];

// 2) Categorie & sottocategorie (template)
export type CategoryTemplate = { name: string; subs: string[] };

// ITA – Diciottesimo (11 categorie, ~45 sottocategorie)
export const EIGHTEENTH_TEMPLATE: CategoryTemplate[] = [
  { name: 'Location e Allestimento', subs: [
    'Affitto sala / locale / villa / terrazza',
    'Permessi o affitto spazi pubblici',
    'Allestimento tematico (balloon, backdrop, luci LED)',
    'Arredi e noleggi (tavoli, sedie, divanetti)',
    'Addobbi floreali o naturali',
    'Allestimento tavoli e mise en place'
  ]},
  { name: 'Catering / Cibo e Bevande', subs: [
    'Catering completo o buffet',
    'Aperitivo / Welcome drink',
    'Torta di compleanno',
    'Pasticceria e dolci personalizzati',
    'Bevande analcoliche / cocktail bar',
    'Sommelier o barman'
  ]},
  { name: 'Abbigliamento e Beauty', subs: [
    'Abito / outfit principale',
    'Cambio abito (per ballo o party)',
    'Trucco e parrucco',
    'Accessori (scarpe, gioielli, giacca, borsa)',
    'Servizio estetico o parrucchiere a domicilio'
  ]},
  { name: 'Foto e Video', subs: [
    'Fotografo professionista',
    'Videomaker / Reelmaker',
    'Polaroid corner / Photo booth / Specchio magico',
    'Album o video ricordo'
  ]},
  { name: 'Musica e Intrattenimento', subs: [
    'DJ o band live',
    'Service audio e luci',
    'Animatore / Presentatore',
    'Artisti speciali (sax, violinista, performer LED)',
    'Fuochi freddi o effetti speciali',
    'Karaoke o open mic'
  ]},
  { name: 'Inviti e Grafica', subs: [
    'Partecipazioni digitali o cartacee',
    'Biglietti d\'invito con QR code',
    'Grafica personalizzata / logo evento',
    'Tableau, segnaposti, menù, cartellonistica'
  ]},
  { name: 'Regali e Ringraziamenti', subs: [
    'Lista regali o "Money box" digitale',
    'Bomboniere o gift bag per gli invitati',
    'Biglietti di ringraziamento / messaggi personalizzati'
  ]},
  { name: 'Trasporti e Logistica', subs: [
    'Servizio navetta per ospiti',
    'Auto per l\'arrivo del festeggiato',
    'Parcheggi o permessi comunali',
    'Pernottamento ospiti (se fuori sede)'
  ]},
  { name: 'Servizi Extra', subs: [
    'Bodyguard o sicurezza',
    'Baby-sitter (se ospiti piccoli)',
    'Assicurazione evento',
    'Pulizia post-party',
    'Gestione permessi SIAE / musica live'
  ]},
  { name: 'Comunicazione e Social', subs: [
    'Hashtag e pagina evento',
    'Gestione stories / reels live',
    'Reel post-evento',
    'Area social sharing (QR code o link)'
  ]},
  { name: 'Imprevisti e Contingenze', subs: [
    'Fondo emergenze',
    'Spese impreviste',
    'Budget cuscinetto (10-15%)'
  ]},
];

// 3) Template per paese (espandibile)
export const EIGHTEENTH_TEMPLATES_BY_COUNTRY: Record<string, CategoryTemplate[]> = {
  it: EIGHTEENTH_TEMPLATE,
  es: EIGHTEENTH_TEMPLATE, // Spain - similar structure
  fr: EIGHTEENTH_TEMPLATE, // France
  uk: EIGHTEENTH_TEMPLATE, // UK - "18th birthday"
  us: EIGHTEENTH_TEMPLATE, // USA
  mx: EIGHTEENTH_TEMPLATE, // Mexico - "Fiesta de 18"
  ae: EIGHTEENTH_TEMPLATE, // UAE
  in: EIGHTEENTH_TEMPLATE, // India
  jp: EIGHTEENTH_TEMPLATE, // Japan - "Seijin no Hi" adaptation
};

export function getEighteenthTemplate(country?: string): CategoryTemplate[] {
  const c = (country || '').toLowerCase();
  return EIGHTEENTH_TEMPLATES_BY_COUNTRY[c] || EIGHTEENTH_TEMPLATE;
}

// 4) Budget percentages (suggeriti)
export const EIGHTEENTH_BUDGET_PERCENTAGES: Record<string, number> = {
  'Location e Allestimento': 20,
  'Catering / Cibo e Bevande': 25,
  'Abbigliamento e Beauty': 10,
  'Foto e Video': 12,
  'Musica e Intrattenimento': 15,
  'Inviti e Grafica': 4,
  'Regali e Ringraziamenti': 3,
  'Trasporti e Logistica': 3,
  'Servizi Extra': 3,
  'Comunicazione e Social': 2,
  'Imprevisti e Contingenze': 3,
};

export function getEighteenthBudgetPercentages() {
  return EIGHTEENTH_BUDGET_PERCENTAGES;
}

// 5) Timeline / Checklist (2-3 mesi prima)
export const EIGHTEENTH_TIMELINE = [
  {
    phase: '2-3 MESI PRIMA',
    title: 'Ideazione e pianificazione',
    tasks: [
      'Definisci il budget complessivo',
      'Scegli la location (villa, locale, terrazza, spiaggia)',
      'Fissa la data e verifica disponibilità fornitori',
      'Scegli il tema o stile (Natural Chic, Gold Party, Black & White, Movie Night)',
      'Prenota fotografo e/o videomaker',
      'Scegli DJ / band / intrattenimento',
      'Contatta il catering o pasticceria per preventivo',
      'Inizia a cercare outfit e accessori',
      'Decidi numero invitati e imposta bozza inviti',
      'Eventuale prenotazione SIAE / permessi comunali se evento pubblico',
    ],
  },
  {
    phase: '1 MESE PRIMA',
    title: 'Conferme e dettagli',
    tasks: [
      'Invia gli inviti ufficiali (WhatsApp, mail, cartacei o QR)',
      'Versa gli acconti ai fornitori principali (location, catering, musica)',
      'Scegli torta e dolci personalizzati',
      'Conferma make-up artist e parrucchiere',
      'Prenota eventuale allestimento (balloon wall, neon name, photo corner)',
      'Organizza shooting pre-party se previsto',
      'Scegli bomboniere / gift bag / gadget',
      'Se necessario, prenota navetta / auto festeggiato / parcheggi',
    ],
  },
  {
    phase: '2 SETTIMANE PRIMA',
    title: 'Definizione operativa',
    tasks: [
      'Conferma numero invitati definitivo',
      'Invia brief ai fornitori con orari e dettagli logistici',
      'Decidi ordine temporale della serata (arrivo → brindisi → cena → ballo → torta → party)',
      'Prepara materiale personalizzato (cartelli, menù, segnaposti, tableau)',
      'Stampa o prepara checklist fornitori e pagamenti finali',
      'Imposta lista regali o "money box" digitale (anche tramite QR)',
    ],
  },
  {
    phase: '1 SETTIMANA PRIMA',
    title: 'Rifinitura',
    tasks: [
      'Prova finale abito, trucco e parrucco',
      'Verifica pagamenti residui e acconti',
      'Ultima riunione / call con tutti i fornitori',
      'Inizia decorazioni e allestimento base (se location accessibile)',
      'Prova generale di entrata / taglio torta / discorso / ballo',
      'Carica fotocamere, luci, powerbank',
    ],
  },
  {
    phase: 'GIORNO DELL\'EVENTO',
    title: 'La festa 🎉',
    tasks: [
      'Mattina: beauty routine e preparazione',
      'Pomeriggio: trucco, parrucco, vestizione, shooting pre-evento',
      'Arrivo ospiti, musica e aperitivo',
      'Brindisi di benvenuto e presentazione',
      'Cena / buffet / show cooking',
      'Giochi o sorprese (video amici, proiezione ricordi)',
      'Taglio torta e discorso',
      'Party / DJ set fino a chiusura',
      'Ultime foto e saluti',
    ],
  },
  {
    phase: 'POST-EVENTO',
    title: 'Il giorno dopo / Settimana successiva',
    tasks: [
      'Invia ringraziamenti digitali o cartoline',
      'Ritiro o riconsegna materiale noleggiato',
      'Completa saldo fornitori',
      'Raccogli e condividi foto / video (anche tramite QR personalizzato)',
      'Aggiorna bilancio finale (budget stimato vs speso)',
    ],
  },
];

// 6) Vendor suggestions (fornitori comuni per diciottesimo)
export const EIGHTEENTH_VENDOR_SUGGESTIONS = {
  'Location e Allestimento': ['Location per eventi', 'Noleggio arredi', 'Fiorista', 'Balloon artist'],
  'Catering / Cibo e Bevande': ['Catering', 'Pasticceria', 'Barman', 'Servizio beverage'],
  'Abbigliamento e Beauty': ['Atelier', 'Parrucchiere', 'Make-up artist', 'Estetista'],
  'Foto e Video': ['Fotografo eventi', 'Videomaker', 'Photo booth service', 'Drone operator'],
  'Musica e Intrattenimento': ['DJ', 'Band live', 'Service audio/luci', 'Animatore', 'Performer'],
  'Inviti e Grafica': ['Grafico', 'Tipografia', 'Stamperia online', 'Wedding designer (adattabile)'],
  'Trasporti e Logistica': ['Noleggio auto con conducente', 'Navetta privata', 'Transfer service'],
  'Servizi Extra': ['Servizio sicurezza', 'Baby-sitter', 'Assicurazione eventi', 'Impresa pulizie'],
  'Comunicazione e Social': ['Social media manager', 'Fotografo per social', 'Video editor', 'Content creator'],
};

// 7) Note e consigli
export const EIGHTEENTH_TIPS = [
  'Budget medio per un diciottesimo in Italia: 3.000€ - 15.000€ (dipende da location e numero invitati)',
  'Considera un buffer del 10-15% per imprevisti',
  'Location: ville, agriturismi, sale eventi, beach club, locali notturni',
  'Tema popolare: Gold/Black, Natural Chic, Boho, Movie Night, Neon Party, Vintage',
  'Periodo migliore: primavera/estate (aprile-settembre) per eventi all\'aperto',
  'Invitati medi: 50-150 persone',
  'Anticipo fornitori: 30-50% alla prenotazione, saldo entro 7 giorni dall\'evento',
  'Social: crea hashtag unico (#Sofia18Party) e pagina evento per condivisione foto',
  'Photo booth e polaroid corner sono must-have per i diciottesimi moderni',
];

// Export default
const eighteenthConfig = {
  fields: EIGHTEENTH_EVENT_FIELDS,
  template: EIGHTEENTH_TEMPLATE,
  getTemplate: getEighteenthTemplate,
  budgetPercentages: EIGHTEENTH_BUDGET_PERCENTAGES,
  timeline: EIGHTEENTH_TIMELINE,
  vendors: EIGHTEENTH_VENDOR_SUGGESTIONS,
  tips: EIGHTEENTH_TIPS,
};

export default eighteenthConfig;
