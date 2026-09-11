import type { EventType } from "./eventConfigs";

import { getBaptismTemplate } from "@/data/templates/baptism";
import { getCommunionTemplate } from "@/data/templates/communion";
import { getConfirmationTemplate } from "@/data/templates/confirmation";
import { getEighteenthTemplate } from "@/data/templates/eighteenth";
import { getGraduationTemplate } from "@/data/templates/graduation";

export type BudgetCategoryMap = Record<string, string[]>;

export type WeddingBudgetItem = {
  key: string;
  label: string;
  category: string;
  aliases: readonly string[];
  contexts: readonly string[];
  package?: "wedding_bag";
  distinctCollision?: string;
};

type TemplateCategory = { name: string; subs: string[] };

function templateToMap(template: TemplateCategory[]): BudgetCategoryMap {
  return template.reduce<BudgetCategoryMap>((acc, item) => {
    acc[item.name] = [...item.subs];
    return acc;
  }, {});
}

const WEDDING_BUDGET_CATEGORY_DEFINITIONS: BudgetCategoryMap = {
  "Abiti & Accessori (altri)": [
    "Abiti ospiti / Genitori",
    "Accessori damigelle",
    "Accessori testimoni",
    "Fedi nuziali",
    "Anello fidanzamento",
    "Accessori vari",
  ],
  Cerimonia: [
    "Chiesa / Comune",
    "Fiori cerimonia",
    "Pulizia chiesa",
    "Cesto doni",
    "Documenti e pratiche",
    "Offerte / Diritti",
    "Colombe uscita",
    "Bottiglia per brindisi",
    "Bicchieri per brindisi",
    "Forfait cerimonia",
  ],
  "Wedding Bag": [
    "Fazzoletti",
    "Riso o petali",
    "Libretto della messa o del rito",
    "Caramelle o mentine",
    "Ventaglio",
    "Bolle di sapone",
    "Kit di sopravvivenza",
    "Mini-bottiglietta d'acqua",
    "Spray antizanzare",
  ],
  "Fuochi d'artificio": [
    "Fuochi tradizionali",
    "Fontane luminose",
    "Spettacolo pirotecnico",
    "Bengala per ospiti",
    "Lancio palloncini luminosi",
    "Forfait fuochi",
  ],
  "Fiori & Decor": [
    "Bouquet",
    "Boutonniere",
    "Centrotavola",
    "Allestimenti",
    "Candele",
    "Tableau",
    "Noleggi vasi e strutture",
    "Forfait fioraio",
    "Corsage",
    "Illuminazione scenografica",
  ],
  "Foto & Video": [
    "Servizio fotografico",
    "Video",
    "Drone",
    "Album",
    "Stampe",
    "Seconda troupe fotografica",
    "Forfait fotografo",
  ],
  "Inviti & Stationery": [
    "Partecipazioni",
    "Invito digitale",
    "Save the Date",
    "Timeline / programma della giornata",
    "Menu",
    "Segnaposto",
    "Timbri / Cliche",
    "Francobolli / Spedizioni",
    "Calligrafia",
    "Cartoncini / Tag",
    "QR Code / Stampa",
  ],
  Sposa: [
    "Abito sposa",
    "Scarpe sposa",
    "Accessori (velo, gioielli, ecc.)",
    "Intimo / sottogonna",
    "Hair stylist / Acconciatrice",
    "Make-up artist",
    "Prove",
    "Altro sposa",
  ],
  Sposo: [
    "Abito sposo",
    "Scarpe sposo",
    "Accessori (cravatta, gemelli, ecc.)",
    "Barbiere / Grooming",
    "Prove",
    "Altro sposo",
  ],
  "Ricevimento Location": [
    "Affitto sala",
    "Catering / Banqueting",
    "Torta nuziale",
    "Vini & Bevande",
    "Open bar",
    "Mise en place",
    "Noleggio tovagliato / piatti",
    "Forfait location",
    "Forfait catering (prezzo a persona)",
  ],
  "Musica & Intrattenimento": [
    "DJ / Band",
    "Audio / Luci",
    "Animazione",
    "Diritti SIAE",
    "Guestbook phone / Postazioni",
    "Forfait musica e intrattenimento",
  ],
  Trasporti: ["Auto sposi", "Autista", "Navette ospiti", "Carburante / Pedaggi"],
  "Bomboniere & Regali": [
    "Bomboniere",
    "Confetti",
    "Packaging / Scatole",
    "Allestimento tavolo bomboniere",
    "Regalo testimoni",
    "Regalo damigelle",
    "Regalo pagetti",
    "Realizzazione bomboniere",
  ],
  "Ospitalita & Logistica": [
    "Alloggi ospiti",
    "Welcome bag / Kit",
    "Cartellonistica / Segnaletica",
  ],
  Burocrazia: ["Pubblicazioni", "Certificati", "Traduzioni / Apostille"],
  "Addio al Nubilato": [
    "Location addio al nubilato",
    "Ristorante / Cena",
    "Attivita / Esperienze",
    "Gadget / T-shirt",
    "Decorazioni / Palloncini",
    "Trasporti",
    "Alloggio",
    "Forfait addio al nubilato",
  ],
  "Addio al Celibato": [
    "Location addio al celibato",
    "Ristorante / Cena",
    "Attivita / Esperienze",
    "Gadget / T-shirt",
    "Decorazioni / Palloncini",
    "Trasporti",
    "Alloggio",
    "Forfait addio al celibato",
  ],
  "Beauty & Benessere": ["Consulente di bellezza", "SPA / Massaggi", "Solarium"],
  "Viaggio di nozze": [
    "Quota viaggio",
    "Assicurazioni",
    "Visti / Documenti",
    "Passaporto",
    "Extra",
  ],
  "Wedding Planner": [
    "Consulenza",
    "Full planning",
    "Partial planning",
    "Coordinamento giorno matrimonio",
    "Forfait wedding planner",
  ],
  "Musica Cerimonia": [
    "Coro",
    "Soprano",
    "Organo",
    "Arpa",
    "Violino",
    "Violoncello",
    "Gruppo strumenti",
    "Forfait musica cerimonia",
  ],
  "Musica Ricevimento": [
    "DJ",
    "Band live",
    "Orchestra",
    "Duo acustico",
    "Pianista",
    "Forfait musica ricevimento",
  ],
  "Comunicazione & Media": [
    "Sito web / QR",
    "Social media",
    "Grafica / Design",
  ],
  "Extra & Contingenze": ["Imprevisti", "Spese varie"],
};

const normalizeTaxonomyText = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, ".")
  .replace(/^\.|\.$/g, "");

const itemId = (category: string, label: string) => `${category}\u0000${label}`;
const SPECIAL_ITEMS: Record<string, Partial<WeddingBudgetItem>> = {
  [itemId("Wedding Bag", "Libretto della messa o del rito")]: {
    key: "wedding.ceremony.booklet",
    label: "Libretto della cerimonia",
    aliases: ["Libretto Messa", "Libretti Messa", "Libretto della messa", "Libretto della messa o del rito", "Libretti cerimonia"],
    contexts: ["Wedding Bag", "Cerimonia", "Inviti & Stationery"],
    package: "wedding_bag",
  },
  [itemId("Wedding Bag", "Ventaglio")]: {
    key: "wedding.guest-comfort.fan",
    aliases: ["Ventagli"],
    contexts: ["Wedding Bag", "Cerimonia", "Comfort ospiti"],
    package: "wedding_bag",
  },
  [itemId("Inviti & Stationery", "Segnaposto")]: {
    key: "wedding.stationery.place-card",
    aliases: ["Segnaposti", "Tableau / segnaposto"],
    contexts: ["Inviti & Stationery", "Fiori & Decor"],
  },
};

const DISTINCT_LABEL_COLLISIONS: Record<string, string> = {
  Prove: "Prove separate per gli abiti della sposa e dello sposo.",
  "Ristorante / Cena": "Eventi distinti: addio al nubilato e addio al celibato.",
  "Attivita / Esperienze": "Eventi distinti: addio al nubilato e addio al celibato.",
  "Gadget / T-shirt": "Eventi distinti: addio al nubilato e addio al celibato.",
  "Decorazioni / Palloncini": "Eventi distinti: addio al nubilato e addio al celibato.",
  Trasporti: "Eventi distinti: matrimonio, addio al nubilato e addio al celibato.",
  Alloggio: "Eventi distinti: addio al nubilato e addio al celibato.",
};

/** Runtime source of truth for the wedding accounting taxonomy. */
export const WEDDING_BUDGET_TAXONOMY: readonly WeddingBudgetItem[] = Object.entries(WEDDING_BUDGET_CATEGORY_DEFINITIONS)
  .flatMap(([category, labels]) => labels.map((originalLabel) => {
    const special = SPECIAL_ITEMS[itemId(category, originalLabel)] || {};
    const label = special.label || originalLabel;
    return {
      key: special.key || `wedding.${normalizeTaxonomyText(category)}.${normalizeTaxonomyText(label)}`,
      label,
      category,
      aliases: special.aliases || [],
      contexts: special.contexts || [category],
      package: special.package || (category === "Wedding Bag" ? "wedding_bag" : undefined),
      distinctCollision: DISTINCT_LABEL_COLLISIONS[label],
    } satisfies WeddingBudgetItem;
  }));

export const WEDDING_BUDGET_CATEGORIES: BudgetCategoryMap = WEDDING_BUDGET_TAXONOMY.reduce<BudgetCategoryMap>((map, item) => {
  (map[item.category] ||= []).push(item.label);
  return map;
}, {});

export const WEDDING_BUDGET_ITEM_BY_KEY = new Map(WEDDING_BUDGET_TAXONOMY.map((item) => [item.key, item]));

export function findWeddingBudgetItem(category: string, label: string) {
  const normalized = normalizeTaxonomyText(label);
  return WEDDING_BUDGET_TAXONOMY.find((item) => item.key === label || (
    (item.category === category || item.contexts.includes(category))
    && [item.label, ...item.aliases].some((candidate) => normalizeTaxonomyText(candidate) === normalized)
  ));
}

export const BAPTISM_BUDGET_CATEGORIES = templateToMap(
  getBaptismTemplate("it")
);

export const COMMUNION_BUDGET_CATEGORIES = templateToMap(
  getCommunionTemplate("it")
);

export const CONFIRMATION_BUDGET_CATEGORIES = templateToMap(
  getConfirmationTemplate("it")
);

export const EIGHTEENTH_BUDGET_CATEGORIES = templateToMap(
  getEighteenthTemplate("it")
);

export const GRADUATION_BUDGET_CATEGORIES = templateToMap(
  getGraduationTemplate("it")
);

export const ANNIVERSARY_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Cerimonia: ["Celebrante", "Fedi simboliche", "Allestimento", "Musica"],
  Viaggio: ["Voli", "Hotel", "Esperienze", "Assicurazione"],
  Regali: ["Gioielli", "Lettere", "Album", "Sorpresa"],
  Decor: ["Fiori", "Illuminazione", "Tavola", "Profumazioni"],
  Ospiti: ["Inviti", "Welcome kit", "Bomboniere", "Trasporti"],
  "Stile personale": ["Outfit", "Make-up", "Parrucchiere", "Benessere"],
  Extra: ["Fotografo", "Video", "Mance", "Contingenze"],
};

export const GENDER_REVEAL_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Pulizie", "Permessi", "Illuminazione"],
  Catering: ["Dolci", "Snack salati", "Bevande", "Torta reveal"],
  Decor: ["Backdrop", "Balloon art", "Fiori", "Stationery"],
  Intrattenimento: [
    "Giochi pronostico",
    "Animazione",
    "Playlist",
    "Photobooth",
  ],
  Comunicazione: ["Inviti", "Ringraziamenti", "Social", "Streaming"],
  Ricordi: ["Fotografo", "Video", "Album", "Regali ospiti"],
  Extra: ["Baby sitter", "Trasporti", "Mance", "Contingenze"],
};

export const BIRTHDAY_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Pulizie", "Permessi", "Allestimento"],
  Catering: ["Buffet", "Torta", "Bevande", "Servizio"],
  Decor: ["Allestimenti", "Luci", "Palloncini", "Fiori"],
  Intrattenimento: ["Musica", "Giochi", "Animazione", "Spettacoli"],
  Ospiti: ["Inviti", "Segnaposto", "Regali ospiti", "Ringraziamenti"],
  Regali: ["Regalo principale", "Esperienza", "Donation", "Pacchetti sorpresa"],
  Organizzazione: ["Fotografo", "Video", "Trasporti", "Contingenze"],
};

export const TURNING50_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Permessi", "Sicurezza", "Pulizie"],
  Catering: ["Menu gourmet", "Wine pairing", "Open bar", "Dessert"],
  Design: ["Allestimenti", "Luci scenografiche", "Inviti", "Installazioni"],
  Intrattenimento: ["Band / DJ", "Performer", "Speaker", "Spettacolo"],
  "Stile personale": ["Outfit", "Stylist", "Make-up", "Wellness"],
  Esperienze: ["Viaggio", "Attivita speciali", "Regali charity", "After party"],
  Organizzazione: ["Planner", "Foto / Video", "Trasporti", "Contingenze"],
};

export const RETIREMENT_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Pulizie", "Permessi", "Allestimento"],
  Catering: ["Buffet", "Brindisi", "Torta", "Servizio"],
  Programma: ["Speaker", "Video tributo", "Tecnico audio", "Intrattenimento"],
  Ricordi: ["Album", "Photobooth", "Regali", "Stampa foto"],
  Comunicazione: ["Inviti", "Streaming", "Ringraziamenti", "Grafica"],
  Decor: ["Timeline", "Fiori", "Segnaletica", "Illuminazione"],
  Trasporti: ["Navette", "Parcheggi", "Taxi", "Logistica"],
  Extra: ["Mance", "Assicurazione", "Contingenze", "Beneficenza"],
};

export const BABY_SHOWER_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Casa", "Affitto sala", "Pulizie", "Permessi"],
  Catering: ["Dolci", "Snack salati", "Bevande", "Torta a tema"],
  Decor: ["Backdrop", "Balloon art", "Fiori", "Stationery"],
  Intrattenimento: [
    "Giochi pronostico",
    "Animazione",
    "Playlist",
    "Photobooth",
  ],
  Comunicazione: ["Inviti", "RSVP", "Ringraziamenti", "Social"],
  Regali: ["Lista nascita", "Gift table", "Gadget ospiti", "Packaging"],
  Ricordi: ["Fotografo", "Video", "Album", "Guestbook"],
  Extra: ["Baby sitter", "Trasporti", "Mance", "Contingenze"],
};

export const ENGAGEMENT_PARTY_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Allestimento base", "Luci", "Permessi"],
  Catering: ["Aperitivo", "Finger food", "Bevande", "Torta/Brindisi"],
  Decor: ["Fiori", "Backdrop", "Segnaposto", "Stampa cartelli"],
  Musica: ["DJ/Playlist", "Audio", "Microfono", "SIAE"],
  Ospiti: ["Inviti", "RSVP", "Welcome kit", "Ringraziamenti"],
  Ricordi: ["Fotografo", "Video", "Polaroid/Photobooth", "Album"],
  Programma: ["Speech", "Scaletta", "Sorprese", "Brindisi"],
  Extra: ["Trasporti", "Mance", "Contingenze", "Noleggi vari"],
};

export const EVENT_BUDGET_CATEGORIES: Record<EventType, BudgetCategoryMap> = {
  wedding: WEDDING_BUDGET_CATEGORIES,
  baptism: BAPTISM_BUDGET_CATEGORIES,
  confirmation: CONFIRMATION_BUDGET_CATEGORIES,
  graduation: GRADUATION_BUDGET_CATEGORIES,
  eighteenth: EIGHTEENTH_BUDGET_CATEGORIES,
  anniversary: ANNIVERSARY_BUDGET_CATEGORIES,
  "gender-reveal": GENDER_REVEAL_BUDGET_CATEGORIES,
  birthday: BIRTHDAY_BUDGET_CATEGORIES,
  fifty: TURNING50_BUDGET_CATEGORIES,
  retirement: RETIREMENT_BUDGET_CATEGORIES,
  communion: COMMUNION_BUDGET_CATEGORIES,
};
