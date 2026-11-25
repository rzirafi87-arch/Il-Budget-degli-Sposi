// Remember only an event identifier, scoped to this environment and account.
// The server still authorizes and loads every event. No plan or token is cached.
const key = (userId: string) => `baptism:last-event:${userId}`;
export function rememberedBaptism(userId: string): string | null {
  try { return window.localStorage.getItem(key(userId)); } catch { return null; }
}
export function rememberBaptism(userId: string, eventId: string) {
  try { window.localStorage.setItem(key(userId), eventId); } catch { /* Storage is optional. */ }
}
