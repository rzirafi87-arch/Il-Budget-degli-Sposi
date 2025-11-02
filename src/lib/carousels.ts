export type CarouselKey =
  | "default"
  | "atelier"
  | "catering"
  | "fotografi"
  | "fiorai"
  | "beauty"
  | "wedding-planner"
  | "musica-cerimonia"
  | "musica-ricevimento"
  | "gioiellerie"
  | "save-the-date"
  | "cose-matrimonio";

export const CAROUSEL_IMAGES: Record<CarouselKey, { src: string; alt: string; title?: string }[]> = {
  default: [
    {
      src: "/carousels/events/planning-desk.svg",
      alt: "Scrivania da wedding planner con quaderno, bouquet e fedi",
      title: "Organizza il tuo grande giorno",
    },
    {
      src: "/carousels/events/invitation-flatlay.svg",
      alt: "Invito calligrafato con fedi dorate e rosa avorio",
      title: "Inviti e coordinati eleganti",
    },
    {
      src: "/carousels/events/budget-overview.svg",
      alt: "Documento budget con grafici e candela accesa",
      title: "Budget sempre sotto controllo",
    },
  ],
  atelier: [
    { src: "/carousels/events/atelier-fitting.svg", alt: "Atelier con abito da sposa su manichino" },
    { src: "/carousels/events/planning-desk.svg", alt: "Moodboard con tessuti e quaderno matrimonio" },
  ],
  catering: [
    { src: "/carousels/events/menu-table.svg", alt: "Tavola apparecchiata con menu gourmet" },
    { src: "/carousels/events/wedding-accessories.svg", alt: "Flat lay con bouquet e dettagli da tavola" },
  ],
  fotografi: [
    { src: "/carousels/events/photography-moodboard.svg", alt: "Moodboard fotografico con macchina analogica" },
    { src: "/carousels/events/invitation-flatlay.svg", alt: "Dettaglio invito con scatto stampato" },
  ],
  fiorai: [
    { src: "/carousels/events/floral-arrangement.svg", alt: "Bouquet avorio con foglie verde salvia" },
    { src: "/carousels/events/wedding-accessories.svg", alt: "Accessori floreali per matrimonio" },
  ],
  beauty: [
    { src: "/carousels/events/beauty-vanity.svg", alt: "Postazione trucco sposa con palette e pennelli" },
  ],
  "wedding-planner": [
    { src: "/carousels/events/planning-desk.svg", alt: "Scrivania di wedding planner con timeline e bouquet" },
  ],
  "musica-cerimonia": [
    { src: "/carousels/events/ceremony-music.svg", alt: "Arpa dorata con spartiti per la cerimonia" },
  ],
  "musica-ricevimento": [
    { src: "/carousels/events/reception-dj.svg", alt: "Consolle DJ per festa di matrimonio" },
  ],
  gioiellerie: [
    { src: "/carousels/events/ring-box.svg", alt: "Cofanetto vellutato con fedi nuziali" },
  ],
  "save-the-date": [
    { src: "/carousels/events/invitation-flatlay.svg", alt: "Invito con fedi e rosa per il save the date" },
  ],
  "cose-matrimonio": [
    { src: "/carousels/events/wedding-accessories.svg", alt: "Accessori coordinati per il matrimonio" },
  ],
};

