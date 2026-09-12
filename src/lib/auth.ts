export const AUTH_RESEND_COOLDOWN_SECONDS = 60;

export function safeInternalPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export type AuthErrorKey = "emailNotConfirmed" | "invalidCredentials" | "passwordTooShort" | "invalidOrExpiredLink" | "rateLimited" | "generic";

export function authErrorKey(message?: string): AuthErrorKey {
  const value = (message || "").toLowerCase();
  if (value.includes("email not confirmed")) return "emailNotConfirmed";
  if (value.includes("invalid login credentials")) return "invalidCredentials";
  if (value.includes("password") && (value.includes("short") || value.includes("characters"))) return "passwordTooShort";
  if (value.includes("expired") || value.includes("invalid token")) return "invalidOrExpiredLink";
  if (value.includes("rate") || value.includes("too many")) return "rateLimited";
  return "generic";
}
