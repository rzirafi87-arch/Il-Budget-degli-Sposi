export type GraduationCategory = { name: string; subs: string[] };

// Laurea – struttura completa con 10 categorie e sottocategorie
export function getGraduationTemplate(_country: string): GraduationCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: GraduationCategory[] = [
    {
      name: "Cerimonia Accademica",
      subs: [
        "Data e orario della proclamazione",
        "Prenotazione aula magna o sala (se privata)",
        "Relatore e correlatori (omaggi o regali simbolici)",
        "Tesi: stampa, rilegatura, copertine",
        "Corone d’alloro e bouquet",
        "Fotografo durante la proclamazione",
        "Permessi per accesso ospiti o fotografi",
      ],
    },
    {
      name: "Location e Ricevimento",
      subs: [
        "Scelta location (ristorante, rooftop, casa, giardino, locale, bar)",
        "Affitto sala privata o terrazza",
        "Allestimento tavoli e mise en place",
        "Decorazioni tematiche (colori università, fiori, palloncini, backdrop)",
        "Tableau, segnaposti, menù personalizzati",
        "Bomboniere o gift bag “Laurea”",
        "Allestimento angolo foto / photobooth / parete verde",
      ],
    },
    {
      name: "Catering / Ristorazione",
      subs: [
        "Pranzo o cena",
        "Apericena / buffet / finger food",
        "Bevande e cocktail bar",
        "Torta di laurea e dolci personalizzati",
        "Brindisi finale",
        "Servizio catering o locale scelto",
      ],
    },
    {
      name: "Abbigliamento e Beauty",
      subs: [
        "Outfit laureato/a (cerimonia + festa)",
        "Cambio abito (post-evento)",
        "Trucco e parrucco",
        "Accessori, scarpe, gioielli, camicia personalizzata",
        "Ghirlanda d’alloro (se non già in cerimonia)",
      ],
    },
    {
      name: "Foto, Video e Contenuti Social",
      subs: [
        "Fotografo / videomaker",
        "Shooting pre- e post-cerimonia",
        "Reel o mini-video per social",
        "Polaroid o photobooth",
        "Album digitale o fisico",
      ],
    },
    {
      name: "Inviti e Grafica",
      subs: [
        "Inviti digitali / cartacei",
        "Coordinato grafico (tema, colori, font)",
        "Menù, segnaposti, tableau, ringraziamenti",
        "Hashtag o QR code per raccolta foto/video",
      ],
    },
    {
      name: "Regali e Ringraziamenti",
      subs: [
        "Lista regali o “Gift Wallet”",
        "Ringraziamenti personalizzati",
        "Omaggio a relatore / correlatore / genitori",
        "Bomboniere e sacchetti confetti",
      ],
    },
    {
      name: "Musica e Intrattenimento",
      subs: [
        "DJ o playlist personalizzata",
        "Band live o sax performer",
        "Audio e luci per la festa",
        "Animazione o karaoke",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Auto per spostamenti università ↔ location",
        "Navetta ospiti (se location lontana)",
        "Parcheggi e permessi",
        "Pernottamenti ospiti (se da fuori città)",
      ],
    },
    {
      name: "Gestione Budget (in-app)",
      subs: [
        "Budget stimato",
        "Acconti versati",
        "Saldi",
        "Spese extra",
        "Totale finale",
        "Differenza (stimato vs speso)",
      ],
    },
  ];
  return base;
}

export function getGraduationBudgetPercentages() {
  // Percentuali indicative per ripartire il budget (somma ~100)
  return {
    "Cerimonia Accademica": 10,
    "Location e Ricevimento": 25,
    "Catering / Ristorazione": 30,
    "Abbigliamento e Beauty": 8,
    "Foto, Video e Contenuti Social": 10,
    "Inviti e Grafica": 5,
    "Regali e Ringraziamenti": 4,
    "Musica e Intrattenimento": 4,
    "Trasporti e Logistica": 2,
    "Gestione Budget (in-app)": 2,
  } as Record<string, number>;
}

