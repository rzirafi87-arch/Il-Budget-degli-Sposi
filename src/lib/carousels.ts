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
    { src: "/carousels/default/01.svg", alt: "Motivo floreale astratto in verde", title: "Ispirazioni matrimonio" },
    { src: "/carousels/default/02.svg", alt: "Cuori e anelli stilizzati su sfondo tenue", title: "Idee creative" },
    { src: "/carousels/default/03.svg", alt: "Pattern elegante con foglie e petali", title: "Stile e dettagli" },
  ],
  atelier: [
    { src: "/carousels/default/02.svg", alt: "Dettagli sartoriali stilizzati" },
    { src: "/carousels/default/01.svg", alt: "Tessuti e motivi floreali" },
  ],
  catering: [
    { src: "/carousels/default/03.svg", alt: "Tavola imbandita astratta" },
    { src: "/carousels/default/01.svg", alt: "Palette verde delicata" },
  ],
  fotografi: [
    { src: "/carousels/default/01.svg", alt: "Cornici fotografiche minimal" },
    { src: "/carousels/default/03.svg", alt: "Scatti artistici astratti" },
  ],
  fiorai: [
    { src: "/carousels/default/01.svg", alt: "Bouquet stilizzato" },
    { src: "/carousels/default/03.svg", alt: "Petali e foglie" },
  ],
  beauty: [
    { src: "/carousels/default/02.svg", alt: "Make-up elegante astratto" },
  ],
  "wedding-planner": [
    { src: "/carousels/default/03.svg", alt: "Planning e timeline" },
  ],
  "musica-cerimonia": [
    { src: "/carousels/default/01.svg", alt: "Note musicali stilizzate" },
  ],
  "musica-ricevimento": [
    { src: "/carousels/default/02.svg", alt: "DJ e festa astratta" },
  ],
  gioiellerie: [
    { src: "/carousels/default/02.svg", alt: "Anelli intrecciati" },
  ],
  "save-the-date": [
    { src: "/carousels/default/03.svg", alt: "Calendario e inviti" },
  ],
  "cose-matrimonio": [
    { src: "/carousels/default/01.svg", alt: "Accessori per matrimonio" },
  ],
};

