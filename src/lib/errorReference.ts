/** Local support reference only: never include exception messages or request data. */
export function errorReference(): string {
  return crypto.randomUUID();
}
