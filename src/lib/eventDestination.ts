// Only route to a dedicated planner after the server has authorized selection.
export function eventDestination(locale: string, event: { eventType: string; eventId: string }) {
  return event.eventType === 'baptism'
    ? `/${locale}/battesimo?eventId=${encodeURIComponent(event.eventId)}`
    : `/${locale}/dashboard`;
}
