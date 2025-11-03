import {
  ANNIVERSARY_BUDGET_CATEGORIES,
  BAPTISM_BUDGET_CATEGORIES,
  BIRTHDAY_BUDGET_CATEGORIES,
  CONFIRMATION_BUDGET_CATEGORIES,
  EIGHTEENTH_BUDGET_CATEGORIES,
  GENDER_REVEAL_BUDGET_CATEGORIES,
  GRADUATION_BUDGET_CATEGORIES,
  RETIREMENT_BUDGET_CATEGORIES,
  TURNING50_BUDGET_CATEGORIES,
  WEDDING_BUDGET_CATEGORIES,
} from "./budgetCategories";

export type EventType =
  | "wedding"
  | "baptism"
  | "turning-18"
  | "anniversary"
  | "gender-reveal"
  | "birthday"
  | "turning-50"
  | "retirement"
  | "confirmation"
  | "graduation";

type TimelinePriority = "alta" | "media" | "bassa";

export type TimelineTaskTemplate = {
  title: string;
  description: string;
  monthsBefore: number;
  category: string;
  priority: TimelinePriority;
};

export type TimelineBucket = {
  label: string;
  minMonthsBefore: number;
  maxMonthsBefore?: number;
};

export type SpendTypeOption = {
  value: string;
  label: string;
};

export type ContributorConfig = {
  value: string;
  label: string;
  cardClass: string;
  textClass: string;
};

export type EventConfiguration = {
  name: string;
  emoji: string;
  budgetSectionTitle: string;
  dateLabel: string;
  totalBudgetLabel: string;
  spendTypeLabel: string;
  eventDateMessage: string;
  timelineTitle: string;
  timelineDescription: string;
  timelineBuckets: TimelineBucket[];
  timelineTasks: TimelineTaskTemplate[];
  budgetCategories: Record<string, string[]>;
  spendTypes: SpendTypeOption[];
  contributors: ContributorConfig[];
  defaultSpendType: string;
};

const INFINITY = Number.POSITIVE_INFINITY;

export const DEFAULT_EVENT_TYPE: EventType = "wedding";

export const EVENT_CONFIGS: Record<EventType, EventConfiguration> = {
  wedding: {
    name: "Matrimonio",
    emoji: "­ƒÆì",
    budgetSectionTitle: "Imposta Budget e Data Matrimonio",
    dateLabel: "Data Matrimonio",
    totalBudgetLabel: "Budget Totale",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "Il vostro matrimonio +¿ il",
    timelineTitle: "Timeline del Matrimonio",
    timelineDescription:
      "Organizzate ogni fase della pianificazione senza stress. Spuntate le attivit+á man mano che le completate!",
    timelineBuckets: [
      { label: "12+ mesi prima", minMonthsBefore: 12, maxMonthsBefore: INFINITY },
      { label: "9-11 mesi prima", minMonthsBefore: 9, maxMonthsBefore: 11 },
      { label: "6-8 mesi prima", minMonthsBefore: 6, maxMonthsBefore: 8 },
      { label: "3-5 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 5 },
      { label: "1-2 mesi prima", minMonthsBefore: 1, maxMonthsBefore: 2 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Annunciate il fidanzamento", description: "Condividete la notizia con chi amate", monthsBefore: 12, category: "Inizio", priority: "alta" },
      { title: "Definite budget e stile", description: "Scegliete priorit+á e moodboard", monthsBefore: 10, category: "Budget", priority: "alta" },
      { title: "Prenotate location e data", description: "Allineate cerimonia e ricevimento", monthsBefore: 9.5, category: "Cerimonia", priority: "alta" },
      { title: "Selezionate fornitori chiave", description: "Foto, video, musica e catering", monthsBefore: 8, category: "Servizi", priority: "alta" },
      { title: "Scegliete abiti degli sposi", description: "Avviate prove e personalizzazioni", monthsBefore: 7, category: "Sposa", priority: "media" },
      { title: "Invii Save the Date", description: "Avvisate gli ospiti", monthsBefore: 6, category: "Invitati", priority: "media" },
      { title: "Curate inviti e decor", description: "Grafica, fiori e scenografie", monthsBefore: 4, category: "Decor", priority: "media" },
      { title: "Definite men+¦ e logistica", description: "Tavoli, ospiti e trasporti", monthsBefore: 3, category: "Ricevimento", priority: "media" },
      { title: "Ultimate prove beauty", description: "Trucco, acconciatura e accessori", monthsBefore: 1.5, category: "Sposa", priority: "media" },
      { title: "Confermate fornitori e pagamenti", description: "Verificate timeline della giornata", monthsBefore: 0.5, category: "Servizi", priority: "alta" },
      { title: "Preparatevi al viaggio di nozze", description: "Documenti, valigie e assicurazioni", monthsBefore: 0.25, category: "Viaggio", priority: "bassa" },
    ],
    budgetCategories: WEDDING_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "bride", label: "Sposa" },
      { value: "groom", label: "Sposo" },
      { value: "municipality", label: "Comune" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "bride", label: "Budget Sposa", cardClass: "border-2 border-pink-300 bg-pink-50", textClass: "text-pink-700" },
      { value: "groom", label: "Budget Sposo", cardClass: "border-2 border-blue-300 bg-blue-50", textClass: "text-blue-700" },
      { value: "municipality", label: "Budget Comune", cardClass: "border-2 border-emerald-300 bg-emerald-50", textClass: "text-emerald-700" },
    ],
    defaultSpendType: "bride",
  },
  baptism: {
    name: "Battesimo",
    emoji: "­ƒòè´©Å",
    budgetSectionTitle: "Imposta Budget per il Battesimo",
    dateLabel: "Data Battesimo",
    totalBudgetLabel: "Budget Familiare",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "Il battesimo +¿ il",
    timelineTitle: "Timeline del Battesimo",
    timelineDescription: "Prepara il primo grande evento del tuo bimbo con una checklist su misura.",
    timelineBuckets: [
      { label: "6 mesi prima", minMonthsBefore: 6, maxMonthsBefore: INFINITY },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Scegli chiesa e data", description: "Verifica disponibilit+á del parroco", monthsBefore: 6, category: "Cerimonia", priority: "alta" },
      { title: "Nomina padrino e madrina", description: "Condividi ruolo e responsabilit+á", monthsBefore: 5, category: "Famiglia", priority: "alta" },
      { title: "Raccogli documenti", description: "Certificati e pratiche parrocchiali", monthsBefore: 4, category: "Burocrazia", priority: "media" },
      { title: "Definisci budget e lista ospiti", description: "Stabilisci priorit+á con la famiglia", monthsBefore: 3, category: "Budget", priority: "media" },
      { title: "Prenota location e catering", description: "Scegli ristorante o pranzo in casa", monthsBefore: 2.5, category: "Ricevimento", priority: "media" },
      { title: "Scegli abito e accessori", description: "Completa corredino del battesimo", monthsBefore: 2, category: "Bambino/a", priority: "media" },
      { title: "Ordina bomboniere e inviti", description: "Personalizza confetti e grafiche", monthsBefore: 1.5, category: "Ricordi", priority: "media" },
      { title: "Conferma ospiti e fotografo", description: "Aggiorna posti e servizi", monthsBefore: 1, category: "Organizzazione", priority: "alta" },
      { title: "Prepara kit per il bimbo", description: "Cambia abiti di scorta e necessaire", monthsBefore: 0.5, category: "Bambino/a", priority: "media" },
      { title: "Allestisci chiesa e tavolo confetti", description: "Coordina fiori e decorazioni", monthsBefore: 0.25, category: "Decor", priority: "bassa" },
    ],
    budgetCategories: BAPTISM_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "parents", label: "Genitori" },
      { value: "godparents", label: "Padrino/Madrina" },
      { value: "family", label: "Famiglia" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "parents", label: "Budget Genitori", cardClass: "border-2 border-blue-300 bg-blue-50", textClass: "text-blue-700" },
      { value: "godparents", label: "Budget Padrini", cardClass: "border-2 border-purple-300 bg-purple-50", textClass: "text-purple-700" },
      { value: "family", label: "Budget Famiglia", cardClass: "border-2 border-amber-300 bg-amber-50", textClass: "text-amber-700" },
    ],
    defaultSpendType: "parents",
  },
  "turning-18": {
    name: "Festa dei 18 anni",
    emoji: "­ƒÄë",
    budgetSectionTitle: "Imposta Budget per il Diciottesimo",
    dateLabel: "Data Festa",
    totalBudgetLabel: "Budget Festa",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "Il diciottesimo +¿ il",
    timelineTitle: "Timeline Festa dei 18 anni",
    timelineDescription: "Una roadmap completa per organizzare la festa dei 18 anni perfetta.",
    timelineBuckets: [
      { label: "8+ mesi prima", minMonthsBefore: 8, maxMonthsBefore: INFINITY },
      { label: "6-7 mesi prima", minMonthsBefore: 6, maxMonthsBefore: 7 },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "1-2 mesi prima", minMonthsBefore: 1, maxMonthsBefore: 2 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Immagina tema e atmosfera", description: "Crea una moodboard ispirazionale", monthsBefore: 8, category: "Visione", priority: "alta" },
      { title: "Definisci budget condiviso", description: "Valuta contributi di festeggiato e genitori", monthsBefore: 7, category: "Budget", priority: "alta" },
      { title: "Blocca location e data", description: "Scegli tra club, villa o location urbana", monthsBefore: 6, category: "Location", priority: "alta" },
      { title: "Scegli intrattenimento principale", description: "DJ, band o performer speciali", monthsBefore: 5, category: "Intrattenimento", priority: "media" },
      { title: "Progetta inviti e comunicazione", description: "Crea grafica digitale o cartacea", monthsBefore: 4, category: "Comunicazione", priority: "media" },
      { title: "Prenota catering e torta", description: "Menu personalizzato e dessert scenografico", monthsBefore: 3, category: "Catering", priority: "media" },
      { title: "Organizza foto e video", description: "Ingaggia fotografo o photobooth", monthsBefore: 2, category: "Ricordi", priority: "media" },
      { title: "Conferma ospiti e tavoli", description: "Gestisci RSVP e seating plan", monthsBefore: 1.5, category: "Ospiti", priority: "alta" },
      { title: "Coordina outfit e beauty", description: "Prove trucco, acconciatura e look", monthsBefore: 1, category: "Stile personale", priority: "media" },
      { title: "Rifinisci scaletta e sorprese", description: "Video, speech e playlist finale", monthsBefore: 0.5, category: "Programma", priority: "media" },
    ],
    budgetCategories: EIGHTEENTH_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "celebrant", label: "Festeggiato/a" },
      { value: "parents", label: "Genitori" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "celebrant", label: "Budget Festeggiato/a", cardClass: "border-2 border-violet-300 bg-violet-50", textClass: "text-violet-700" },
      { value: "parents", label: "Budget Genitori", cardClass: "border-2 border-sky-300 bg-sky-50", textClass: "text-sky-700" },
    ],
    defaultSpendType: "celebrant",
  },
  anniversary: {
    name: "Anniversario di matrimonio",
    emoji: "­ƒÆ×",
    budgetSectionTitle: "Imposta Budget per l'Anniversario",
    dateLabel: "Data Anniversario",
    totalBudgetLabel: "Budget di Coppia",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "La vostra celebrazione +¿ il",
    timelineTitle: "Timeline Anniversario",
    timelineDescription: "Rinnova le promesse con un percorso organizzato e romantico.",
    timelineBuckets: [
      { label: "9+ mesi prima", minMonthsBefore: 9, maxMonthsBefore: INFINITY },
      { label: "6-8 mesi prima", minMonthsBefore: 6, maxMonthsBefore: 8 },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "1-2 mesi prima", minMonthsBefore: 1, maxMonthsBefore: 2 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Scegliete lo stile della celebrazione", description: "Cena intima, viaggio o festa simbolica", monthsBefore: 9, category: "Visione", priority: "alta" },
      { title: "Stabilite il budget di coppia", description: "Distribuite le spese tra i partner", monthsBefore: 8, category: "Budget", priority: "alta" },
      { title: "Valutate location e celebrante", description: "Rinnovo promesse o cerimonia simbolica", monthsBefore: 6, category: "Cerimonia", priority: "media" },
      { title: "Prenotate viaggio o esperienza", description: "Weekend romantico o avventura condivisa", monthsBefore: 5, category: "Viaggio", priority: "media" },
      { title: "Progettate regali e sorprese", description: "Gioielli, lettere o momenti creativi", monthsBefore: 4, category: "Regali", priority: "media" },
      { title: "Definite guest list e inviti", description: "Valutate se coinvolgere familiari e amici", monthsBefore: 3, category: "Ospiti", priority: "media" },
      { title: "Curate decor e atmosfera", description: "Fiori, musica e illuminazione", monthsBefore: 2, category: "Decor", priority: "media" },
      { title: "Coordinate outfit e beauty", description: "Look coordinati e servizi benessere", monthsBefore: 1.5, category: "Stile personale", priority: "media" },
      { title: "Confermate fornitori e timeline", description: "Foto, ristorante e scaletta", monthsBefore: 1, category: "Organizzazione", priority: "media" },
      { title: "Dedicatevi un momento relax", description: "Spa o giornata di benessere", monthsBefore: 0.25, category: "Benessere", priority: "bassa" },
    ],
    budgetCategories: ANNIVERSARY_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "partner1", label: "Partner 1" },
      { value: "partner2", label: "Partner 2" },
      { value: "couple", label: "Coppia" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "partner1", label: "Budget Partner 1", cardClass: "border-2 border-rose-300 bg-rose-50", textClass: "text-rose-700" },
      { value: "partner2", label: "Budget Partner 2", cardClass: "border-2 border-indigo-300 bg-indigo-50", textClass: "text-indigo-700" },
      { value: "couple", label: "Budget di Coppia", cardClass: "border-2 border-slate-300 bg-slate-50", textClass: "text-slate-700" },
    ],
    defaultSpendType: "couple",
  },
  "gender-reveal": {
    name: "Gender reveal",
    emoji: "­ƒÄê",
    budgetSectionTitle: "Imposta Budget per il Gender Reveal",
    dateLabel: "Data Evento",
    totalBudgetLabel: "Budget Famiglia",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "La rivelazione +¿ il",
    timelineTitle: "Timeline Gender Reveal",
    timelineDescription: "Organizza un gender reveal creativo e coinvolgente passo dopo passo.",
    timelineBuckets: [
      { label: "4 mesi prima", minMonthsBefore: 4, maxMonthsBefore: INFINITY },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Scegli formato della rivelazione", description: "Dolce sorpresa, fumogeni o palloncini", monthsBefore: 4, category: "Visione", priority: "alta" },
      { title: "Definisci budget e contributi", description: "Coinvolgi famiglie e amici", monthsBefore: 3.5, category: "Budget", priority: "alta" },
      { title: "Stabilisci lista ospiti", description: "Valuta evento intimo o allargato", monthsBefore: 3, category: "Ospiti", priority: "media" },
      { title: "Prenota location o decidi casa", description: "Considera spazi interni ed esterni", monthsBefore: 2.5, category: "Location", priority: "media" },
      { title: "Pianifica catering leggero", description: "Snack, bevande e torta a tema", monthsBefore: 2, category: "Catering", priority: "media" },
      { title: "Progetta decorazioni", description: "Palette neutra e dettagli fotografici", monthsBefore: 1.5, category: "Decor", priority: "media" },
      { title: "Invia inviti e gestisci RSVP", description: "Messaggi personalizzati o digitali", monthsBefore: 1, category: "Comunicazione", priority: "media" },
      { title: "Prepara giochi e sorprese", description: "Pronostici, guestbook e reveal box", monthsBefore: 0.5, category: "Intrattenimento", priority: "media" },
      { title: "Conferma fornitori e scaletta", description: "Coordina fotografo e momento reveal", monthsBefore: 0.25, category: "Organizzazione", priority: "media" },
    ],
    budgetCategories: GENDER_REVEAL_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "parents", label: "Genitori" },
      { value: "family", label: "Famiglie" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "parents", label: "Budget Genitori", cardClass: "border-2 border-sky-300 bg-sky-50", textClass: "text-sky-700" },
      { value: "family", label: "Budget Famiglie", cardClass: "border-2 border-pink-300 bg-pink-50", textClass: "text-pink-700" },
    ],
    defaultSpendType: "parents",
  },
  birthday: {
    name: "Compleanno",
    emoji: "­ƒÑ¦",
    budgetSectionTitle: "Imposta Budget Compleanno",
    dateLabel: "Data Festa",
    totalBudgetLabel: "Budget Festa",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "Il compleanno +¿ il",
    timelineTitle: "Timeline Compleanno",
    timelineDescription: "Adatta questa guida ad ogni et+á per un compleanno memorabile.",
    timelineBuckets: [
      { label: "4 mesi prima", minMonthsBefore: 4, maxMonthsBefore: INFINITY },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Decidi formato e tema", description: "Cena, aperitivo o festa a sorpresa", monthsBefore: 4, category: "Visione", priority: "media" },
      { title: "Stabilisci budget", description: "Bilancia contributi di famiglia e amici", monthsBefore: 4, category: "Budget", priority: "alta" },
      { title: "Prenota location", description: "Spazio in casa, all'aperto o locale", monthsBefore: 3, category: "Location", priority: "media" },
      { title: "Pianifica catering e torta", description: "Menu personalizzato e dolci", monthsBefore: 2.5, category: "Catering", priority: "media" },
      { title: "Organizza intrattenimento", description: "Playlist, animazione o attivit+á", monthsBefore: 2, category: "Intrattenimento", priority: "media" },
      { title: "Invia inviti", description: "Gestisci conferme e preferenze", monthsBefore: 1.5, category: "Ospiti", priority: "media" },
      { title: "Definisci decorazioni", description: "Allestimenti, luci e photo corner", monthsBefore: 1, category: "Decor", priority: "media" },
      { title: "Prepara regali e gadget", description: "Bomboniere o ringraziamenti", monthsBefore: 0.5, category: "Regali", priority: "bassa" },
      { title: "Verifica logistica", description: "Trasporti, orari e supporti tecnici", monthsBefore: 0.25, category: "Organizzazione", priority: "media" },
    ],
    budgetCategories: BIRTHDAY_BUDGET_CATEGORIES,
    spendTypes: [
      { value: "celebrant", label: "Festeggiato/a" },
      { value: "family", label: "Famiglia" },
      { value: "friends", label: "Amici" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "celebrant", label: "Budget Festeggiato/a", cardClass: "border-2 border-orange-300 bg-orange-50", textClass: "text-orange-700" },
      { value: "family", label: "Budget Famiglia", cardClass: "border-2 border-teal-300 bg-teal-50", textClass: "text-teal-700" },
      { value: "friends", label: "Budget Amici", cardClass: "border-2 border-lime-300 bg-lime-50", textClass: "text-lime-700" },
    ],
    defaultSpendType: "celebrant",
  },
  "turning-50": {
    name: "50-¦ compleanno",
    emoji: "­ƒÄé",
    budgetSectionTitle: "Imposta Budget per i 50 anni",
    dateLabel: "Data Celebrazione",
    totalBudgetLabel: "Budget Festa",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "Il cinquantesimo +¿ il",
    timelineTitle: "Timeline 50-¦ Compleanno",
    timelineDescription: "Celebra il traguardo dei 50 anni con una pianificazione elegante.",
    timelineBuckets: [
      { label: "8+ mesi prima", minMonthsBefore: 8, maxMonthsBefore: INFINITY },
      { label: "6-7 mesi prima", minMonthsBefore: 6, maxMonthsBefore: 7 },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "1-2 mesi prima", minMonthsBefore: 1, maxMonthsBefore: 2 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Immagina l'esperienza", description: "Cena di gala, viaggio o festa a tema", monthsBefore: 8, category: "Visione", priority: "alta" },
      { title: "Stabilisci budget con partner/famiglia", description: "Definisci chi contribuisce", monthsBefore: 7, category: "Budget", priority: "alta" },
      { title: "Prenota location esclusiva", description: "Ville storiche, rooftop o resort", monthsBefore: 6, category: "Location", priority: "alta" },
      { title: "Ingaggia planner o consulente", description: "Supporto professionale se necessario", monthsBefore: 5, category: "Organizzazione", priority: "media" },
      { title: "Scegli catering gourmet", description: "Menu degustazione e cocktail bar", monthsBefore: 4, category: "Catering", priority: "media" },
      { title: "Definisci design e intrattenimento", description: "Allestimenti, luci e spettacoli", monthsBefore: 3, category: "Design", priority: "media" },
      { title: "Invia save the date e inviti", description: "Coinvolgi ospiti speciali", monthsBefore: 2, category: "Comunicazione", priority: "media" },
      { title: "Cura outfit e benessere", description: "Look personalizzato e trattamenti", monthsBefore: 1.5, category: "Stile personale", priority: "media" },
      { title: "Conferma fornitori e scaletta", description: "Timeline dettagliata della serata", monthsBefore: 1, category: "Organizzazione", priority: "media" },
      { title: "Prepara sorprese e discorsi", description: "Video, ringraziamenti o charity", monthsBefore: 0.5, category: "Esperienze", priority: "media" },
    ],
    budgetCategories: {
      "Location": ["Affitto", "Permessi", "Sicurezza", "Pulizie"],
      "Catering": ["Menu gourmet", "Wine pairing", "Open bar", "Dessert"],
      "Design": ["Allestimenti", "Luci scenografiche", "Inviti", "Installazioni"],
      "Intrattenimento": ["Band/DJ", "Performer", "Speaker", "Spettacolo"],
      "Stile personale": ["Outfit", "Stylist", "Make-up", "Wellness"],
      "Esperienze": ["Viaggio", "Attivit+á speciali", "Regali charity", "After party"],
      "Organizzazione": ["Planner", "Foto/Video", "Trasporti", "Contingenze"],
    },
    spendTypes: [
      { value: "celebrant", label: "Festeggiato/a" },
      { value: "partner", label: "Partner" },
      { value: "family", label: "Famiglia" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "celebrant", label: "Budget Festeggiato/a", cardClass: "border-2 border-fuchsia-300 bg-fuchsia-50", textClass: "text-fuchsia-700" },
      { value: "partner", label: "Budget Partner", cardClass: "border-2 border-cyan-300 bg-cyan-50", textClass: "text-cyan-700" },
      { value: "family", label: "Budget Famiglia", cardClass: "border-2 border-yellow-300 bg-yellow-50", textClass: "text-yellow-700" },
    ],
    defaultSpendType: "celebrant",
  },
  retirement: {
    name: "Pensione",
    emoji: "­ƒÅû´©Å",
    budgetSectionTitle: "Imposta Budget Festa di Pensionamento",
    dateLabel: "Data Celebrazione",
    totalBudgetLabel: "Budget Complessivo",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "La festa di pensionamento +¿ il",
    timelineTitle: "Timeline Pensionamento",
    timelineDescription: "Festeggia un nuovo inizio coordinando colleghi, famiglia e amici.",
    timelineBuckets: [
      { label: "6+ mesi prima", minMonthsBefore: 6, maxMonthsBefore: INFINITY },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Decidi stile della festa", description: "Aziendale, informale o viaggio", monthsBefore: 6, category: "Visione", priority: "alta" },
      { title: "Coordina con l'azienda", description: "Condividi data e budget con HR", monthsBefore: 5, category: "Organizzazione", priority: "alta" },
      { title: "Stabilisci contributi", description: "Distribuisci spese tra colleghi e famiglia", monthsBefore: 4.5, category: "Budget", priority: "alta" },
      { title: "Prenota location e catering", description: "Sala aziendale o locale dedicato", monthsBefore: 4, category: "Location", priority: "media" },
      { title: "Progetta programma e sorprese", description: "Discorsi, video e regali", monthsBefore: 3, category: "Programma", priority: "media" },
      { title: "Organizza raccolta ricordi", description: "Foto, lettere e testimonianze", monthsBefore: 2.5, category: "Ricordi", priority: "media" },
      { title: "Invia inviti", description: "Coinvolgi colleghi, amici e famiglia", monthsBefore: 2, category: "Comunicazione", priority: "media" },
      { title: "Conferma logistica", description: "Audio, trasporti e allestimenti", monthsBefore: 1, category: "Organizzazione", priority: "media" },
      { title: "Prepara discorso finale", description: "Ringraziamenti e prospettive future", monthsBefore: 0.5, category: "Programma", priority: "media" },
      { title: "Allestisci location e welcome area", description: "Timeline carriera, book firme", monthsBefore: 0.25, category: "Decor", priority: "bassa" },
    ],
    budgetCategories: {
      "Location": ["Affitto", "Pulizie", "Permessi", "Allestimento"],
      "Catering": ["Buffet", "Brindisi", "Torta", "Servizio"],
      "Programma": ["Speaker", "Video tributo", "Tecnico audio", "Intrattenimento"],
      "Ricordi": ["Album", "Photobooth", "Regali", "Stampa foto"],
      "Comunicazione": ["Inviti", "Streaming", "Ringraziamenti", "Grafica"],
      "Decor": ["Timeline", "Fiori", "Segnaletica", "Illuminazione"],
      "Trasporti": ["Navette", "Parcheggi", "Taxi", "Logistica"],
      "Extra": ["Mance", "Assicurazione", "Contingenze", "Beneficenza"],
    },
    spendTypes: [
      { value: "retiree", label: "Festeggiato/a" },
      { value: "family", label: "Famiglia" },
      { value: "colleagues", label: "Colleghi" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "retiree", label: "Budget Festeggiato/a", cardClass: "border-2 border-emerald-300 bg-emerald-50", textClass: "text-emerald-700" },
      { value: "family", label: "Budget Famiglia", cardClass: "border-2 border-amber-300 bg-amber-50", textClass: "text-amber-700" },
      { value: "colleagues", label: "Budget Colleghi", cardClass: "border-2 border-blue-300 bg-blue-50", textClass: "text-blue-700" },
    ],
    defaultSpendType: "retiree",
  },
  confirmation: {
    name: "Cresima",
    emoji: "­ƒò»´©Å",
    budgetSectionTitle: "Imposta Budget per la Cresima",
    dateLabel: "Data Cresima",
    totalBudgetLabel: "Budget Familiare",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "La cresima +¿ il",
    timelineTitle: "Timeline Cresima",
    timelineDescription: "Guida pratica per preparare la cresima con serenit+á e cura.",
    timelineBuckets: [
      { label: "6 mesi prima", minMonthsBefore: 6, maxMonthsBefore: INFINITY },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Conferma percorso catechesi", description: "Partecipa agli incontri dedicati", monthsBefore: 6, category: "Preparazione", priority: "alta" },
      { title: "Scegli padrino o madrina", description: "Confrontati con il parroco", monthsBefore: 5, category: "Famiglia", priority: "alta" },
      { title: "Raccogli documenti", description: "Certificati e pratiche parrocchiali", monthsBefore: 4.5, category: "Burocrazia", priority: "media" },
      { title: "Definisci budget e lista ospiti", description: "Riparti spese tra famiglia e padrini", monthsBefore: 4, category: "Budget", priority: "media" },
      { title: "Prenota ristorante o catering", description: "Valuta pranzo o buffet informale", monthsBefore: 3, category: "Ricevimento", priority: "media" },
      { title: "Scegli abito e accessori", description: "Coordinati con padrino/madrina", monthsBefore: 2.5, category: "Stile personale", priority: "media" },
      { title: "Ordina bomboniere e inviti", description: "Personalizza confetti e biglietti", monthsBefore: 2, category: "Ricordi", priority: "media" },
      { title: "Organizza foto e video", description: "Prenota fotografo o servizio streaming", monthsBefore: 1.5, category: "Ricordi", priority: "media" },
      { title: "Conferma ospiti e men+¦", description: "Adatta men+¦ a eventuali esigenze", monthsBefore: 1, category: "Ricevimento", priority: "media" },
      { title: "Prepara kit ricordi e ringraziamenti", description: "Guestbook, lettera al cresimando", monthsBefore: 0.5, category: "Ricordi", priority: "bassa" },
      { title: "Allestisci chiesa e location", description: "Fiori, segnaposto e simboli", monthsBefore: 0.25, category: "Decor", priority: "media" },
    ],
    budgetCategories: {
      "Preparazione": ["Catechesi", "Ritiri", "Materiali", "Offerte"],
      "Burocrazia": ["Documenti", "Certificati", "Marche da bollo", "Offerte parrocchia"],
      "Stile personale": ["Abito", "Scarpe", "Parrucchiere", "Make-up"],
      "Ricevimento": ["Location", "Catering", "Torta", "Bevande"],
      "Ricordi": ["Bomboniere", "Confetti", "Album", "Regali padrini"],
      "Decor": ["Fiori", "Allestimenti", "Segnaposto", "Illuminazione"],
      "Organizzazione": ["Inviti", "Trasporti", "Fotografo", "Contingenze"],
    },
    spendTypes: [
      { value: "parents", label: "Genitori" },
      { value: "godparents", label: "Padrino/Madrina" },
      { value: "parish", label: "Parrocchia" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "parents", label: "Budget Genitori", cardClass: "border-2 border-red-300 bg-red-50", textClass: "text-red-700" },
      { value: "godparents", label: "Budget Padrini", cardClass: "border-2 border-indigo-300 bg-indigo-50", textClass: "text-indigo-700" },
      { value: "parish", label: "Budget Parrocchia", cardClass: "border-2 border-slate-300 bg-slate-50", textClass: "text-slate-700" },
    ],
    defaultSpendType: "parents",
  },
  graduation: {
    name: "Laurea",
    emoji: "­ƒÄô",
    budgetSectionTitle: "Imposta Budget per la Laurea",
    dateLabel: "Data Laurea",
    totalBudgetLabel: "Budget Festa",
    spendTypeLabel: "Pagato da",
    eventDateMessage: "La laurea +¿ il",
    timelineTitle: "Timeline Laurea",
    timelineDescription: "Segui questa tabella di marcia per arrivare alla proclamazione senza stress.",
    timelineBuckets: [
      { label: "6 mesi prima", minMonthsBefore: 6, maxMonthsBefore: INFINITY },
      { label: "4-5 mesi prima", minMonthsBefore: 4, maxMonthsBefore: 5 },
      { label: "3 mesi prima", minMonthsBefore: 3, maxMonthsBefore: 3 },
      { label: "2 mesi prima", minMonthsBefore: 2, maxMonthsBefore: 2 },
      { label: "1 mese prima", minMonthsBefore: 1, maxMonthsBefore: 1 },
      { label: "Ultime settimane", minMonthsBefore: 0, maxMonthsBefore: 0.99 },
    ],
    timelineTasks: [
      { title: "Verifica requisiti accademici", description: "Crediti, tasse e domanda di laurea", monthsBefore: 6, category: "Burocrazia", priority: "alta" },
      { title: "Pianifica calendario tesi", description: "Fissa obiettivi con relatore", monthsBefore: 5, category: "Tesi", priority: "alta" },
      { title: "Stabilisci budget festa", description: "Coinvolgi famiglia e festeggiato", monthsBefore: 4.5, category: "Budget", priority: "media" },
      { title: "Prenota location per la festa", description: "Locale, terrazza o casa", monthsBefore: 4, category: "Festa", priority: "media" },
      { title: "Organizza inviti e comunicazione", description: "Crea grafica coordinata", monthsBefore: 3, category: "Comunicazione", priority: "media" },
      { title: "Scegli outfit e beauty", description: "Look per la proclamazione e la festa", monthsBefore: 2.5, category: "Stile personale", priority: "media" },
      { title: "Prenota fotografo e video", description: "Servizio durante discussione e party", monthsBefore: 2, category: "Ricordi", priority: "media" },
      { title: "Ordina bomboniere e confetti", description: "Personalizza con tema rosso laurea", monthsBefore: 1.5, category: "Ricordi", priority: "media" },
      { title: "Conferma catering e torta", description: "Finger food, bollicine e dessert", monthsBefore: 1, category: "Festa", priority: "media" },
      { title: "Stampa e rilegatura tesi", description: "Versioni per commissione e amici", monthsBefore: 0.75, category: "Tesi", priority: "alta" },
      { title: "Prepara discorso e ringraziamenti", description: "Dedica parole a famiglia e amici", monthsBefore: 0.5, category: "Tesi", priority: "media" },
      { title: "Allestisci location festa", description: "Decorazioni rosso laurea e gadget", monthsBefore: 0.25, category: "Festa", priority: "media" },
    ],
    budgetCategories: {
      "Burocrazia": ["Tasse", "Domanda laurea", "Marche da bollo", "Certificati"],
      "Tesi": ["Stampa", "Rilegatura", "Grafica", "Materiali"],
      "Festa": ["Location", "Catering", "Torta", "Bevande"],
      "Stile personale": ["Abito", "Scarpe", "Parrucchiere", "Make-up"],
      "Ricordi": ["Fotografo", "Video", "Bomboniere", "Album"],
      "Comunicazione": ["Inviti", "Ringraziamenti", "Social", "Guestbook"],
      "Extra": ["Trasporti", "Mance", "Esperienze", "Contingenze"],
    },
    spendTypes: [
      { value: "graduate", label: "Laureando/a" },
      { value: "parents", label: "Genitori" },
      { value: "gift", label: "Regalo" },
    ],
    contributors: [
      { value: "graduate", label: "Budget Laureando/a", cardClass: "border-2 border-red-300 bg-red-50", textClass: "text-red-700" },
      { value: "parents", label: "Budget Genitori", cardClass: "border-2 border-slate-300 bg-slate-50", textClass: "text-slate-700" },
    ],
    defaultSpendType: "graduate",
  },
};

export function resolveEventType(raw?: string | null): EventType {
  if (!raw) return DEFAULT_EVENT_TYPE;
  return (Object.keys(EVENT_CONFIGS) as EventType[]).includes(raw as EventType)
    ? (raw as EventType)
    : DEFAULT_EVENT_TYPE;
}

export function getEventConfig(eventType?: string | null): EventConfiguration {
  return EVENT_CONFIGS[resolveEventType(eventType)];
}

