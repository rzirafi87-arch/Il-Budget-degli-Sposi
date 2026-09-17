import {
  BRAND_NAME,
  BRAND_SITE_URL,
} from "@/config/brand";
import { sendTransactionalEmail } from "@/lib/email/sendTransactionalEmail";

export async function sendMail(to: string, subject: string, html: string) {
  return sendTransactionalEmail({ to, subject, html });
}

export type EmailLocale = "it" | "en" | "es" | "fr" | "de";

const emailCopy = {
  it: { confirmSubject: "Conferma il tuo account – Il Budget degli Sposi", confirmTitle: "Conferma il tuo account", confirmBody: "Per completare la registrazione, conferma il tuo indirizzo email.", confirmCta: "Conferma email", resetSubject: "Reimposta la password – Il Budget degli Sposi", resetTitle: "Reimposta la password", resetCta: "Scegli una nuova password", ignore: "Se non hai richiesto questa email, ignorala." },
  en: { confirmSubject: "Confirm your account – Il Budget degli Sposi", confirmTitle: "Confirm your account", confirmBody: "Confirm your email address to complete registration.", confirmCta: "Confirm email", resetSubject: "Reset your password – Il Budget degli Sposi", resetTitle: "Reset your password", resetCta: "Choose a new password", ignore: "If you did not request this email, ignore it." },
  es: { confirmSubject: "Confirma tu cuenta – Il Budget degli Sposi", confirmTitle: "Confirma tu cuenta", confirmBody: "Confirma tu dirección de email para completar el registro.", confirmCta: "Confirmar email", resetSubject: "Restablece tu contraseña – Il Budget degli Sposi", resetTitle: "Restablece tu contraseña", resetCta: "Elegir una nueva contraseña", ignore: "Si no solicitaste este email, ignóralo." },
  fr: { confirmSubject: "Confirmez votre compte – Il Budget degli Sposi", confirmTitle: "Confirmez votre compte", confirmBody: "Confirmez votre adresse e-mail pour terminer l’inscription.", confirmCta: "Confirmer l’e-mail", resetSubject: "Réinitialisez votre mot de passe – Il Budget degli Sposi", resetTitle: "Réinitialisez votre mot de passe", resetCta: "Choisir un nouveau mot de passe", ignore: "Si vous n’avez pas demandé cet e-mail, ignorez-le." },
  de: { confirmSubject: "Bestätige dein Konto – Il Budget degli Sposi", confirmTitle: "Bestätige dein Konto", confirmBody: "Bestätige deine E-Mail-Adresse, um die Registrierung abzuschließen.", confirmCta: "E-Mail bestätigen", resetSubject: "Passwort zurücksetzen – Il Budget degli Sposi", resetTitle: "Passwort zurücksetzen", resetCta: "Neues Passwort wählen", ignore: "Wenn du diese E-Mail nicht angefordert hast, ignoriere sie." },
} as const;

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]!));

export function emailLocaleFromRequest(request: Request): EmailLocale {
  const header = request.headers.get("accept-language")?.slice(0, 2).toLowerCase();
  return header && header in emailCopy ? header as EmailLocale : "it";
}

export function confirmationSubject(locale: EmailLocale = "it") {
  return emailCopy[locale].confirmSubject;
}

export function recoverySubject(locale: EmailLocale = "it") {
  return emailCopy[locale].resetSubject;
}

export function siteUrl(request?: Request) {
  const configured = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");
    if (host) {
      const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      return `${protocol}://${host}`;
    }
  }
  return process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? BRAND_SITE_URL : "http://localhost:3000";
}

export function magicLinkTemplate(link: string) {
  const brand = process.env.NEXT_PUBLIC_APP_NAME || BRAND_NAME;
  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5; color:#111">
    <h2 style="margin:0 0 12px">Benvenuto/a su ${brand}</h2>
    <p>Clicca il pulsante per accedere:</p>
    <p>
      <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
        Accedi ora
      </a>
    </p>
    <p>Oppure incolla questo link nel browser:</p>
    <p style="word-break:break-all">${link}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <p style="font-size:12px;color:#666">Se non hai richiesto questo accesso, ignora questa email.</p>
  </div>`;
}

export function confirmationTemplate(link: string, locale: EmailLocale = "it") {
  const brand = process.env.NEXT_PUBLIC_APP_NAME || BRAND_NAME;
  const copy = emailCopy[locale];
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5;color:#111"><h2>${escapeHtml(copy.confirmTitle)} – ${escapeHtml(brand)}</h2><p>${escapeHtml(copy.confirmBody)}</p><p><a href="${escapeHtml(link)}" style="display:inline-block;background:#7d5960;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">${escapeHtml(copy.confirmCta)}</a></p><p style="font-size:12px;color:#666">${escapeHtml(copy.ignore)}</p></div>`;
}

export function recoveryTemplate(link: string, locale: EmailLocale = "it") {
  const brand = process.env.NEXT_PUBLIC_APP_NAME || BRAND_NAME;
  const copy = emailCopy[locale];
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5;color:#111"><h2>${escapeHtml(copy.resetTitle)} – ${escapeHtml(brand)}</h2><p><a href="${escapeHtml(link)}" style="display:inline-block;background:#7d5960;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">${escapeHtml(copy.resetCta)}</a></p><p style="font-size:12px;color:#666">${escapeHtml(copy.ignore)}</p></div>`;
}
