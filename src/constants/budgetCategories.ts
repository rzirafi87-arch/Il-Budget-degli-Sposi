import type { EventType } from "./eventConfigs";

import { getBaptismTemplate } from "@/data/templates/baptism";
import { getCommunionTemplate } from "@/data/templates/communion";
import { getConfirmationTemplate } from "@/data/templates/confirmation";
import { getEighteenthTemplate } from "@/data/templates/eighteenth";
import { getGraduationTemplate } from "@/data/templates/graduation";

export type BudgetCategoryMap = Record<string, string[]>;

type TemplateCategory = { name: string; subs: string[] };

function templateToMap(template: TemplateCategory[]): BudgetCategoryMap {
  return template.reduce<BudgetCategoryMap>((acc, item) => {
    acc[item.name] = [...item.subs];
    return acc;
  }, {});
}

export const WEDDING_BUDGET_CATEGORIES: BudgetCategoryMap = {
  "Abiti & Accessori (altri)": [
    "Abiti ospiti / Genitori",
    "Accessori damigelle",
    "Accessori testimoni",
    "Fedi nuziali",
    "Anello fidanzamento",
    "Accessori vari",
  ],
  "Cerimonia/Chiesa Location": [
    "Chiesa / Comune",
    "Musiche",
    "Libretti Messa",
    "Fiori cerimonia",
    "Wedding bag",
    "Ventagli",
    "Pulizia chiesa",
    "Cesto doni",
    "Documenti e pratiche",
    "Offerte / Diritti",
    "Colombe uscita",
    "Riso / Petali",
    "Bottiglia per brindisi",
    "Bicchieri per brindisi",
    "Forfait cerimonia",
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
    "Segnaposto",
    "Noleggi vasi e strutture",
    "Forfait fioraio",
  ],
  "Foto & Video": [
    "Servizio fotografico",
    "Video",
    "Drone",
    "Album",
    "Stampe",
    "Secondo fotografo",
    "Forfait fotografo",
  ],
  "Inviti & Stationery": [
    "Partecipazioni",
    "Menu",
    "Segnaposto",
    "Libretti Messa",
    "Timbri / Cliche",
    "Francobolli / Spedizioni",
    "Calligrafia",
    "Cartoncini / Tag",
    "QR Code / Stampa",
  ],
  "Sposa": [
    "Abito sposa",
    "Scarpe sposa",
    "Accessori (velo, gioielli, ecc.)",
    "Intimo / sottogonna",
    "Parrucchiera",
    "Make-up",
    "Prove",
    "Altro sposa",
  ],
  "Sposo": [
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
  "Trasporti": ["Auto sposi", "Navette ospiti", "Carburante / Pedaggi"],
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
  "Burocrazia": ["Pubblicazioni", "Certificati", "Traduzioni / Apostille"],
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
  "Beauty & Benessere": ["Estetista", "SPA / Massaggi", "Solarium"],
  "Viaggio di nozze": [
    "Quota viaggio",
    "Assicurazioni",
    "Visti / Documenti",
    "Passaporto",
    "Extra",
    "Lista nozze",
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

export const BAPTISM_BUDGET_CATEGORIES = templateToMap(
  getBaptismTemplate("it"),
);

export const COMMUNION_BUDGET_CATEGORIES = templateToMap(
  getCommunionTemplate("it"),
);

export const CONFIRMATION_BUDGET_CATEGORIES = templateToMap(
  getConfirmationTemplate("it"),
);

export const EIGHTEENTH_BUDGET_CATEGORIES = templateToMap(
  getEighteenthTemplate("it"),
);

export const GRADUATION_BUDGET_CATEGORIES = templateToMap(
  getGraduationTemplate("it"),
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
  Intrattenimento: ["Giochi pronostico", "Animazione", "Playlist", "Photobooth"],
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

export const EVENT_BUDGET_CATEGORIES: Record<EventType, BudgetCategoryMap> = {
  wedding: WEDDING_BUDGET_CATEGORIES,
  baptism: BAPTISM_BUDGET_CATEGORIES,
  communion: COMMUNION_BUDGET_CATEGORIES,
  confirmation: CONFIRMATION_BUDGET_CATEGORIES,
  graduation: GRADUATION_BUDGET_CATEGORIES,
  "turning-18": EIGHTEENTH_BUDGET_CATEGORIES,
  anniversary: ANNIVERSARY_BUDGET_CATEGORIES,
  "gender-reveal": GENDER_REVEAL_BUDGET_CATEGORIES,
  birthday: BIRTHDAY_BUDGET_CATEGORIES,
  "turning-50": TURNING50_BUDGET_CATEGORIES,
  retirement: RETIREMENT_BUDGET_CATEGORIES,
};
