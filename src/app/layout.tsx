import ClientLayoutShell from "@/components/ClientLayoutShell";
import { GoogleAnalytics } from "@/components/GoogleTracking";
import { JsonLd, LocalBusinessSchema, OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Base URL del sito (configurabile via env per ogni ambiente)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://il-budget-degli-sposi-kbg1.vercel.app"
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  // Determine locale from cookie; fallback to 'it'
  let lang = "it";
  try {
    type CookieStore = { get?: (key: string) => { value?: string } | undefined };
    const cookieStore = (cookies as unknown as () => CookieStore)();
    const v = cookieStore?.get?.("language")?.value;
    if (v) lang = v.toLowerCase();
  } catch {}

  const i18n = {
    it: {
      title: "MYBUDGETEVENTO - Organizza il Tuo Evento",
      description:
        "Organizza il tuo evento con MYBUDGETEVENTO: gestisci il budget, trova fornitori, location e chiese in tutta Italia. Strumenti gratuiti per pianificare ogni occasione.",
      keywords: [
        "budget matrimonio",
        "organizzare matrimonio",
        "wedding planner",
        "location matrimonio",
        "fornitori matrimonio",
        "chiese matrimonio",
        "gestione budget nozze",
        "pianificazione matrimonio",
        "matrimonio italia",
        "calcolo budget matrimonio",
      ],
      ogDescription:
        "Strumenti gratuiti per organizzare il tuo matrimonio: gestione budget, fornitori, location e molto altro.",
    },
    en: {
      title: "MYBUDGETEVENTO - Plan Your Event",
      description:
        "Plan your event with MYBUDGETEVENTO: manage budget, find suppliers, venues and churches. Free tools to plan every occasion.",
      keywords: [
        "wedding budget",
        "plan wedding",
        "wedding planner",
        "wedding venues",
        "wedding suppliers",
        "church wedding",
        "wedding budget management",
        "wedding planning",
        "italy wedding",
        "wedding budget calculator",
      ],
      ogDescription:
        "Free tools to organize your wedding: budget management, suppliers, venues and more.",
    },
  } as const;

  const L = (lang === "en" ? i18n.en : i18n.it);

  return {
    applicationName: "MYBUDGETEVENTO",
    title: {
      default: L.title,
      template: "%s | MYBUDGETEVENTO",
    },
    description: L.description,
  keywords: [...L.keywords],
    authors: [{ name: "MYBUDGETEVENTO" }],
    creator: "MYBUDGETEVENTO",
    publisher: "MYBUDGETEVENTO",
    category: "Lifestyle",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: "MYBUDGETEVENTO",
      title: L.title,
      description: L.ogDescription,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "MYBUDGETEVENTO",
        },
      ],
      locale: lang === "en" ? "en_US" : "it_IT",
    },
    twitter: {
      card: "summary_large_image",
      title: L.title,
      description: L.ogDescription,
      images: [`${SITE_URL}/twitter-image`],
    },
    verification: {
      google: "google-site-verification-code-here",
    },
    alternates: {
      canonical: "/",
    },
    metadataBase: new URL(SITE_URL),
  } satisfies Metadata;
}

// Ensure correct mobile scaling and full-viewport rendering on iOS/Android
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#A6B5A0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Prova a leggere la lingua preferita da cookie (fallback: it). Tollera runtime/typing diversi.
  let htmlLang = "it";
  try {
    type CookieStore = { get?: (key: string) => { value?: string } | undefined };
    const cookieStore = (cookies as unknown as () => CookieStore)();
    htmlLang = cookieStore?.get?.("language")?.value || "it";
  } catch {
    // Ignore error and use default
  }
  // Preconnect origin for Supabase if configured
  let supabaseOrigin: string | null = null;
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
    supabaseOrigin = u ? `${u.protocol}//${u.host}` : null;
  } catch {
    supabaseOrigin = null;
  }
  return (
    <html lang={htmlLang} className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <JsonLd />
        <LocalBusinessSchema />
        <WebsiteSchema />
        <OrganizationSchema />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#A3B59D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preconnects */}
        {supabaseOrigin ? (
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
        ) : null}
        {/* PWA icons for iOS/Android */}
        <link rel="icon" type="image/png" sizes="192x192" href="/backgrounds/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/backgrounds/icon-512.png" />
        <link rel="apple-touch-icon" href="/backgrounds/icon-192.png" />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}
        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/service-worker.js');
            });
          }`
        }} />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "var(--color-cream)", color: "var(--foreground)" }}>
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}
