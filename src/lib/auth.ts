export const AUTH_RESEND_COOLDOWN_SECONDS = 60;

export const INVITATION_RETURN_COOKIE = "app-invitation-return";

export function isInvitationToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value);
}

export function invitationResumePath(locale: string) {
  return `/api/invitations/resume?locale=${encodeURIComponent(locale)}`;
}

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
