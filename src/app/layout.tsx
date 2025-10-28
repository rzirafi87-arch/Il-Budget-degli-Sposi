import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { JsonLd, LocalBusinessSchema } from "@/components/StructuredData";
import { GoogleAnalytics } from "@/components/GoogleTracking";
import ClientLayoutShell from "@/components/ClientLayoutShell";

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

export const metadata: Metadata = {
  title: {
    default: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    template: "%s | Il Budget degli Sposi",
  },
  description:
    "Organizza il tuo matrimonio con Il Budget degli Sposi: gestisci il budget, trova fornitori, location e chiese in tutta Italia. Strumenti gratuiti per pianificare le nozze perfette.",
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
  authors: [{ name: "Il Budget degli Sposi" }],
  creator: "Il Budget degli Sposi",
  publisher: "Il Budget degli Sposi",
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
    locale: "it_IT",
    url: SITE_URL,
    siteName: "Il Budget degli Sposi",
    title: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    description:
      "Strumenti gratuiti per organizzare il tuo matrimonio: gestione budget, fornitori, location e molto altro.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Il Budget degli Sposi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    description:
      "Strumenti gratuiti per organizzare il tuo matrimonio: gestione budget, fornitori, location e molto altro.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  verification: {
    google: "google-site-verification-code-here",
  },
  metadataBase: new URL(SITE_URL),
};

// Ensure correct mobile scaling and full-viewport rendering on iOS/Android
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#A6B5A0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${playfair.variable} ${inter.variable}`}> 
      <head>
        <JsonLd />
        <LocalBusinessSchema />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#A3B59D" />
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
