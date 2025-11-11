import { Resend } from "resend";

import {
  BRAND_FROM_EMAIL,
  BRAND_NAME,
  BRAND_SITE_URL,
} from "@/config/brand";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || BRAND_FROM_EMAIL;

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("Resend non configurato: salto invio email a", to);
    return { id: "skipped-local" };
  }
  const { data, error } = await resend.emails.send({
    from: RESEND_FROM!,
    to,
    subject,
    html,
  });
  if (error) throw error;
  return data;
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? BRAND_SITE_URL
      : "http://localhost:3000")
  );
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

