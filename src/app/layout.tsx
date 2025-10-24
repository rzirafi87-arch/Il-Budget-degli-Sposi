import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import NavTabs from "@/components/NavTabs";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import DynamicHeader from "@/components/DynamicHeader";
import { ToastProvider } from "@/components/ToastProvider";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd, LocalBusinessSchema } from "@/components/StructuredData";

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

export const metadata: Metadata = {
  title: {
    default: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    template: "%s | Il Budget degli Sposi",
  },
  description: "Organizza il tuo matrimonio con Il Budget degli Sposi: gestisci il budget, trova fornitori, location e chiese in tutta Italia. Strumenti gratuiti per pianificare le nozze perfette.",
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
    url: "https://il-budget-degli-sposi.vercel.app",
    siteName: "Il Budget degli Sposi",
    title: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    description: "Strumenti gratuiti per organizzare il tuo matrimonio: gestione budget, fornitori, location e molto altro.",
    images: [
      {
        url: "https://il-budget-degli-sposi.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Il Budget degli Sposi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Il Budget degli Sposi - Organizza il Tuo Matrimonio",
    description: "Strumenti gratuiti per organizzare il tuo matrimonio: gestione budget, fornitori, location e molto altro.",
    images: ["https://il-budget-degli-sposi.vercel.app/og-image.jpg"],
  },
  verification: {
    google: "google-site-verification-code-here", // Da aggiungere dopo registrazione su Google Search Console
  },
  metadataBase: new URL("https://il-budget-degli-sposi.vercel.app"),
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
      </head>
      <body className="min-h-screen antialiased" style={{ background: "var(--color-cream)", color: "var(--foreground)" }}>
        <ToastProvider>
          {/* Header sticky su mobile per facile accesso alla navigazione */}
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-soft">
            {/* Countdown dinamico - solo se utente loggato */}
            <DynamicHeader />
            
            <div className="border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h1 className="text-lg sm:text-2xl font-serif font-bold" style={{ color: "var(--color-warm-gray)" }}>
                    💍 Il Budget degli Sposi
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <a 
                      className="bg-green-600 text-white px-3 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm" 
                      href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 Chat
                    </a>
                    <a 
                      className="text-white px-3 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-sm" 
                      style={{ background: "var(--color-sage)" }}
                      href="/auth"
                    >
                      Accedi
                    </a>
                  </div>
                </div>
                <NavTabs />
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-16 min-h-screen">
            <Breadcrumbs />
            {children}
          </main>
          
          <Footer />
          <Background />
        </ToastProvider>
      </body>
    </html>
  );
}
