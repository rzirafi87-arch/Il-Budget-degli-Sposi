/** Server correlation ID: log it with the failure before returning it to clients. */
export function errorReference(): string {
  return crypto.randomUUID();
}
