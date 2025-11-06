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
  { code: "WEDDING", icon: "💍", label: "Matrimonio", active: true },
  { code: "BAPTISM", icon: "🕊️", label: "Battesimo", active: true },
  { code: "EIGHTEENTH", icon: "🎉", label: "Diciottesimo", active: true },
  { code: "ANNIVERSARY", icon: "💞", label: "Anniversario di matrimonio", active: true },
  { code: "GENDER_REVEAL", icon: "🍼", label: "Gender Reveal", active: true },
  { code: "BIRTHDAY", icon: "🎂", label: "Compleanno", active: true },
  { code: "FIFTY", icon: "5️⃣0️⃣", label: "50 anni", active: true },
  { code: "RETIREMENT", icon: "🏖️", label: "Pensione", active: true },
  { code: "CONFIRMATION", icon: "📿", label: "Cresima", active: true },
  { code: "GRADUATION", icon: "🎓", label: "Laurea", active: true },
  { code: "BABY_SHOWER", icon: "🧸", label: "Baby Shower", active: true },
  { code: "ENGAGEMENT", icon: "💍", label: "Festa di fidanzamento", active: true },
  { code: "PROPOSAL", icon: "💐", label: "Festa proposta (Proposal)", active: true },
  { code: "COMMUNION", icon: "✝️", label: "Comunione", active: true },
  { code: "BAR_MITZVAH", icon: "✡️", label: "Bar Mitzvah", active: true },
  { code: "QUINCEANERA", icon: "👑", label: "Quinceañera", active: true },
  { code: "CORP_EVENT", icon: "🏢", label: "Evento aziendale", active: true },
  { code: "CHARITY_GALA", icon: "🎗️", label: "Evento culturale/Charity/Gala", active: true },
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
