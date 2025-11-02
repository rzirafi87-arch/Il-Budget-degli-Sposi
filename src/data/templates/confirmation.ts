// Confirmation (Cresima) template for Italy
// Provides: event fields schema, categories/subcategories, budget guide, timeline, checklist

export type ConfirmationEventField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select';
  placeholder?: string;
  options?: string[];
  default?: string | number;
};

// 1) Event fields (form Cresima)
export const CONFIRMATION_EVENT_FIELDS: ConfirmationEventField[] = [
  { key: 'confirmandName', label: 'Nome cresimando/a', type: 'text', placeholder: 'Es. Marco' },
  { key: 'confirmandDob', label: 'Data di nascita', type: 'date' },
  
  { key: 'eventDate', label: 'Data Cresima', type: 'date' },
  { key: 'eventTime', label: 'Ora cerimonia', type: 'text', placeholder: 'Es. 11:00' },
  
  { key: 'parishName', label: 'Parrocchia (nome)', type: 'text', placeholder: 'Es. Parrocchia San Giuseppe' },
  { key: 'parishAddress', label: 'Indirizzo chiesa', type: 'text' },
  
  { key: 'godparentName', label: 'Padrino/Madrina', type: 'text', placeholder: 'Es. Mario Rossi' },
  
  { key: 'locationName', label: 'Location ricevimento', type: 'text', placeholder: 'Es. Ristorante La Rosa' },
  { key: 'locationAddress', label: 'Indirizzo location', type: 'text' },
  
  { key: 'guestCount', label: 'Numero invitati stimato', type: 'number', default: 40 },
  { key: 'theme', label: 'Tema/Colori', type: 'text', placeholder: 'Es. Bianco e azzurro, Tortora e oro' },
  
  { key: 'totalBudget', label: 'Budget target (totale)', type: 'number', default: 0 },
  { key: 'bufferPct', label: 'Buffer (%)', type: 'number', default: 10 },
];

// 2) Categorie & sottocategorie (template)
export type CategoryTemplate = { name: string; subs: string[] };

// ITA – Cresima (10 categorie, ~42 sottocategorie)
export const CONFIRMATION_TEMPLATE: CategoryTemplate[] = [
  { name: 'Cerimonia Religiosa', subs: [
    'Prenotazione chiesa / oratorio',
    'Scelta padrino / madrina',
    'Offerta per la parrocchia',
    'Documentazione e pratiche religiose',
    'Coroncina, Bibbia, rosario o simboli sacri',
    'Fotografo in chiesa (permessi + servizio)',
    'Decorazioni floreali per altare e panche'
  ]},
  { name: 'Location e Ricevimento', subs: [
    'Scelta location (ristorante, agriturismo, casa, sala)',
    'Allestimento tavoli e mise en place',
    'Decorazioni a tema (colori tenui, simboli religiosi)',
    'Tableau / segnaposti / menù personalizzati',
    'Bomboniere o ricordi per invitati',
    'Angolo foto o backdrop'
  ]},
  { name: 'Catering e Ristorazione', subs: [
    'Menù adulti',
    'Menù bambini',
    'Torta e pasticceria personalizzata',
    'Bevande e brindisi',
    'Servizio catering o ristorante'
  ]},
  { name: 'Abbigliamento e Beauty', subs: [
    'Abito del cresimando/a',
    'Scarpe e accessori',
    'Parrucchiere / trucco leggero',
    'Outfit genitori e padrino/madrina'
  ]},
  { name: 'Foto e Video', subs: [
    'Servizio fotografico in chiesa',
    'Shooting post-cerimonia (giardino o location)',
    'Album fotografico / cornice digitale',
    'Video breve ricordo'
  ]},
  { name: 'Inviti e Grafica', subs: [
    'Partecipazioni cartacee o digitali',
    'Biglietti di ringraziamento',
    'Segnaposto e menù stampati',
    'Coordinato grafico (font, simbolo, colore tema)'
  ]},
  { name: 'Regali e Ringraziamenti', subs: [
    'Lista regali o busta',
    'Biglietti di ringraziamento personalizzati',
    'Confezioni bomboniere',
    'Angolo dediche o guestbook'
  ]},
  { name: 'Trasporti e Logistica', subs: [
    'Auto per il cresimando',
    'Spostamenti familiari / ospiti',
    'Parcheggi o permessi',
    'Eventuale pernottamento ospiti lontani'
  ]},
  { name: 'Servizi Extra', subs: [
    'Musica di sottofondo o piccolo intrattenimento',
    'Animazione bambini (se presenti)',
    'Pulizia post-evento',
    'Sicurezza o assistenza evento'
  ]},
  { name: 'Imprevisti e Contingenze', subs: [
    'Fondo emergenze',
    'Spese extra impreviste',
    'Budget cuscinetto (10%)'
  ]},
];

// 3) Template per paese (espandibile)
export const CONFIRMATION_TEMPLATES_BY_COUNTRY: Record<string, CategoryTemplate[]> = {
  it: CONFIRMATION_TEMPLATE,
  es: CONFIRMATION_TEMPLATE, // Spain
  fr: CONFIRMATION_TEMPLATE, // France
  uk: CONFIRMATION_TEMPLATE, // UK
  us: CONFIRMATION_TEMPLATE, // USA
  mx: CONFIRMATION_TEMPLATE, // Mexico
  ae: CONFIRMATION_TEMPLATE, // UAE
  in: CONFIRMATION_TEMPLATE, // India
  jp: CONFIRMATION_TEMPLATE, // Japan
};

export function getConfirmationTemplate(country?: string): CategoryTemplate[] {
  const c = (country || '').toLowerCase();
  return CONFIRMATION_TEMPLATES_BY_COUNTRY[c] || CONFIRMATION_TEMPLATE;
}

// 4) Budget percentages (suggeriti)
export const CONFIRMATION_BUDGET_PERCENTAGES: Record<string, number> = {
  'Cerimonia Religiosa': 15,
  'Location e Ricevimento': 20,
  'Catering e Ristorazione': 30,
  'Abbigliamento e Beauty': 12,
  'Foto e Video': 10,
  'Inviti e Grafica': 4,
  'Regali e Ringraziamenti': 5,
  'Trasporti e Logistica': 2,
  'Servizi Extra': 2,
  'Imprevisti e Contingenze': 0,
};

export function getConfirmationBudgetPercentages() {
  return CONFIRMATION_BUDGET_PERCENTAGES;
}

// 5) Timeline / Checklist (2-3 mesi prima)
export const CONFIRMATION_TIMELINE = [
  {
    phase: '2-3 MESI PRIMA',
    title: 'Pianificazione e prenotazioni',
    tasks: [
      'Fissa data e chiesa (verifica calendario parrocchiale)',
      'Scegli padrino o madrina',
      'Inizia il corso di preparazione (se previsto)',
      'Contatta fotografo e/o videomaker',
      'Scegli location ricevimento e blocca la data',
      'Scegli il tema grafico e colori',
      'Inizia la ricerca dell\'abito',
      'Imposta il budget nell\'app',
    ],
  },
  {
    phase: '1 MESE PRIMA',
    title: 'Conferme e dettagli',
    tasks: [
      'Invia inviti agli ospiti',
      'Conferma fiorista per chiesa e tavoli',
      'Scegli il menù o conferma catering',
      'Ordina bomboniere e materiale grafico',
      'Conferma orari e modalità fotografo',
      'Definisci mezzi di trasporto per chiesa e ricevimento',
    ],
  },
  {
    phase: '2 SETTIMANE PRIMA',
    title: 'Rifinitura',
    tasks: [
      'Prova abito',
      'Conferma trucco / parrucchiere',
      'Invia conferme definitive fornitori',
      'Ritira o prepara simboli religiosi (croce, candela, Bibbia)',
      'Ordina la torta',
      'Completa segnaposti, menù e cartellini bomboniere',
    ],
  },
  {
    phase: '1 SETTIMANA PRIMA',
    title: 'Coordinamento finale',
    tasks: [
      'Verifica orari con parrocchia',
      'Controlla acconti e saldi fornitori',
      'Prepara le bomboniere',
      'Organizza eventuale trasporto ospiti',
      'Stampa la checklist del giorno',
    ],
  },
  {
    phase: 'GIORNO DELLA CRESIMA',
    title: 'Celebrazione e festa ✨',
    tasks: [
      'Preparazione mattutina (trucco, abito, dettagli)',
      'Cerimonia in chiesa',
      'Servizio foto/video',
      'Ricevimento o pranzo',
      'Consegna bomboniere e ringraziamenti',
      'Piccolo intrattenimento o giochi',
    ],
  },
  {
    phase: 'DOPO L\'EVENTO',
    title: 'Chiusura e ricordi',
    tasks: [
      'Invia ringraziamenti personalizzati',
      'Raccogli foto e video',
      'Completa pagamenti',
      'Aggiorna bilancio finale in app',
    ],
  },
];

// 6) Vendor suggestions (fornitori comuni per cresima)
export const CONFIRMATION_VENDOR_SUGGESTIONS = {
  'Cerimonia Religiosa': ['Fiorista chiesa', 'Fotografo eventi religiosi', 'Articoli religiosi'],
  'Location e Ricevimento': ['Ristoranti', 'Agriturismi', 'Sale ricevimenti', 'Noleggio arredi'],
  'Catering e Ristorazione': ['Catering', 'Pasticceria', 'Servizio ristorazione'],
  'Abbigliamento e Beauty': ['Atelier', 'Parrucchiere', 'Estetista'],
  'Foto e Video': ['Fotografo eventi', 'Videomaker', 'Album fotografici'],
  'Inviti e Grafica': ['Grafico', 'Tipografia', 'Stamperia online'],
  'Trasporti e Logistica': ['Noleggio auto con conducente', 'Transfer service'],
};

// 7) Note e consigli
export const CONFIRMATION_TIPS = [
  'Budget medio per una Cresima in Italia: 2.000€ - 6.000€ (dipende da location e numero invitati)',
  'Considera un buffer del 10% per imprevisti',
  'Location: ristoranti, agriturismi, sale parrocchiali, casa privata, giardino',
  'Colori popolari: Bianco/azzurro, tortora/oro, verde salvia, rosa antico',
  'Periodo: primavera (aprile-giugno) è il più comune per le Cresime',
  'Invitati medi: 30-80 persone (più contenuto del matrimonio)',
  'Anticipo fornitori: 30% alla prenotazione, saldo entro 7 giorni dall\'evento',
  'Età tipica: 11-14 anni (varia per diocesi)',
  'Documenti necessari: certificato battesimo, lettera padrino/madrina',
  'Corso di preparazione: solitamente 1-2 anni prima',
];

// Export default
const confirmationConfig = {
  fields: CONFIRMATION_EVENT_FIELDS,
  template: CONFIRMATION_TEMPLATE,
  getTemplate: getConfirmationTemplate,
  budgetPercentages: CONFIRMATION_BUDGET_PERCENTAGES,
  timeline: CONFIRMATION_TIMELINE,
  vendors: CONFIRMATION_VENDOR_SUGGESTIONS,
  tips: CONFIRMATION_TIPS,
};

export default confirmationConfig;