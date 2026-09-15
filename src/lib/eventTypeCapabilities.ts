export type EventAvailabilityStatus = "READY" | "COMING_SOON" | "INTERNAL_ONLY";

export type EventModule =
  | "dashboard"
  | "budget"
  | "budget-ideas"
  | "guests"
  | "suppliers"
  | "location-reception"
  | "location-ceremony"
  | "churches"
  | "timeline"
  | "documents"
  | "accounting"
  | "save-the-date"
  | "favorites";

export type CeremonyMode = "religious_or_civil" | "religious" | "civil" | "none" | "not_configured";
export type LocationRole = "ceremony" | "reception" | "main_event" | "accommodation" | "after_party" | "other";

export type EventTypeCapability = {
  slug: string;
  availabilityStatus: EventAvailabilityStatus;
  publicVisible: boolean;
  enabledModules: readonly EventModule[];
  legacyAccessModules: readonly EventModule[];
  ceremonyMode: CeremonyMode;
  budgetTemplate: string | null;
  timelineTemplate: string | null;
  supplierCategories: readonly string[];
  locationRoles: readonly LocationRole[];
  guestModule: boolean;
  documentModule: boolean;
  churchModule: boolean;
  description: {
    it: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
};

const WEDDING_MODULES: readonly EventModule[] = [
  "dashboard",
  "budget",
  "budget-ideas",
  "guests",
  "suppliers",
  "location-reception",
  "location-ceremony",
  "churches",
  "timeline",
  "documents",
  "accounting",
  "save-the-date",
  "favorites",
];

const COMING_SOON_DESCRIPTION = {
  it: "Questo tipo di evento è visibile in anteprima ma non è ancora supportato con un flusso completo e coerente.",
  en: "This event type is visible as a preview but is not yet supported by a complete, coherent workflow.",
  es: "Este tipo de evento se muestra como vista previa, pero todavía no dispone de un flujo completo y coherente.",
  fr: "Ce type d’événement est visible en aperçu, mais ne dispose pas encore d’un parcours complet et cohérent.",
  de: "Dieser Veranstaltungstyp ist als Vorschau sichtbar, wird aber noch nicht durch einen vollständigen Ablauf unterstützt.",
} as const;

const comingSoon = (slug: string): EventTypeCapability => ({
  slug,
  availabilityStatus: "COMING_SOON",
  publicVisible: true,
  enabledModules: [],
  legacyAccessModules: ["dashboard"],
  ceremonyMode: "not_configured",
  budgetTemplate: null,
  timelineTemplate: null,
  supplierCategories: [],
  locationRoles: [],
  guestModule: false,
  documentModule: false,
  churchModule: false,
  description: COMING_SOON_DESCRIPTION,
});

export const EVENT_TYPE_CAPABILITIES: Record<string, EventTypeCapability> = {
  wedding: {
    slug: "wedding",
    availabilityStatus: "READY",
    publicVisible: true,
    enabledModules: WEDDING_MODULES,
    legacyAccessModules: WEDDING_MODULES,
    ceremonyMode: "religious_or_civil",
    budgetTemplate: "wedding",
    timelineTemplate: "wedding",
    supplierCategories: [
      "atelier",
      "beauty",
      "bomboniere",
      "catering",
      "decorazioni",
      "fiori",
      "fotografia-video",
      "musica-intrattenimento",
      "noleggi",
      "partecipazioni",
      "wedding-planner",
    ],
    locationRoles: ["ceremony", "reception", "accommodation", "after_party", "other"],
    guestModule: true,
    documentModule: true,
    churchModule: true,
    description: WEDDING_CAPABILITY_DESCRIPTION,
  },
  baptism: comingSoon("baptism"),
  eighteenth: comingSoon("eighteenth"),
  graduation: comingSoon("graduation"),
  confirmation: comingSoon("confirmation"),
  communion: comingSoon("communion"),
  anniversary: comingSoon("anniversary"),
  birthday: comingSoon("birthday"),
  fifty: comingSoon("fifty"),
  "gender-reveal": comingSoon("gender-reveal"),
  retirement: comingSoon("retirement"),
  "baby-shower": comingSoon("baby-shower"),
  "engagement-party": comingSoon("engagement-party"),
  proposal: comingSoon("proposal"),
  corporate: comingSoon("corporate"),
  "bar-mitzvah": comingSoon("bar-mitzvah"),
  quinceanera: comingSoon("quinceanera"),
  "charity-gala": comingSoon("charity-gala"),
  // Reserved for non-public lifecycle testing and future internal previews. It is
  // deliberately absent from every selector and can never create an event.
  "internal-preview": {
    ...comingSoon("internal-preview"),
    availabilityStatus: "INTERNAL_ONLY",
    publicVisible: false,
  },
};

const EVENT_TYPE_ALIASES: Record<string, string> = {
  WEDDING: "wedding",
  BAPTISM: "baptism",
  EIGHTEENTH: "eighteenth",
  GRADUATION: "graduation",
  CONFIRMATION: "confirmation",
  COMMUNION: "communion",
  ANNIVERSARY: "anniversary",
  BIRTHDAY: "birthday",
  FIFTY: "fifty",
  RETIREMENT: "retirement",
  GENDER_REVEAL: "gender-reveal",
  genderreveal: "gender-reveal",
  "gender_reveal": "gender-reveal",
  BABY_SHOWER: "baby-shower",
  babyshower: "baby-shower",
  ENGAGEMENT: "engagement-party",
  engagement: "engagement-party",
  CORP_EVENT: "corporate",
  BAR_MITZVAH: "bar-mitzvah",
  CHARITY_GALA: "charity-gala",
};

export function normalizeEventType(value: string | null | undefined): string {
  const raw = (value || "wedding").trim();
  return EVENT_TYPE_ALIASES[raw] || EVENT_TYPE_ALIASES[raw.toUpperCase()] || raw.toLowerCase();
}

export function getEventTypeCapability(value: string | null | undefined): EventTypeCapability {
  const normalized = normalizeEventType(value);
  return EVENT_TYPE_CAPABILITIES[normalized] || {
    ...comingSoon(normalized || "unknown"),
    availabilityStatus: "INTERNAL_ONLY",
    publicVisible: false,
  };
}

export type EventTypeRegistrationDecision =
  | { ok: true; eventType: "wedding" }
  | { ok: false; eventType: string; reason: "COMING_SOON" | "INTERNAL_ONLY" | "UNKNOWN" };

export function validateEventTypeForRegistration(value: unknown): EventTypeRegistrationDecision {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, eventType: "", reason: "UNKNOWN" };
  }
  const eventType = normalizeEventType(value);
  const capability = EVENT_TYPE_CAPABILITIES[eventType];
  if (!capability) return { ok: false, eventType, reason: "UNKNOWN" };
  if (capability.availabilityStatus === "COMING_SOON") {
    return { ok: false, eventType, reason: "COMING_SOON" };
  }
  if (capability.availabilityStatus === "INTERNAL_ONLY") {
    return { ok: false, eventType, reason: "INTERNAL_ONLY" };
  }
  return { ok: true, eventType: "wedding" };
}

export function publicEventTypeCapabilities(): EventTypeCapability[] {
  return Object.values(EVENT_TYPE_CAPABILITIES).filter((capability) => capability.publicVisible);
}

export function isEventTypeReady(value: string | null | undefined): boolean {
  return getEventTypeCapability(value).availabilityStatus === "READY";
}

export function isModuleEnabled(
  value: string | null | undefined,
  module: EventModule,
  options?: { legacy?: boolean }
): boolean {
  const capability = getEventTypeCapability(value);
  const modules = options?.legacy && capability.availabilityStatus !== "READY"
    ? capability.legacyAccessModules
    : capability.enabledModules;
  return modules.includes(module);
}

export const ROUTE_MODULE_RULES: ReadonlyArray<{ prefix: string; module: EventModule }> = [
  { prefix: "/idea-di-budget", module: "budget-ideas" },
  { prefix: "/budget", module: "budget" },
  { prefix: "/invitati", module: "guests" },
  { prefix: "/fornitori", module: "suppliers" },
  { prefix: "/cerimonia", module: "location-ceremony" },
  { prefix: "/chiese", module: "churches" },
  { prefix: "/location", module: "location-reception" },
  { prefix: "/timeline", module: "timeline" },
  { prefix: "/documenti", module: "documents" },
  { prefix: "/contabilita", module: "accounting" },
  { prefix: "/save-the-date", module: "save-the-date" },
  { prefix: "/preferiti", module: "favorites" },
  { prefix: "/dashboard", module: "dashboard" },
];

export function moduleForPath(pathname: string): EventModule | null {
  return ROUTE_MODULE_RULES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  )?.module || null;
}
import { WEDDING_CAPABILITY_DESCRIPTION } from "@/data/eventCapabilityDescriptions";
