export type BarMitzvahCategory = { name: string; subs: string[] };

// Bar Mitzvah / Bat Mitzvah – struttura completa per celebrazione religiosa ebraica
export function getBarMitzvahTemplate(_country: string): BarMitzvahCategory[] {
  // Use parameter to satisfy no-unused-vars lint in strict mode
  void _country;
  const base: BarMitzvahCategory[] = [
    {
      name: "Cerimonia Religiosa",
      subs: [
        "Prenotazione sinagoga o tempio",
        "Coordinamento con rabbino",
        "Lezioni preparatorie Torah per il/la festeggiato/a",
        "Tutor ebraico o madrich",
        "Tallit (scialle di preghiera) e kippah personalizzati",
        "Tefillin (se Bar Mitzvah)",
        "Lettura Torah e haftarah - preparazione",
        "Servizio fotografico cerimonia (se consentito)",
      ],
    },
    {
      name: "Location Ricevimento",
      subs: [
        "Selezione venue per festa (hotel, sala banchetti, spazio eventi)",
        "Sopralluogo e caparra location",
        "Verifica kasher kitchen (se richiesta cucina kasher)",
        "Allestimento sale e spazi",
        "Parcheggi e accessibilità ospiti",
        "Permessi e autorizzazioni",
      ],
    },
    {
      name: "Allestimento e Decorazioni",
      subs: [
        "Tema e concept visivo (colori, stile)",
        "Decorazioni floreali e centrotavola",
        "Palloncini, luci, drappeggi",
        "Backdrop fotografico con nome e data",
        "Segnaletica e tableau",
        "Candele (havdalah set se richiesto)",
        "Allestimento tavolo Torah o simboli ebraici",
      ],
    },
    {
      name: "Catering Kasher",
      subs: [
        "Selezione catering kasher certificato",
        "Menu tasting e scelta piatti",
        "Aperitivo o cocktail di benvenuto",
        "Pranzo o cena completa",
        "Dolci e torta Bar/Bat Mitzvah",
        "Open bar e bevande (vino kasher, liquori)",
        "Servizio tavola e staff",
      ],
    },
    {
      name: "Inviti e Comunicazione",
      subs: [
        "Design inviti personalizzati (carta o digitali)",
        "Stampa inviti e buste",
        "Save the date",
        "Invio e tracking RSVP",
        "Menu cards e segnaposti",
        "Libretto cerimonia (siddur o programma personalizzato)",
        "Thank you cards post-evento",
      ],
    },
    {
      name: "Intrattenimento e Musica",
      subs: [
        "DJ o band live (musica klezmer, pop, dance)",
        "Cantore o chazan per cerimonia (se richiesto)",
        "Animazione per bambini/ragazzi",
        "Photobooth o corner selfie",
        "Giochi interattivi o attività",
        "Danze tradizionali (Hava Nagila, Hora)",
        "Video montaggio 'crescita del/della festeggiato/a'",
      ],
    },
    {
      name: "Foto e Video",
      subs: [
        "Fotografo professionista cerimonia + festa",
        "Videomaker per highlights e aftermovie",
        "Album fotografico o libro ricordo",
        "Stampa foto in tempo reale",
        "Drone per riprese aeree (se outdoor)",
        "Live streaming cerimonia (per parenti lontani)",
      ],
    },
    {
      name: "Abbigliamento Festeggiato/a",
      subs: [
        "Abito o tailleur elegante",
        "Tallit (scialle preghiera) personalizzato",
        "Kippah coordinata",
        "Scarpe e accessori",
        "Parrucchiere e makeup (per Bat Mitzvah)",
        "Prove abito e fitting",
      ],
    },
    {
      name: "Regali e Omaggi",
      subs: [
        "Bomboniere o favors per ospiti",
        "Kippah personalizzate per ospiti maschi",
        "Sacchetti confetti o dolciumi",
        "Regali per il/la festeggiato/a",
        "Tzedakah (donazioni benefiche) a nome del festeggiato",
        "Guestbook o albero firme",
      ],
    },
    {
      name: "Trasporti e Logistica",
      subs: [
        "Trasferimento sinagoga-location festa",
        "Navetta ospiti",
        "Parcheggi riservati",
        "Auto per festeggiato/a e famiglia",
        "Coordinamento orari cerimonia-festa",
      ],
    },
    {
      name: "Gestione Budget",
      subs: [
        "Budget totale stimato",
        "Acconti fornitori",
        "Spese extra impreviste",
        "Saldi finali",
        "Fondo emergenze",
        "Report finale spese",
      ],
    },
  ];
  return base;
}

// Budget percentuali per categoria
export function getBarMitzvahBudgetPercentages(): Record<string, number> {
  return {
    "Cerimonia Religiosa": 8,
    "Location Ricevimento": 20,
    "Allestimento e Decorazioni": 12,
    "Catering Kasher": 30,
    "Inviti e Comunicazione": 5,
    "Intrattenimento e Musica": 10,
    "Foto e Video": 10,
    "Abbigliamento Festeggiato/a": 3,
    "Regali e Omaggi": 2,
    "Trasporti e Logistica": 0,
    "Gestione Budget": 0,
  };
}

// Timeline per pianificare Bar/Bat Mitzvah
export type TimelinePhase = {
  phase: string;
  title?: string;
  months_before?: number;
  days_before?: number;
  tasks: string[];
};

export function getBarMitzvahTimeline(): TimelinePhase[] {
  return [
    {
      phase: "12+ MESI PRIMA",
      title: "Fondamenta Spirituali e Organizzative",
      months_before: 12,
      tasks: [
        "Scegli data Bar/Bat Mitzvah (coordinato con rabbino e sinagoga)",
        "Inizia studio Torah e preparazione spirituale",
        "Ingaggia tutor ebraico per lezioni",
        "Stabilisci budget totale famiglia",
        "Crea lista ospiti preliminare",
        "Prenota sinagoga per cerimonia",
      ],
    },
    {
      phase: "9 MESI PRIMA",
      title: "Location e Fornitori Principali",
      months_before: 9,
      tasks: [
        "Seleziona e prenota location ricevimento",
        "Ingaggia catering kasher certificato",
        "Prenota fotografo e videomaker",
        "Scegli tema e concept visivo festa",
        "Inizia ricerca DJ o band",
        "Ordina tallit personalizzato",
      ],
    },
    {
      phase: "6 MESI PRIMA",
      title: "Inviti e Dettagli",
      months_before: 6,
      tasks: [
        "Design e ordine inviti personalizzati",
        "Conferma menu con catering",
        "Prenota DJ/band e intrattenimento",
        "Scegli decorazioni e allestimenti",
        "Inizia shopping abito festeggiato/a",
        "Pianifica video montaggio ricordi",
      ],
    },
    {
      phase: "3 MESI PRIMA",
      title: "Comunicazione e Coordinamento",
      months_before: 3,
      tasks: [
        "Invia inviti ufficiali",
        "Tracking RSVP e conferme",
        "Ordina kippah e favors personalizzati",
        "Conferma dettagli con rabbino",
        "Prepara libretto cerimonia",
        "Organizza prove lettura Torah",
      ],
    },
    {
      phase: "1 MESE PRIMA",
      title: "Rifinitura e Prove",
      months_before: 1,
      tasks: [
        "Prova generale lettura Torah in sinagoga",
        "Finalizza numero ospiti e tableau",
        "Conferma tutti fornitori (catering, DJ, foto/video)",
        "Prove abito e accessori",
        "Prepara discorso di ringraziamento",
        "Verifica dettagli logistici (trasporti, parcheggi)",
        "Ordina bomboniere e favors finali",
      ],
    },
    {
      phase: "1 SETTIMANA PRIMA",
      title: "Controlli Finali",
      days_before: 7,
      tasks: [
        "Ultima prova lettura Torah",
        "Conferma orari con tutti fornitori",
        "Ritira tallit e kippah",
        "Prepara kit emergenza",
        "Riconferma menu e allergie ospiti",
        "Stampa materiali grafici (menu, segnaposti)",
      ],
    },
    {
      phase: "GIORNO DELLA CELEBRAZIONE",
      title: "Mazel Tov! 🕎",
      days_before: 0,
      tasks: [
        "Cerimonia in sinagoga - Aliyah alla Torah",
        "Lettura haftarah",
        "Benedizioni e discorso rabbino",
        "Kiddush post-cerimonia (se previsto)",
        "Trasferimento location festa",
        "Cocktail di benvenuto",
        "Cena o pranzo celebrativo",
        "Danze e intrattenimento",
        "Taglio torta e festeggiamenti",
      ],
    },
    {
      phase: "POST-EVENTO",
      title: "Ringraziamenti e Ricordi",
      days_before: -1,
      tasks: [
        "Invia thank you cards a ospiti",
        "Ricevi foto e video finali",
        "Condividi ricordi con parenti lontani",
        "Organizza donazione tzedakah",
        "Completa pagamenti fornitori",
        "Report finale budget",
      ],
    },
  ];
}

// Campi personalizzati per Bar/Bat Mitzvah
export type EventField = {
  name: string;
  type: "text" | "select" | "number" | "date";
  options?: string[];
  label: string;
  placeholder?: string;
};

export function getBarMitzvahFields(): EventField[] {
  return [
    {
      name: "celebration_type",
      type: "select",
      label: "Tipo Celebrazione",
      options: ["Bar Mitzvah (13 anni maschio)", "Bat Mitzvah (12-13 anni femmina)"],
    },
    {
      name: "kashrut_level",
      type: "select",
      label: "Livello Kasherut",
      options: [
        "Kasher rigoroso (certificato rabbinico)",
        "Kasher standard",
        "Parve (senza carne/latticini)",
        "Non kasher (solo lista ospiti)",
      ],
    },
    {
      name: "guest_count",
      type: "number",
      label: "Numero Ospiti Stimato",
      placeholder: "es. 150",
    },
    {
      name: "synagogue",
      type: "text",
      label: "Sinagoga/Tempio",
      placeholder: "Nome sinagoga",
    },
    {
      name: "party_theme",
      type: "text",
      label: "Tema Festa",
      placeholder: "es. Hollywood, Vintage, Colori oro e blu...",
    },
    {
      name: "torah_portion",
      type: "text",
      label: "Parashà (Porzione Torah)",
      placeholder: "es. Bereshit, Noach, Vayera...",
    },
  ];
}

// Suggerimenti fornitori
export type VendorSuggestion = {
  category: string;
  suggestions: string[];
};

export function getBarMitzvahVendorSuggestions(): VendorSuggestion[] {
  return [
    {
      category: "Catering Kasher",
      suggestions: [
        "Catering certificati Beth Din",
        "Catering kasher mehadrin",
        "Ristoranti kasher con servizio banqueting",
        "Chef kasher privati",
      ],
    },
    {
      category: "Location Kasher-Friendly",
      suggestions: [
        "Hotel con cucine kasher certificate",
        "Sale eventi con supervisione rabbinica",
        "Community center ebraici",
        "Ville con possibilità catering kasher esterno",
      ],
    },
    {
      category: "Fornitori Specializzati",
      suggestions: [
        "Negozi articoli religiosi ebraici (tallit, tefillin, kippah)",
        "Designer inviti tema ebraico",
        "Fotografi esperti in eventi ebraici",
        "DJ specializzati musica klezmer e festeggiamenti ebraici",
      ],
    },
    {
      category: "Tutor e Preparazione",
      suggestions: [
        "Madrich (insegnante Torah)",
        "Cantore per lezioni canto liturgico",
        "Rabbino per consulenza spirituale",
        "Corsi preparazione Bar/Bat Mitzvah comunitari",
      ],
    },
  ];
}
