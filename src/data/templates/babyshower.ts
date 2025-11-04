// Baby Shower event template
// Struttura dettagliata per categorie, sottocategorie, timeline, campi extra

import { EventTemplate } from "./types";

const babyShowerTemplate: EventTemplate = {
  eventType: "babyshower",
  name: "Baby Shower",
  colorTheme: ["#F8E8D8", "#A3B59D", "#E7B7D3"],
  totalBudget: 1800,
  description: "Festa per la futura nascita con giochi, regali e comfort",
  categories: [
    {
      name: "Organizzazione Generale",
      icon: "🗂️",
      budgetPercent: 5,
      subcategories: [
        { name: "Tipo di evento (solo donne, misto, Sip & See)", description: "Definizione formato e target ospiti" },
        { name: "Data & orario", description: "Scelta data, orario e periodo ideale" },
        { name: "Budget complessivo e margine extra", description: "Stima budget e margine extra" },
        { name: "Tema & palette", description: "Scelta tema, colori e stile" },
        { name: "Ospiti target", description: "Numero previsto e tipologia ospiti" },
        { name: "Timeline & to-do", description: "Scadenze e assegnazioni principali" },
      ],
    },
    {
      name: "Ospiti & Inviti",
      icon: "💌",
      budgetPercent: 6,
      subcategories: [
        { name: "Lista ospiti", description: "Anagrafiche e relazioni ospiti" },
        { name: "Save-the-date", description: "Invio promemoria evento" },
        { name: "Inviti (design, stampa, invio)", description: "Creazione e invio inviti digitali/cartacei" },
        { name: "Gestione RSVP", description: "Conferme, allergie, accompagnatori" },
        { name: "Promemoria evento", description: "Reminder a 7 giorni e 48 ore" },
      ],
    },
    {
      name: "Location & Allestimento",
      icon: "🏡",
      budgetPercent: 15,
      subcategories: [
        { name: "Location (casa, sala, ristorante, giardino)", description: "Scelta e prenotazione location" },
        { name: "Affitto spazio/permessi", description: "Costi sala, tensostruttura, permessi" },
        { name: "Noleggi tavoli/sedie/tovagliato", description: "Noleggio arredi e stoviglie" },
        { name: "Decorazioni (backdrop, palloncini, fiori)", description: "Allestimento scenografico e floreale" },
        { name: "Sweet table (alzatine, vassoi, topper)", description: "Allestimento tavolo dolci" },
        { name: "Stationery coordinata", description: "Welcome sign, segnaposto, tag bomboniere" },
      ],
    },
    {
      name: "Catering & Torta",
      icon: "🍰",
      budgetPercent: 18,
      subcategories: [
        { name: "Menù (finger food, brunch, buffet)", description: "Menù principale per ospiti" },
        { name: "Bevande (analcolici, mocktail, succhi)", description: "Bevande e drink analcolici" },
        { name: "Torta baby shower", description: "Torta personalizzata con topper" },
        { name: "Dessert bar (cupcake, biscotti, macaron)", description: "Dolci decorati e personalizzati" },
        { name: "Opzioni bimbi & intolleranze", description: "Menù gluten-free, lactose-free, vegetarian" },
      ],
    },
    {
      name: "Intrattenimento & Giochi",
      icon: "🎲",
      budgetPercent: 7,
      subcategories: [
        { name: "Scaletta giochi (45–60 min)", description: "Programmazione giochi e attività" },
        { name: "Idee gioco (Bingo, quiz, memory, diaper raffle)", description: "Selezione giochi e regole" },
        { name: "Premi per giochi", description: "Mini gadget, dolcetti, piante grasse" },
        { name: "Materiali per giochi", description: "Nastro, manichino, memory, quiz" },
        { name: "Diaper raffle (lotteria pannolini)", description: "Gestione lotteria e premi" },
      ],
    },
    {
      name: "Regali & Lista Nascita",
      icon: "🎁",
      budgetPercent: 6,
      subcategories: [
        { name: "Lista nascita (link store, negozio locale)", description: "Creazione e gestione lista nascita" },
        { name: "Raccolta fondi regalo cumulativo", description: "Gestione regalo collettivo" },
        { name: "Coordinamento doppioni", description: "Aggiornamento post-acquisto" },
        { name: "Scatola auguri & biglietti", description: "Dediche cartacee o QR album" },
      ],
    },
    {
      name: "Foto, Video & Social",
      icon: "📸",
      budgetPercent: 8,
      subcategories: [
        { name: "Fotografo/videomaker", description: "Servizio foto/video professionale" },
        { name: "Selfie-corner/photobooth", description: "Fondale, props, stampa istantanea" },
        { name: "QR album condiviso", description: "Google Photos/Drive, istruzioni ospiti" },
        { name: "Reel/clip highlight", description: "Montaggio breve post-evento" },
      ],
    },
    {
      name: "Mamma & Outfit",
      icon: "🤰",
      budgetPercent: 6,
      subcategories: [
        { name: "Outfit mamma (premaman)", description: "Abito comodo/elegante per la mamma" },
        { name: "Beauty (parrucchiere, make-up, manicure)", description: "Servizi beauty pre-evento" },
        { name: "Comfort corner", description: "Sedia comoda, ventaglio, snack, acqua" },
        { name: "Note salute", description: "Tempi di riposo, farmaci, no alcol" },
      ],
    },
    {
      name: "Bomboniere & Gadget",
      icon: "🎀",
      budgetPercent: 7,
      subcategories: [
        { name: "Bomboniera (candela, piantina, miele)", description: "Bomboniera artigianale o green" },
        { name: "Packaging (scatoline, nastri, tag)", description: "Packaging personalizzato" },
        { name: "Confetti (classici, aromatizzati)", description: "Selezione confetti e colori" },
        { name: "Bigliettini ringraziamento", description: "Testo e stampa biglietti" },
      ],
    },
    {
      name: "Logistica & Servizi",
      icon: "🚗",
      budgetPercent: 8,
      subcategories: [
        { name: "Trasporti & parcheggi", description: "Indicazioni, navetta se necessaria" },
        { name: "Noleggi tecnici (audio, microfono)", description: "Impianto audio, microfono" },
        { name: "Pulizie pre/post evento", description: "Servizio pulizie" },
        { name: "Sicurezza bimbi (area kids, tappeti)", description: "Area kids, coperture prese" },
        { name: "Piano B meteo", description: "Tenda, sala interna per emergenza" },
      ],
    },
    {
      name: "Post-Evento",
      icon: "📅",
      budgetPercent: 4,
      subcategories: [
        { name: "Selezione foto/video", description: "Condivisione album agli ospiti" },
        { name: "Ringraziamenti (messaggi, ecard, cartoline)", description: "Ringraziamenti personalizzati" },
        { name: "Resi & cambi regalo", description: "Gestione resi, scadenze, scontrini" },
        { name: "Bilancio finale", description: "Spese vs budget, note per futuro" },
      ],
    },
  ],
  timeline: [
    { phase: "T-6/T-5 settimane", items: [
      { title: "Definisci formato e tema", description: "Scegli tipo di evento, tema, palette e budget" },
      { title: "Pre-check location", description: "Verifica disponibilità location e opzioni" },
      { title: "Stila lista ospiti preliminare", description: "Compila lista ospiti e target" },
    ] },
    { phase: "T-4 settimane", items: [
      { title: "Prenota location e fornitori", description: "Prenota catering, fotografo, allestimenti" },
      { title: "Crea invito (bozza)", description: "Prepara bozza invito e struttura giochi" },
      { title: "Imposta lista nascita", description: "Crea lista nascita e raccolta fondi" },
    ] },
    { phase: "T-3 settimane", items: [
      { title: "Invia inviti + save-the-date", description: "Invia inviti e promemoria" },
      { title: "Ordina torta e dessert bar", description: "Ordina dolci e torta personalizzata" },
      { title: "Ordina decorazioni e noleggi", description: "Prenota decorazioni e arredi" },
      { title: "Seleziona outfit mamma", description: "Scegli abito e servizi beauty" },
      { title: "Conferma menù", description: "Definisci menù e opzioni bimbi" },
    ] },
    { phase: "T-2 settimane", items: [
      { title: "Sollecita RSVP", description: "Richiedi conferme e chiudi numeri" },
      { title: "Stila scaletta evento/giochi", description: "Definisci programma e giochi" },
      { title: "Stampa stationery", description: "Stampa welcome sign, segnaposto, tag" },
      { title: "Acquista premi giochi", description: "Acquista gadget e premi" },
      { title: "Definisci playlist", description: "Prepara playlist musicale" },
    ] },
    { phase: "T-1 settimana", items: [
      { title: "Conferme finali a location/catering/fotografo", description: "Ultime conferme fornitori" },
      { title: "Prepara kit giochi", description: "Prepara materiali e kit giochi" },
      { title: "Allinea team accoglienza", description: "Organizza accoglienza ospiti" },
      { title: "Predisponi QR album", description: "Prepara istruzioni album condiviso" },
      { title: "Prova set-up tavoli", description: "Testa disposizione tavoli e sweet table" },
    ] },
    { phase: "T-2/1 giorni", items: [
      { title: "Ritiro torta/dessert", description: "Ritira dolci e torta se necessario" },
      { title: "Pre-allestimento backdrop/sweet table", description: "Prepara backdrop e tavolo dolci" },
      { title: "Check attrezzature audio", description: "Verifica impianto audio e microfono" },
    ] },
    { phase: "Giorno evento", items: [
      { title: "Allestimento finale", description: "Allestimento location, segnaletica, corner foto" },
      { title: "Accoglienza ospiti", description: "Benvenuto e accoglienza" },
      { title: "Giochi (slot 45–60’)", description: "Gestione giochi e attività" },
      { title: "Taglio torta", description: "Taglio torta baby shower" },
      { title: "Ringraziamento finale", description: "Ringraziamenti a ospiti e fornitori" },
    ] },
    { phase: "+1/+7 giorni", items: [
      { title: "Condivisione foto/album", description: "Condividi album e foto agli ospiti" },
      { title: "Ringraziamenti personalizzati", description: "Invia messaggi, ecard, cartoline" },
      { title: "Resi/cambi regalo", description: "Gestione resi e cambi" },
      { title: "Bilancio spese", description: "Aggiorna bilancio finale" },
    ] },
  ],
  fields: [
    "fornitore", "costoPrevisto", "costoReale", "scadenza", "stato", "note", "allegati"
  ],
  tags: [
    "Allestimento", "Cibo&Bevande", "Giochi", "Lista Nascita", "Media", "Gadget", "Logistica", "Mamma"
  ],
  variants: [
    {
      name: "Sip & See",
      description: "Presentazione bebé post-nascita, orari brevi, no giochi competitivi",
      showSubcategories: ["Presentazione bebé", "Orari brevi", "No giochi competitivi"]
    }
  ]
};

export default babyShowerTemplate;
