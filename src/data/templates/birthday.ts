// Birthday (Compleanno) template for all ages
// Provides: event fields schema, categories/subcategories, budget guide, timeline, checklist

export type BirthdayEventField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select';
  placeholder?: string;
  options?: string[];
  default?: string | number;
};

// 1) Event fields (form Compleanno)
export const BIRTHDAY_EVENT_FIELDS: BirthdayEventField[] = [
  { key: 'birthdayPersonName', label: 'Nome festeggiato/a', type: 'text', placeholder: 'Es. Marco' },
  { key: 'birthdayAge', label: 'Età compiuta', type: 'number', placeholder: 'Es. 30', default: 30 },
  { key: 'birthdayDob', label: 'Data di nascita', type: 'date' },
  
  { key: 'eventDate', label: 'Data festa', type: 'date' },
  { key: 'eventTime', label: 'Ora inizio festa', type: 'text', placeholder: 'Es. 19:00' },
  
  { key: 'locationName', label: 'Location', type: 'text', placeholder: 'Es. Ristorante La Rosa, Casa, Villa' },
  { key: 'locationAddress', label: 'Indirizzo location', type: 'text' },
  
  { key: 'guestCount', label: 'Numero invitati stimato', type: 'number', default: 30 },
  { key: 'theme', label: 'Tema/Stile', type: 'text', placeholder: 'Es. Tropical, Elegant, Vintage, Kids Party' },
  { key: 'colorScheme', label: 'Colori tema', type: 'text', placeholder: 'Es. Oro e bianco, Pastello, Arcobaleno' },
  
  { key: 'totalBudget', label: 'Budget target (totale)', type: 'number', default: 3000 },
  { key: 'bufferPct', label: 'Buffer (%)', type: 'number', default: 10 },
];

// 2) Categorie & sottocategorie (template)
export type CategoryTemplate = { name: string; subs: string[] };

// ITA – Compleanno (10 categorie, ~51 sottocategorie)
export const BIRTHDAY_TEMPLATE: CategoryTemplate[] = [
  { name: 'Location e Allestimento', subs: [
    'Scelta location',
    'Affitto sala/spazio esterno',
    'Allestimento tavoli e mise en place',
    'Decorazioni a tema',
    'Balloon wall / backdrop',
    'Fiori e centrotavola',
    'Luci decorative e candele',
    'Photobooth / cornice selfie'
  ]},
  { name: 'Catering / Ristorazione', subs: [
    'Pranzo/cena/apericena/buffet',
    'Menù personalizzato',
    'Sweet table / dessert corner',
    'Torta di compleanno',
    'Bevande e cocktail',
    'Servizio catering/locale interno'
  ]},
  { name: 'Inviti e Grafica', subs: [
    'Inviti cartacei/digitali',
    'Tema grafico',
    'Coordinato grafico',
    'Biglietti di ringraziamento',
    'QR code foto/video'
  ]},
  { name: 'Foto e Video', subs: [
    'Fotografo/videomaker',
    'Shooting compleanno',
    'Reel/video social',
    'Polaroid corner',
    'Album digitale/fisico'
  ]},
  { name: 'Musica e Intrattenimento', subs: [
    'DJ / live music',
    'Playlist / sistema audio',
    'Karaoke',
    'Giochi e attività',
    'Animazione bambini (se presente)'
  ]},
  { name: 'Abbigliamento e Beauty', subs: [
    'Outfit festeggiato/a',
    'Accessori',
    'Parrucchiere / trucco',
    'Manicure / estetica'
  ]},
  { name: 'Regali e Ringraziamenti', subs: [
    'Lista regali',
    'Bomboniere o gadget personalizzati',
    'Sacchetti/scatole bomboniere',
    'Biglietti di ringraziamento'
  ]},
  { name: 'Intrattenimento Extra', subs: [
    'Gonfiabili / giochi outdoor',
    'Face painting / truccabimbi',
    'Spettacolo (mago, clown, attore)',
    'Candy bar o angolo dolci personalizzato'
  ]},
  { name: 'Trasporti e Logistica', subs: [
    'Auto per festeggiato/a',
    'Trasporti ospiti',
    'Parcheggio o permessi',
    'Pernottamento ospiti (se milestone importante)'
  ]},
  { name: 'Gestione Budget', subs: [
    'Anticipo location',
    'Anticipo catering',
    'Fondo emergenze',
    'Spese extra impreviste',
    'Budget cuscinetto (10%)',
    'Costi amministrativi'
  ]},
];

// 3) Template per paese (espandibile)
export const BIRTHDAY_TEMPLATES_BY_COUNTRY: Record<string, CategoryTemplate[]> = {
  it: BIRTHDAY_TEMPLATE,
  es: BIRTHDAY_TEMPLATE, // Spain
  fr: BIRTHDAY_TEMPLATE, // France
  uk: BIRTHDAY_TEMPLATE, // UK
  us: BIRTHDAY_TEMPLATE, // USA
  mx: BIRTHDAY_TEMPLATE, // Mexico
  ae: BIRTHDAY_TEMPLATE, // UAE
  in: BIRTHDAY_TEMPLATE, // India
  jp: BIRTHDAY_TEMPLATE, // Japan
};

export function getBirthdayTemplate(country?: string): CategoryTemplate[] {
  const c = (country || '').toLowerCase();
  return BIRTHDAY_TEMPLATES_BY_COUNTRY[c] || BIRTHDAY_TEMPLATE;
}

// 4) Budget percentages (suggeriti)
export const BIRTHDAY_BUDGET_PERCENTAGES: Record<string, number> = {
  'Location e Allestimento': 25,
  'Catering / Ristorazione': 30,
  'Inviti e Grafica': 5,
  'Foto e Video': 12,
  'Musica e Intrattenimento': 10,
  'Abbigliamento e Beauty': 6,
  'Regali e Ringraziamenti': 4,
  'Intrattenimento Extra': 5,
  'Trasporti e Logistica': 3,
  'Gestione Budget': 0,
};

export function getBirthdayBudgetPercentages() {
  return BIRTHDAY_BUDGET_PERCENTAGES;
}

// 5) Timeline / Checklist (2 mesi prima)
export const BIRTHDAY_TIMELINE = [
  {
    phase: '2 MESI PRIMA',
    title: 'Ideazione e pianificazione',
    tasks: [
      'Scegli data e ora della festa',
      'Definisci il tema e lo stile',
      'Crea lista invitati preliminare',
      'Ricerca location (casa, ristorante, sala, parco)',
      'Imposta budget totale nell\'app',
      'Identifica fornitori chiave (catering, fotografo, DJ)',
      'Bozza palette colori e mood',
    ],
  },
  {
    phase: '1 MESE PRIMA',
    title: 'Conferme e fornitori',
    tasks: [
      'Prenota location definitiva',
      'Conferma catering e menu',
      'Invia inviti (cartacei o digitali)',
      'Prenota fotografo/videomaker',
      'Ordina torta personalizzata',
      'Scegli decorazioni e allestimento',
      'Prenota DJ o musica live (se necessario)',
      'Pianifica intrattenimento (giochi, animazione)',
    ],
  },
  {
    phase: '2 SETTIMANE PRIMA',
    title: 'Rifinitura',
    tasks: [
      'Conferma numero invitati definitivo',
      'Ordina bomboniere o gadget',
      'Stampa coordinato grafico (segnaposti, menu, cartelli)',
      'Conferma outfit festeggiato/a',
      'Prenota parrucchiere/trucco',
      'Organizza playlist o richieste musicali',
      'Prepara photobooth/backdrop',
    ],
  },
  {
    phase: '1 SETTIMANA PRIMA',
    title: 'Coordinamento finale',
    tasks: [
      'Riconferma orari con tutti i fornitori',
      'Verifica acconti e saldi',
      'Prepara lista spesa last-minute',
      'Organizza trasporti ospiti (se necessario)',
      'Stampa checklist del giorno',
      'Prepara angolo regali e guestbook',
    ],
  },
  {
    phase: 'GIORNO DELLA FESTA',
    title: 'Celebrazione e divertimento 🎂',
    tasks: [
      'Setup location e allestimento',
      'Accoglienza ospiti',
      'Servizio fotografico',
      'Pranzo/cena/buffet',
      'Torta e candeline',
      'Musica e balli',
      'Consegna bomboniere',
      'Giochi e intrattenimento',
    ],
  },
  {
    phase: 'DOPO LA FESTA',
    title: 'Chiusura e ricordi',
    tasks: [
      'Invia ringraziamenti personalizzati',
      'Raccogli foto e video dagli ospiti',
      'Completa pagamenti finali',
      'Aggiorna bilancio finale in app',
      'Salva ricordi (album, video social)',
    ],
  },
];

// 6) Vendor suggestions (fornitori comuni per compleanni)
export const BIRTHDAY_VENDOR_SUGGESTIONS = {
  'Location e Allestimento': ['Ristoranti', 'Sale eventi', 'Ville e giardini', 'Decoratori', 'Noleggio arredi'],
  'Catering / Ristorazione': ['Catering', 'Pasticceria', 'Ristoranti', 'Food truck', 'Servizio bar'],
  'Inviti e Grafica': ['Grafico freelance', 'Tipografia', 'Stamperia online', 'DIY kit'],
  'Foto e Video': ['Fotografo eventi', 'Videomaker', 'Photobooth noleggio', 'Polaroid service'],
  'Musica e Intrattenimento': ['DJ', 'Band live', 'Karaoke service', 'Animatori', 'Mago/Clown'],
  'Abbigliamento e Beauty': ['Boutique', 'Parrucchiere', 'Makeup artist', 'Estetista'],
  'Regali e Ringraziamenti': ['Bomboniere shop', 'Gadget personalizzati', 'Gift box'],
  'Trasporti e Logistica': ['Noleggio auto con conducente', 'Transfer service'],
};

// 7) Note e consigli
export const BIRTHDAY_TIPS = [
  'Budget medio per compleanno adulto in Italia: 1.500€ - 5.000€ (milestone come 30/40/50: fino a 10.000€+)',
  'Budget compleanno bambino (1-10 anni): 500€ - 2.000€',
  'Considera un buffer del 10% per imprevisti',
  'Location popolari: ristoranti, agriturismi, sale eventi, casa privata, terrazza, parco',
  'Milestone comuni: 18°, 30°, 40°, 50°, 60° compleanno',
  'Temi popolari adulti: Elegant, Tropical, Vintage, Hollywood, Gatsby, White Party',
  'Temi popolari bambini: Principesse, Supereroi, Unicorni, Safari, Mare, Dinosauri',
  'Inviti: spedire 3-4 settimane prima (digitali: 2-3 settimane)',
  'Anticipo fornitori: 30-50% alla prenotazione, saldo entro 7 giorni dall\'evento',
  'Per feste numerose (50+ invitati): considera un event planner',
];

// Export default
const birthdayConfig = {
  fields: BIRTHDAY_EVENT_FIELDS,
  template: BIRTHDAY_TEMPLATE,
  getTemplate: getBirthdayTemplate,
  budgetPercentages: BIRTHDAY_BUDGET_PERCENTAGES,
  timeline: BIRTHDAY_TIMELINE,
  vendors: BIRTHDAY_VENDOR_SUGGESTIONS,
  tips: BIRTHDAY_TIPS,
};

export default birthdayConfig;
