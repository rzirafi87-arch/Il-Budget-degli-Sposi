/**
 * Event Types Configuration
 * Single source of truth for all supported event types
 */

export type EventType = {
  code: string;
  icon?: string;
  label: string;
  active?: boolean;
};

export const EVENT_TYPES: EventType[] = [
  { code: "WEDDING", icon: "\u{1F48D}", label: "Matrimonio", active: true },
  { code: "BAPTISM", icon: "\u{1F54A}\u{FE0F}", label: "Battesimo", active: true },
  { code: "EIGHTEENTH", icon: "\u{1F389}", label: "Diciottesimo", active: true },
  { code: "ANNIVERSARY", icon: "\u{1F49E}", label: "Anniversario di matrimonio", active: true },
  { code: "GENDER_REVEAL", icon: "\u{1F37C}", label: "Gender Reveal", active: true },
  { code: "BIRTHDAY", icon: "\u{1F382}", label: "Compleanno", active: true },
  { code: "FIFTY", icon: "5\uFE0F\u20E30\uFE0F\u20E3", label: "50 anni", active: true },
  { code: "RETIREMENT", icon: "\u{1F3D6}\u{FE0F}", label: "Pensione", active: true },
  { code: "CONFIRMATION", icon: "\u{1F4FF}", label: "Cresima", active: true },
  { code: "GRADUATION", icon: "\u{1F393}", label: "Laurea", active: true },
  { code: "BABY_SHOWER", icon: "\u{1F9F8}", label: "Baby Shower", active: true },
  { code: "ENGAGEMENT", icon: "\u{1F48D}", label: "Festa di fidanzamento", active: true },
  { code: "PROPOSAL", icon: "\u{1F490}", label: "Festa proposta (Proposal)", active: true },
  { code: "COMMUNION", icon: "\u{271D}\u{FE0F}", label: "Comunione", active: true },
  { code: "BAR_MITZVAH", icon: "\u{2721}\u{FE0F}", label: "Bar Mitzvah", active: true },
  { code: "QUINCEANERA", icon: "\u{1F451}", label: "Quincea\u00F1era", active: true },
  { code: "CORP_EVENT", icon: "\u{1F3E2}", label: "Evento aziendale", active: true },
  { code: "CHARITY_GALA", icon: "\u{1F397}\u{FE0F}", label: "Evento culturale/Charity/Gala", active: true },
];

/**
 * Get event type by code
 */
export function getEventType(code: string): EventType | undefined {
  return EVENT_TYPES.find((e) => e.code === code);
}

/**
 * Get event label by code (with fallback)
 */
export function getEventLabel(code: string): string {
  const event = getEventType(code);
  return event?.label || code;
}

/**
 * Get active event types only
 */
export function getActiveEventTypes(): EventType[] {
  return EVENT_TYPES.filter((e) => e.active !== false);
}
