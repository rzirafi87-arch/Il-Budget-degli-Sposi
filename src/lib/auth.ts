export const AUTH_RESEND_COOLDOWN_SECONDS = 60;

export function safeInternalPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function authErrorMessage(message?: string) {
  const value = (message || "").toLowerCase();
  if (value.includes("email not confirmed")) return "Devi prima confermare il tuo indirizzo email.";
  if (value.includes("invalid login credentials")) return "Email o password non corretti.";
  if (value.includes("password") && (value.includes("short") || value.includes("characters"))) return "La password deve contenere almeno 10 caratteri.";
  if (value.includes("expired") || value.includes("invalid token")) return "Il link non è valido o è scaduto. Richiedine uno nuovo.";
  if (value.includes("rate") || value.includes("too many")) return "Hai effettuato troppi tentativi. Attendi e riprova.";
  return "Non è stato possibile completare l’operazione. Riprova.";
}
