// Baptism (Battesimo) template for Italy
// Provides: event fields schema, categories/subcategories, budget guide, vendors, checklist, notes
// And a seed helper compatible with Supabase JS client

export type BaptismEventField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select';
  placeholder?: string;
  options?: string[];
  default?: string | number;
};

// 1) Event fields (form Battesimo)
export const BAPTISM_EVENT_FIELDS: BaptismEventField[] = [
  { key: 'childName', label: 'Nome bimbo/a', type: 'text', placeholder: 'Es. Sofia' },
  { key: 'childDob', label: 'Data di nascita', type: 'date' },

  { key: 'parishName', label: 'Parrocchia (nome)', type: 'text', placeholder: 'Es. Parrocchia San Marco' },
  { key: 'parishContact', label: 'Parrocchia (contatto)', type: 'text', placeholder: 'Telefono / Email' },
  { key: 'ceremonyDateTime', label: 'Data/Ora cerimonia', type: 'datetime' },

  { key: 'godparentName', label: 'Padrino/Madrina (nome)', type: 'text' },
  { key: 'godparentContact', label: 'Padrino/Madrina (contatto)', type: 'text' },

  { key: 'guestsAdults', label: 'Invitati adulti', type: 'number', default: 0 },
  { key: 'guestsChildren', label: 'Invitati bambini', type: 'number', default: 0 },

  { key: 'theme', label: 'Palette / tema', type: 'select', options: ['bianco-azzurro', 'salvia', 'beige', 'cipria', 'verde salvia', 'celeste', 'personalizzato'] },

  { key: 'totalBudget', label: 'Budget target (totale)', type: 'number', default: 0 },
  { key: 'bufferPct', label: 'Buffer (%)', type: 'number', default: 10 },
];

// 2) Categorie & sottocategorie (template)
export type CategoryTemplate = { name: string; subs: string[] };

// ITA – Battesimo
export const BAPTISM_TEMPLATE: CategoryTemplate[] = [
  { name: 'Cerimonia', subs: [
    'Offerta parrocchia',
    'Registro/Certificati',
    'Candele battesimali',
    'Vestina/Stola battesimale',
    'Allestimento fonte (tulle/nastrini)'
  ]},
  { name: 'Abbigliamento', subs: [
    'Outfit bimbo/a',
    'Scarpine/Cuffietta',
    'Cambio/Body',
    'Genitori/Padrini – outfit'
  ]},
  { name: 'Fiori & Decor', subs: [
    'Fiori chiesa',
    'Allestimento tavolo torta',
    'Centrotavola',
    'Palloncini/Backdrop (kids)'
  ]},
  { name: 'Inviti & Stationery', subs: [
    'Inviti',
    'Biglietti ringraziamento',
    'Cartellini bomboniere',
    'Segnaposto/Menu'
  ]},
  { name: 'Ricevimento/Location', subs: [
    'Location/Pranzo',
    'Aperitivo/Welcome',
    'Torta battesimale',
    'Pasticceria/Dolci',
    'Confettata'
  ]},
  { name: 'Foto & Video', subs: [
    'Servizio fotografico cerimonia',
    'Servizio ricevimento',
    'Album/Stampate'
  ]},
  { name: 'Bomboniere & Cadeau', subs: [
    'Bomboniere',
    'Confetti',
    'Packaging/Nastri/Sigilli'
  ]},
  { name: 'Intrattenimento', subs: [
    'Animazione bambini',
    'Giochi/Gonfiabili',
    'Musica/SIAE'
  ]},
  { name: 'Logistica & Servizi', subs: [
    'Trasporti/Parcheggio',
    'Baby-sitter',
    'Pulizie post-evento'
  ]},
];

// Varianti per nazione: per ora replica l'Italia per tutte le nazioni supportate,
// ma consente estensioni future specifiche per paese.
export const BAPTISM_TEMPLATES_BY_COUNTRY: Record<string, CategoryTemplate[]> = {
  it: BAPTISM_TEMPLATE,
  mx: BAPTISM_TEMPLATE,
  es: BAPTISM_TEMPLATE,
  fr: BAPTISM_TEMPLATE,
  in: BAPTISM_TEMPLATE,
  jp: BAPTISM_TEMPLATE,
  uk: BAPTISM_TEMPLATE,
  ae: BAPTISM_TEMPLATE,
  us: BAPTISM_TEMPLATE,
};

export function getBaptismTemplate(country?: string): CategoryTemplate[] {
  const c = (country || '').toLowerCase();
  return BAPTISM_TEMPLATES_BY_COUNTRY[c] || BAPTISM_TEMPLATE;
}

// 3) Percentuali budget (guida iniziale)
export type PercentageRange = { min: number; max: number };
export const BAPTISM_BUDGET_PERCENTAGES: Record<string, PercentageRange> = {
  'Cerimonia': { min: 10, max: 15 },
  'Abbigliamento': { min: 8, max: 12 },
  'Fiori & Decor': { min: 8, max: 10 },
  'Inviti & Stationery': { min: 3, max: 5 },
  'Ricevimento/Location': { min: 35, max: 45 },
  'Foto & Video': { min: 8, max: 12 },
  'Bomboniere & Cadeau': { min: 8, max: 10 },
  'Intrattenimento': { min: 5, max: 8 },
  'Logistica & Servizi': { min: 3, max: 5 },
  'Fondo imprevisti (extra)': { min: 5, max: 10 },
};

export function getBaptismBudgetPercentages(_country?: string) {
  return BAPTISM_BUDGET_PERCENTAGES;
}

// 4) Tipi di fornitori (per directory / anagrafiche)
export const BAPTISM_VENDOR_TYPES: string[] = [
  'Parrocchia / Celebrante',
  'Fiorista / Balloon designer',
  'Tipografia / Calligrafa / Stationery',
  'Ristorante / Catering / Pasticceria',
  'Fotografo (family/kids) / Videomaker',
  'Bomboniere / Confetti (artigiani)',
  'Animazione bambini / Gonfiabili / Musica',
  'Noleggi / Trasporti / Baby-sitter',
];

// 5) Checklist & timeline (rapida)
export type ChecklistItem = {
  title: string;
  details?: string;
  weeksBefore: number; // relative to ceremony date
};

export const BAPTISM_CHECKLIST: ChecklistItem[] = [
  { title: 'Definisci parrocchia e data; conferma padrini', weeksBefore: 8 },
  { title: 'Stima budget, tema e palette', weeksBefore: 8 },
  { title: 'Prenota location/ristorante; fotografo', weeksBefore: 6 },

  { title: 'Ordina inviti / bomboniere / confetti', weeksBefore: 5 },
  { title: 'Scegli outfit bimbo/a e genitori', weeksBefore: 4 },
  { title: 'Pianifica fiori e decor (chiesa + torta)', weeksBefore: 4 },

  { title: 'Conferma numero invitati → ristorante', weeksBefore: 3 },
  { title: 'Ordina torta; definisci confettata', weeksBefore: 3 },
  { title: 'Stampa stationery (segnaposto/menu)', weeksBefore: 2 },

  { title: 'Consegna bomboniere; ritiro outfit e stampa', weeksBefore: 1 },
  { title: 'Pagamenti acconti; verifica SIAE/musica', weeksBefore: 1 },

  { title: 'Consegna fiori; set-up confettata/backdrop', weeksBefore: 0 },
  { title: 'Check scaletta cerimonia e foto', weeksBefore: 0 },

  { title: 'Pagamenti saldo; invio ringraziamenti', weeksBefore: -1 },
];

// 6) Note “conformità” Italia
export const BAPTISM_COMPLIANCE_NOTES: string[] = [
  'SIAE/SCF: se musica amplificata nel locale aperto al pubblico.',
  'Parrocchia: offerta e possibili dati richiesti per registri.',
  'Minori & foto: prevedi informativa/consenso per scatti/condivisione.',
  'Allergeni: indicazioni in menu/stationery per buffet/dolci.',
];

export const BAPTISM_COMPLIANCE_NOTES_BY_COUNTRY: Record<string, string[]> = {
  // Nota: questo è un set base. Valuta adattamenti locali per licenze musicali.
  it: BAPTISM_COMPLIANCE_NOTES,
  es: [
    'Licencias musicales si música amplificada en local público.',
    'Parroquia: donativo y posible registro de datos.',
    'Menores y fotos: informar y recabar consentimiento.',
    'Alérgenos: indicar en menú/rotulación si corresponde.',
  ],
  fr: [
    'Droits musicaux si musique amplifiée en lieu public.',
    'Paroisse: offrande et éventuel enregistrement de données.',
    'Mineurs & photos: informer et recueillir consentement.',
    'Allergènes: indiquer sur menus/étiquetage.',
  ],
  uk: [
    'Music licensing if amplified music at public venue.',
    'Parish: offering and possible register entries.',
    'Minors & photos: provide notice/consent.',
    'Allergens: label on menus/stationery.',
  ],
  us: [
    'Music licensing if amplified music at public venue.',
    'Parish/church: offering and any registry requirements.',
    'Minors & photos: notice/consent where applicable.',
    'Allergens: menu/stationery labels where needed.',
  ],
  mx: [
    'Licencias musicales si hay música amplificada en lugar público.',
    'Parroquia: ofrenda y posibles datos para registros.',
    'Menores y fotos: aviso/consentimiento.',
    'Alérgenos: indicar en menú/rotulación.',
  ],
  in: [
    'Music licensing if amplified music in public venue (local rules).',
    'Parish/church: offering and registry details if any.',
    'Minors & photos: consent/notice.',
    'Allergens: mark on menus where applicable.',
  ],
  jp: [
    'Music licensing if amplified music at public venue (venue rules).',
    'Parish/church: offering and any registry requirements.',
    'Minors & photos: notice/consent.',
    'Allergens: display on menus if needed.',
  ],
  ae: [
    'Music permissions if amplified music (venue regulations).',
    'Church/chapel: offering and any documentation as needed.',
    'Minors & photos: consent/notice.',
    'Allergens: mark on menus where applicable.',
  ],
};

export function getBaptismComplianceNotes(country?: string) {
  const c = (country || '').toLowerCase();
  return BAPTISM_COMPLIANCE_NOTES_BY_COUNTRY[c] || BAPTISM_COMPLIANCE_NOTES;
}

// 7) Seed helper (Supabase client expected)
// Usage:
//   import { createBaptismSeed } from '@/data/templates/baptism';
//   await createBaptismSeed(db, eventId);
export async function createBaptismSeed(db: any, eventId: string, country?: string) {
  const template = getBaptismTemplate(country);
  for (const cat of template) {
    // Find or create category
    const { data: existingCat, error: selErr } = await db
      .from('categories')
      .select('id')
      .eq('event_id', eventId)
      .eq('name', cat.name)
      .maybeSingle();

    let categoryId: string | undefined = existingCat?.id;

    if (!categoryId) {
      const { data: insCat, error: insErr } = await db
        .from('categories')
        .insert({ event_id: eventId, name: cat.name })
        .select('id')
        .single();
      if (insErr) throw insErr;
      categoryId = insCat.id;
    }

    for (const sub of cat.subs) {
      const { data: existingSub } = await db
        .from('subcategories')
        .select('id')
        .eq('category_id', categoryId)
        .eq('name', sub)
        .maybeSingle();
      if (!existingSub?.id) {
        const { error: subErr } = await db
          .from('subcategories')
          .insert({ category_id: categoryId, name: sub });
        if (subErr) throw subErr;
      }
    }
  }
}
