import { WEDDING_BUDGET_TAXONOMY, type WeddingBudgetItem } from "@/constants/budgetCategories";

export type WeddingBudgetLocale = "it" | "en" | "es" | "fr" | "de";
export type LocalizedWeddingBudgetItem = WeddingBudgetItem & {
  canonicalKey: string;
  canonicalCategory: string;
  categoryLabel: string;
  searchAliases: readonly string[];
  presentationContexts: readonly string[];
};

const CATEGORY_LABELS: Record<WeddingBudgetLocale, Record<string, string>> = {
  it: {
    "Abiti & Accessori (altri)": "Abiti & Accessori (altri)", Cerimonia: "Cerimonia", "Wedding Bag": "Wedding Bag", "Fuochi d'artificio": "Fuochi d'artificio", "Fiori & Decor": "Fiori & Decor", "Foto & Video": "Foto & Video", "Inviti & Stationery": "Inviti & Stationery", Sposa: "Sposa", Sposo: "Sposo", "Ricevimento Location": "Ricevimento Location", "Musica & Intrattenimento": "Musica & Intrattenimento", Trasporti: "Trasporti", "Bomboniere & Regali": "Bomboniere & Regali", "Ospitalita & Logistica": "Ospitalità & Logistica", Burocrazia: "Burocrazia", "Addio al Nubilato": "Addio al Nubilato", "Addio al Celibato": "Addio al Celibato", "Beauty & Benessere": "Beauty & Benessere", "Viaggio di nozze": "Viaggio di nozze", "Wedding Planner": "Wedding Planner", "Musica Cerimonia": "Musica Cerimonia", "Musica Ricevimento": "Musica Ricevimento", "Comunicazione & Media": "Comunicazione & Media", "Extra & Contingenze": "Extra & Contingenze"
  },
  en: {
    "Abiti & Accessori (altri)": "Attire & Accessories", Cerimonia: "Ceremony", "Wedding Bag": "Wedding Bag", "Fuochi d'artificio": "Fireworks", "Fiori & Decor": "Flowers & Decor", "Foto & Video": "Photo & Video", "Inviti & Stationery": "Invitations & Stationery", Sposa: "Bride", Sposo: "Groom", "Ricevimento Location": "Wedding Reception", "Musica & Intrattenimento": "Music & Entertainment", Trasporti: "Transportation", "Bomboniere & Regali": "Wedding Favors & Gifts", "Ospitalita & Logistica": "Hospitality & Logistics", Burocrazia: "Paperwork", "Addio al Nubilato": "Bachelorette Party", "Addio al Celibato": "Bachelor Party", "Beauty & Benessere": "Beauty & Wellness", "Viaggio di nozze": "Honeymoon", "Wedding Planner": "Wedding Planner", "Musica Cerimonia": "Ceremony Music", "Musica Ricevimento": "Reception Music", "Comunicazione & Media": "Communication & Media", "Extra & Contingenze": "Extras & Contingency"
  },
  es: {
    "Abiti & Accessori (altri)": "Vestuario y accesorios", Cerimonia: "Ceremonia", "Wedding Bag": "Wedding Bag", "Fuochi d'artificio": "Fuegos artificiales", "Fiori & Decor": "Flores y decoración", "Foto & Video": "Foto y vídeo", "Inviti & Stationery": "Invitaciones y papelería", Sposa: "Novia", Sposo: "Novio", "Ricevimento Location": "Recepción y espacio", "Musica & Intrattenimento": "Música y animación", Trasporti: "Transporte", "Bomboniere & Regali": "Detalles y regalos", "Ospitalita & Logistica": "Hospitalidad y logística", Burocrazia: "Trámites", "Addio al Nubilato": "Despedida de soltera", "Addio al Celibato": "Despedida de soltero", "Beauty & Benessere": "Belleza y bienestar", "Viaggio di nozze": "Luna de miel", "Wedding Planner": "Wedding Planner", "Musica Cerimonia": "Música de ceremonia", "Musica Ricevimento": "Música de la recepción", "Comunicazione & Media": "Comunicación y medios", "Extra & Contingenze": "Extras e imprevistos"
  },
  fr: {
    "Abiti & Accessori (altri)": "Tenues et accessoires", Cerimonia: "Cérémonie", "Wedding Bag": "Wedding Bag", "Fuochi d'artificio": "Feux d’artifice", "Fiori & Decor": "Fleurs et décoration", "Foto & Video": "Photo et vidéo", "Inviti & Stationery": "Faire-part et papeterie", Sposa: "Mariée", Sposo: "Marié", "Ricevimento Location": "Réception et lieu", "Musica & Intrattenimento": "Musique et animation", Trasporti: "Transport", "Bomboniere & Regali": "Cadeaux invités et cadeaux", "Ospitalita & Logistica": "Hébergement et logistique", Burocrazia: "Démarches", "Addio al Nubilato": "Enterrement de vie de jeune fille", "Addio al Celibato": "Enterrement de vie de garçon", "Beauty & Benessere": "Beauté et bien-être", "Viaggio di nozze": "Voyage de noces", "Wedding Planner": "Wedding Planner", "Musica Cerimonia": "Musique de cérémonie", "Musica Ricevimento": "Musique de réception", "Comunicazione & Media": "Communication et médias", "Extra & Contingenze": "Extras et imprévus"
  },
  de: {
    "Abiti & Accessori (altri)": "Kleidung & Accessoires", Cerimonia: "Trauung", "Wedding Bag": "Wedding Bag", "Fuochi d'artificio": "Feuerwerk", "Fiori & Decor": "Blumen & Dekoration", "Foto & Video": "Foto & Video", "Inviti & Stationery": "Einladungen & Papeterie", Sposa: "Braut", Sposo: "Bräutigam", "Ricevimento Location": "Hochzeitsfeier & Location", "Musica & Intrattenimento": "Musik & Unterhaltung", Trasporti: "Transport", "Bomboniere & Regali": "Gastgeschenke & Geschenke", "Ospitalita & Logistica": "Unterkunft & Logistik", Burocrazia: "Formalitäten", "Addio al Nubilato": "Junggesellinnenabschied", "Addio al Celibato": "Junggesellenabschied", "Beauty & Benessere": "Beauty & Wellness", "Viaggio di nozze": "Flitterwochen", "Wedding Planner": "Wedding Planner", "Musica Cerimonia": "Musik zur Trauung", "Musica Ricevimento": "Musik zur Feier", "Comunicazione & Media": "Kommunikation & Medien", "Extra & Contingenze": "Extras & Reserve"
  },
};

const LABELS: Record<Exclude<WeddingBudgetLocale, "it">, readonly string[]> = {
  en: [
    "Guest / Parent Attire","Bridesmaid Accessories","Witness / Attendant Accessories","Wedding Rings","Engagement Ring","Other Accessories",
    "Church / Civil Ceremony Venue","Ceremony Flowers","Church Cleaning","Gift Basket","Documents & Paperwork","Fees / Donations","Doves for the Exit","Toast Bottle","Toast Glasses","Ceremony Package",
    "Tissues","Rice or Petals","Ceremony Booklet","Sweets or Mints","Fan","Soap Bubbles","Emergency Kit","Mini Bottle of Water","Mosquito Repellent",
    "Traditional Fireworks","Spark Fountains","Fireworks Display","Sparklers for Guests","Sky Lantern Release","Fireworks Package",
    "Bouquet","Boutonniere","Centerpieces","Decorations","Candles","Seating Chart","Vase & Structure Rental","Florist Package","Corsage","Decorative Lighting",
    "Wedding Photography","Video","Drone","Album","Prints","Second Photography Team","Photographer Package",
    "Wedding Invitations","Digital Invitation","Save the Date","Timeline / Order of the Day","Menu","Place Card","Stamps / Dies","Postage / Shipping","Calligraphy","Cards / Tags","QR Code / Printing",
    "Wedding Dress","Bridal Shoes","Accessories (Veil, Jewelry, etc.)","Lingerie / Petticoat","Bridal Hairstylist","Bridal Makeup Artist","Trials","Other Bridal Expenses",
    "Groom's Suit","Groom's Shoes","Accessories (Tie, Cufflinks, etc.)","Barber / Grooming","Fittings","Other Groom Expenses",
    "Venue Rental","Catering / Banqueting","Wedding Cake","Wine & Drinks","Open Bar","Table Setting","Linen / Tableware Rental","Venue Package","Catering Package (Price per Person)",
    "DJ / Band","Sound / Lighting","Entertainment","SIAE Music License","Audio Guestbook / Stations","Music & Entertainment Package",
    "Wedding Car","Driver","Guest Shuttles","Fuel / Tolls",
    "Wedding Favors","Sugared Almonds","Packaging / Boxes","Wedding Favor Table Styling","Gift for Witnesses","Gift for Bridesmaids","Gift for Page Boys","Wedding Favor Preparation",
    "Guest Accommodation","Welcome Bag / Kit","Signs / Wayfinding",
    "Marriage Banns","Certificates","Translations / Apostille",
    "Bachelorette Party Venue","Restaurant / Dinner","Activities / Experiences","Gadgets / T-Shirts","Decorations / Balloons","Transportation","Accommodation","Bachelorette Party Package",
    "Bachelor Party Venue","Restaurant / Dinner","Activities / Experiences","Gadgets / T-Shirts","Decorations / Balloons","Transportation","Accommodation","Bachelor Party Package",
    "Beauty Consultant","Spa / Massages","Tanning",
    "Honeymoon Package","Insurance","Visas / Documents","Passport","Extras",
    "Consultation","Full Planning","Partial Planning","Wedding Day Coordination","Wedding Planner Package",
    "Choir","Soprano","Organ","Harp","Violin","Cello","Instrumental Ensemble","Ceremony Music Package",
    "DJ","Live Band","Orchestra","Acoustic Duo","Pianist","Reception Music Package",
    "Website / QR Code","Social Media","Graphic Design",
    "Contingency","Miscellaneous Expenses"
  ],
  es: [
    "Vestuario de invitados / Padres","Accesorios de damas de honor","Accesorios de testigos","Alianzas","Anillo de compromiso","Otros accesorios",
    "Iglesia / Registro civil","Flores para la ceremonia","Limpieza de la iglesia","Cesta de ofrendas","Documentos y trámites","Tasas / Donativos","Palomas a la salida","Botella para el brindis","Copas para el brindis","Paquete de ceremonia",
    "Pañuelos","Arroz o pétalos","Libreto de la ceremonia","Caramelos o mentas","Abanico","Pompas de jabón","Kit de emergencia","Botellita de agua","Repelente de mosquitos",
    "Fuegos artificiales tradicionales","Fuentes luminosas","Espectáculo de fuegos artificiales","Bengalas para invitados","Suelta de farolillos","Paquete de fuegos artificiales",
    "Ramo","Prendido","Centros de mesa","Decoración","Velas","Plan de mesas","Alquiler de jarrones y estructuras","Paquete de floristería","Corsage","Iluminación decorativa",
    "Reportaje fotográfico","Vídeo","Dron","Álbum","Copias impresas","Segundo equipo de fotografía","Paquete de fotografía",
    "Invitaciones de boda","Invitación digital","Save the Date","Cronograma / Programa del día","Menú","Marcasitio","Sellos / Troqueles","Franqueo / Envíos","Caligrafía","Tarjetas / Etiquetas","Código QR / Impresión",
    "Vestido de novia","Zapatos de novia","Accesorios (Velo, Joyas, etc.)","Lencería / Enagua","Peluquería de novia","Maquillaje de novia","Pruebas","Otros gastos de la novia",
    "Traje del novio","Zapatos del novio","Accesorios (Corbata, Gemelos, etc.)","Barbería / Grooming","Pruebas","Otros gastos del novio",
    "Alquiler del espacio","Catering / Banquete","Tarta nupcial","Vinos y bebidas","Barra libre","Montaje de mesa","Alquiler de mantelería / Vajilla","Paquete del espacio","Paquete de catering (Precio por persona)",
    "DJ / Grupo","Sonido / Iluminación","Animación","Licencia de música SIAE","Audiolibro de firmas / Estaciones","Paquete de música y animación",
    "Coche de los novios","Conductor","Traslados para invitados","Combustible / Peajes",
    "Detalles para invitados","Almendras confitadas","Embalaje / Cajas","Decoración de la mesa de detalles","Regalo para testigos","Regalo para damas de honor","Regalo para pajes","Preparación de detalles",
    "Alojamiento de invitados","Welcome Bag / Kit","Cartelería / Señalización",
    "Expediente matrimonial","Certificados","Traducciones / Apostilla",
    "Espacio para despedida de soltera","Restaurante / Cena","Actividades / Experiencias","Gadgets / Camisetas","Decoración / Globos","Transporte","Alojamiento","Paquete de despedida de soltera",
    "Espacio para despedida de soltero","Restaurante / Cena","Actividades / Experiencias","Gadgets / Camisetas","Decoración / Globos","Transporte","Alojamiento","Paquete de despedida de soltero",
    "Asesoría de belleza","Spa / Masajes","Solárium",
    "Viaje de novios","Seguros","Visados / Documentos","Pasaporte","Extras",
    "Asesoría","Planificación integral","Planificación parcial","Coordinación del día de la boda","Paquete de wedding planner",
    "Coro","Soprano","Órgano","Arpa","Violín","Violonchelo","Conjunto instrumental","Paquete de música de ceremonia",
    "DJ","Grupo en directo","Orquesta","Dúo acústico","Pianista","Paquete de música para la recepción",
    "Sitio web / Código QR","Redes sociales","Diseño gráfico",
    "Imprevistos","Gastos varios"
  ],
  fr: [
    "Tenues des invités / Parents","Accessoires des demoiselles d’honneur","Accessoires des témoins","Alliances","Bague de fiançailles","Autres accessoires",
    "Église / Mairie","Fleurs de cérémonie","Nettoyage de l’église","Panier d’offrandes","Documents et démarches","Frais / Dons","Colombes à la sortie","Bouteille pour le toast","Verres pour le toast","Forfait cérémonie",
    "Mouchoirs","Riz ou pétales","Livret de cérémonie","Bonbons ou pastilles","Éventail","Bulles de savon","Kit de secours","Mini-bouteille d’eau","Répulsif anti-moustiques",
    "Feux d’artifice traditionnels","Fontaines lumineuses","Spectacle pyrotechnique","Cierges magiques pour les invités","Lâcher de lanternes","Forfait feux d’artifice",
    "Bouquet","Boutonnière","Centres de table","Décoration","Bougies","Plan de table","Location de vases et structures","Forfait fleuriste","Corsage","Éclairage décoratif",
    "Reportage photo","Vidéo","Drone","Album","Tirages","Deuxième équipe photo","Forfait photographe",
    "Faire-part","Invitation numérique","Save the Date","Planning / Programme de la journée","Menu","Marque-place","Tampons / Découpes","Affranchissement / Envois","Calligraphie","Cartes / Étiquettes","QR Code / Impression",
    "Robe de mariée","Chaussures de mariée","Accessoires (Voile, Bijoux, etc.)","Lingerie / Jupon","Coiffeur de la mariée","Maquilleur / Maquilleuse de la mariée","Essais","Autres dépenses de la mariée",
    "Costume du marié","Chaussures du marié","Accessoires (Cravate, Boutons de manchette, etc.)","Barbier / Soins","Essayages","Autres dépenses du marié",
    "Location du lieu","Traiteur / Banquet","Gâteau de mariage","Vins et boissons","Open Bar","Mise en place","Location de linge / Vaisselle","Forfait lieu de réception","Forfait traiteur (Prix par personne)",
    "DJ / Groupe","Sonorisation / Éclairage","Animation","Droits musicaux SIAE","Livre d’or audio / Bornes","Forfait musique et animation",
    "Voiture des mariés","Chauffeur","Navettes invités","Carburant / Péages",
    "Cadeaux invités","Dragées","Emballages / Boîtes","Décoration de la table des cadeaux","Cadeau pour les témoins","Cadeau pour les demoiselles d’honneur","Cadeau pour les enfants d’honneur","Préparation des cadeaux invités",
    "Hébergement des invités","Welcome Bag / Kit","Signalétique",
    "Publication des bans","Certificats","Traductions / Apostille",
    "Lieu d’enterrement de vie de jeune fille","Restaurant / Dîner","Activités / Expériences","Gadgets / T-Shirts","Décoration / Ballons","Transport","Hébergement","Forfait EVJF",
    "Lieu d’enterrement de vie de garçon","Restaurant / Dîner","Activités / Expériences","Gadgets / T-Shirts","Décoration / Ballons","Transport","Hébergement","Forfait EVG",
    "Conseiller beauté","Spa / Massages","Solarium",
    "Voyage de noces","Assurances","Visas / Documents","Passeport","Extras",
    "Conseil","Organisation complète","Organisation partielle","Coordination du jour J","Forfait wedding planner",
    "Chœur","Soprano","Orgue","Harpe","Violon","Violoncelle","Ensemble instrumental","Forfait musique de cérémonie",
    "DJ","Groupe live","Orchestre","Duo acoustique","Pianiste","Forfait musique de réception",
    "Site web / QR Code","Réseaux sociaux","Création graphique",
    "Imprévus","Dépenses diverses"
  ],
  de: [
    "Outfits für Gäste / Eltern","Accessoires für Brautjungfern","Accessoires für Trauzeugen","Eheringe","Verlobungsring","Weitere Accessoires",
    "Kirche / Standesamt","Blumenschmuck für die Trauung","Kirchenreinigung","Gabenkorb","Dokumente und Formalitäten","Gebühren / Spenden","Tauben beim Auszug","Flasche für den Toast","Gläser für den Toast","Trauungspaket",
    "Taschentücher","Reis oder Blütenblätter","Trauheft","Bonbons oder Minzpastillen","Fächer","Seifenblasen","Notfallset","Mini-Wasserflasche","Mückenspray",
    "Klassisches Feuerwerk","Leuchtfontänen","Feuerwerksshow","Wunderkerzen für Gäste","Himmelslaternen","Feuerwerkspaket",
    "Brautstrauß","Ansteckblume","Tischdekoration","Dekoration","Kerzen","Sitzplan","Vasen- und Strukturverleih","Floristikpaket","Corsage","Stimmungsbeleuchtung",
    "Hochzeitsfotografie","Video","Drohne","Album","Abzüge","Zweites Fototeam","Fotografiepaket",
    "Hochzeitseinladungen","Digitale Einladung","Save the Date","Tagesablauf / Programm","Menü","Platzkarte","Stempel / Stanzen","Porto / Versand","Kalligrafie","Karten / Anhänger","QR-Code / Druck",
    "Brautkleid","Brautschuhe","Accessoires (Schleier, Schmuck usw.)","Dessous / Unterrock","Brautfrisur","Braut-Make-up","Probetermine","Weitere Ausgaben der Braut",
    "Anzug des Bräutigams","Schuhe des Bräutigams","Accessoires (Krawatte, Manschettenknöpfe usw.)","Barbier / Grooming","Anproben","Weitere Ausgaben des Bräutigams",
    "Locationmiete","Catering / Bankett","Hochzeitstorte","Wein & Getränke","Open Bar","Tischgestaltung","Tischwäsche- / Geschirrverleih","Locationpaket","Cateringpaket (Preis pro Person)",
    "DJ / Band","Ton / Licht","Unterhaltung","SIAE-Musiklizenz","Audio-Gästebuch / Stationen","Musik- und Unterhaltungspaket",
    "Hochzeitsauto","Fahrer","Gäste-Shuttles","Kraftstoff / Maut",
    "Gastgeschenke","Gezuckerte Mandeln","Verpackung / Schachteln","Dekoration des Gastgeschenktischs","Geschenk für Trauzeugen","Geschenk für Brautjungfern","Geschenk für Blumenkinder","Vorbereitung der Gastgeschenke",
    "Unterkunft für Gäste","Welcome Bag / Kit","Beschilderung / Wegweisung",
    "Aufgebot","Bescheinigungen","Übersetzungen / Apostille",
    "Location für den Junggesellinnenabschied","Restaurant / Abendessen","Aktivitäten / Erlebnisse","Gadgets / T-Shirts","Dekoration / Luftballons","Transport","Unterkunft","Paket Junggesellinnenabschied",
    "Location für den Junggesellenabschied","Restaurant / Abendessen","Aktivitäten / Erlebnisse","Gadgets / T-Shirts","Dekoration / Luftballons","Transport","Unterkunft","Paket Junggesellenabschied",
    "Beauty-Beratung","Spa / Massagen","Solarium",
    "Flitterwochen","Versicherungen","Visa / Dokumente","Reisepass","Extras",
    "Beratung","Komplettplanung","Teilplanung","Koordination am Hochzeitstag","Wedding-Planner-Paket",
    "Chor","Sopran","Orgel","Harfe","Violine","Cello","Instrumentalensemble","Musikpaket für die Trauung",
    "DJ","Live-Band","Orchester","Akustik-Duo","Pianist","Musikpaket für die Feier",
    "Website / QR-Code","Social Media","Grafikdesign",
    "Puffer für Unvorhergesehenes","Sonstige Ausgaben"
  ],
};

const SPECIAL_ALIASES: Partial<Record<string, Partial<Record<WeddingBudgetLocale, readonly string[]>>>> = {
  "wedding.ceremony.booklet": {
    it: ["Libretto Messa", "Libretti Messa", "Libretto della messa", "Libretto della messa o del rito", "Libretti cerimonia"],
    en: ["Booklet", "Ceremony Booklet", "Wedding Ceremony Booklet", "Order of Service"],
    es: ["Libreto", "Libreto de ceremonia", "Programa de ceremonia"],
    fr: ["Livret", "Livret de cérémonie", "Programme de cérémonie"],
    de: ["Trauheft", "Zeremonieheft", "Ablaufheft"],
  },
  "wedding.guest-comfort.fan": {
    it: ["Ventaglio", "Ventagli"], en: ["Fan", "Fans", "Hand Fan", "Hand Fans"], es: ["Abanico", "Abanicos"], fr: ["Éventail", "Éventails"], de: ["Fächer", "Handfächer"],
  },
  "wedding.stationery.place-card": {
    it: ["Segnaposto", "Segnaposti", "Tableau / segnaposto"], en: ["Place Card", "Place Cards"], es: ["Marcasitio", "Marcasitios", "Tarjeta de mesa"], fr: ["Marque-place", "Marque-places"], de: ["Platzkarte", "Platzkarten"],
  },
  "wedding.sposa.make.up.artist": {
    en: ["Makeup", "Make-up", "Makeup Artist", "Make-up Artist", "Bridal Makeup", "Bridal Make-up"], es: ["Maquillaje", "Maquillador", "Maquilladora", "Maquillaje de novia"], fr: ["Maquillage", "Maquilleur", "Maquilleuse", "Maquillage mariée"], de: ["Make-up", "Braut-Make-up", "Visagist", "Visagistin"],
  },
  "wedding.foto.video.servizio.fotografico": {
    en: ["Photographer", "Photography", "Wedding Photographer"], es: ["Fotógrafo", "Fotógrafa", "Fotografía de boda"], fr: ["Photographe", "Photographie de mariage"], de: ["Fotograf", "Fotografin", "Hochzeitsfotograf"],
  },
  "wedding.trasporti.autista": {
    en: ["Driver", "Chauffeur"], es: ["Conductor", "Chófer"], fr: ["Chauffeur", "Conducteur"], de: ["Fahrer", "Chauffeur"],
  },
  "wedding.fiori.decor.corsage": {
    en: ["Corsage", "Wrist Corsage"], es: ["Corsage", "Ramillete de muñeca"], fr: ["Corsage", "Bracelet floral"], de: ["Corsage", "Handgelenkblume"],
  },
  "wedding.musica.cerimonia.soprano": {
    en: ["Soprano", "Soprano Singer"], es: ["Soprano", "Cantante soprano"], fr: ["Soprano", "Chanteuse soprano"], de: ["Sopran", "Sopransängerin"],
  },
  "wedding.bomboniere.regali.confetti": {
    en: ["Sugared Almonds", "Wedding Almonds", "Jordan Almonds"], es: ["Almendras confitadas", "Almendras de boda"], fr: ["Dragées", "Dragées de mariage"], de: ["Gezuckerte Mandeln", "Hochzeitsmandeln"],
  },
};

const SPECIAL_CONTEXTS: Record<string, Record<WeddingBudgetLocale, string>> = {
  "Comfort ospiti": { it: "Comfort ospiti", en: "Guest Comfort", es: "Comodidad de invitados", fr: "Confort des invités", de: "Gästekomfort" },
};

function localizeContext(context: string, locale: WeddingBudgetLocale) {
  return CATEGORY_LABELS[locale][context] ?? SPECIAL_CONTEXTS[context]?.[locale] ?? context;
}

function unique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function getWeddingBudgetTaxonomy(locale: WeddingBudgetLocale): LocalizedWeddingBudgetItem[] {
  const localizedLabels = locale === "it" ? null : LABELS[locale];
  return WEDDING_BUDGET_TAXONOMY.map((item, index) => {
    const label = localizedLabels?.[index] ?? item.label;
    const aliases = locale === "it"
      ? unique([label, ...item.aliases, ...(SPECIAL_ALIASES[item.key]?.it ?? [])])
      : unique([label, ...(SPECIAL_ALIASES[item.key]?.[locale] ?? [])]);
    return {
      ...item,
      canonicalKey: item.key,
      canonicalCategory: item.category,
      categoryLabel: CATEGORY_LABELS[locale][item.category] ?? item.category,
      label,
      aliases,
      searchAliases: aliases,
      presentationContexts: unique(item.contexts.map((context) => localizeContext(context, locale))),
    };
  });
}

export function getLocalizedWeddingBudgetItem(canonicalKey: string, locale: WeddingBudgetLocale) {
  return getWeddingBudgetTaxonomy(locale).find((item) => item.canonicalKey === canonicalKey);
}

export function getWeddingBudgetCategoryLabel(category: string, locale: WeddingBudgetLocale) {
  return CATEGORY_LABELS[locale][category] ?? category;
}

export const WEDDING_BUDGET_TRANSLATION_COUNTS = Object.fromEntries(
  (["it", "en", "es", "fr", "de"] as const).map((locale) => [locale, getWeddingBudgetTaxonomy(locale).length]),
) as Record<WeddingBudgetLocale, number>;
