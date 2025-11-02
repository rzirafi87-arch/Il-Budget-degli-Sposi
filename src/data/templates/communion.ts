export type CommunionCategory = { name: string; subs: string[] };

// Prima Comunione – struttura completa con 10 categorie e sottocategorie
export function getCommunionTemplate(_country: string): CommunionCategory[] {
  void _country; // reserved for future country-specific variations
  const base: CommunionCategory[] = [
    {
      name: "Cerimonia religiosa",
      subs: [
        "Prenotazione chiesa / oratorio",
        "Documentazione e incontro con il parroco",
        "Corso preparazione comunione",
        "Offerta parrocchia",
        "Permesso per fotografo in chiesa",
        "Fioraio per altare e panche",
        "Candele e simboli religiosi (croce, rosario, Bibbia, angioletto)",
        "Servizio fotografico in chiesa",
      ],
    },
    {
      name: "Location e ricevimento",
      subs: [
        "Scelta location (ristorante, villa, giardino, casa privata)",
        "Noleggio sala / spazio esterno",
        "Allestimento tavoli e mise en place",
        "Decorazioni a tema comunione (fiori, calice, spighe, colombe, elementi naturali)",
        "Tableau e segnaposti",
        "Bomboniere e confettata",
        "Tovagliato e stoviglie coordinate",
        "Allestimento angolo foto o backdrop",
      ],
    },
    {
      name: "Catering / Ristorazione",
      subs: [
        "Pranzo o buffet (menù adulti e bambini)",
        "Aperitivo / antipasto di benvenuto",
        "Bevande e vini",
        "Torta di comunione personalizzata",
        "Pasticceria e dolci vari",
        "Servizio catering o ristorante",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Abito comunione (bambino/a)",
        "Scarpe e accessori",
        "Acconciatura / parrucchiere",
        "Abbigliamento genitori e fratelli",
        "Fiori o coroncina per capelli (bambina)",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo in chiesa",
        "Servizio fotografico post-cerimonia",
        "Mini album o cornice digitale",
        "Videomaker o reel breve ricordo",
        "Polaroid corner o set selfie",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Partecipazioni / inviti cartacei o digitali",
        "Biglietti di ringraziamento",
        "Coordinato grafico (menù, tableau, segnaposti)",
        "Cartellonistica personalizzata",
        "Tema grafico con simbolo religioso stilizzato (ostia, colomba, ramoscello d’ulivo)",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Regali per il bambino/a",
        "Lista regali / busta simbolica",
        "Bomboniere / sacchetti / confettata",
        "Biglietti di ringraziamento personalizzati",
        "Omaggi per padrino / madrina",
      ],
    },
    {
      name: "Intrattenimento",
      subs: [
        "Animazione bambini (giochi, bolle di sapone, trucca-bimbi, mago, clown)",
        "Musica di sottofondo soft",
        "Mini spettacolo o giochi organizzati",
        "Angolo dolci o carretto gelati",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto per famiglia",
        "Parcheggi ospiti",
        "Trasporto invitati da chiesa a location",
        "Permessi comunali o accesso centro storico",
      ],
    },
    {
      name: "Gestione Budget (in-app)",
      subs: [
        "Budget stimato",
        "Acconti versati",
        "Saldi fornitori",
        "Spese extra / imprevisti",
        "Totale finale e differenza",
      ],
    },
  ];
  return base;
}

// Percentuali budget suggerite (somma 100)
export function getCommunionBudgetPercentages() {
  return {
    "Cerimonia religiosa": 10,
    "Location e ricevimento": 24,
    "Catering / Ristorazione": 30,
    "Abbigliamento e Beauty": 7,
    "Foto e Video": 8,
    "Inviti e Grafica": 5,
    "Regali e Ringraziamenti": 6,
    "Intrattenimento": 5,
    "Trasporti e Logistica": 3,
    "Gestione Budget (in-app)": 2,
  } as Record<string, number>;
}
