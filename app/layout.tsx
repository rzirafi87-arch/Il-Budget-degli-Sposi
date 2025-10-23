import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavTabs from "@/components/NavTabs";
import Background from "@/components/Background";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Il Mio Budget Matrimonio",
};

// Ensure correct mobile scaling and full-viewport rendering on iOS/Android
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#A3B59D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen text-gray-900 antialiased bg-gray-100">
        {/* Header sticky su mobile per facile accesso alla navigazione */}
        <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-300 shadow-md">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-gray-800">💍 Il Budget degli Sposi</h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <a 
                  className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-1 shadow-md" 
                  href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Chat
                </a>
                <a className="bg-[#8a9d84] text-white px-3 py-2 rounded-lg font-bold hover:bg-[#7a8d74] transition-colors shadow-md" href="/auth">
                  Accedi
                </a>
              </div>
            </div>
            <NavTabs />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-16 min-h-screen">
          {children}
        </main>
        
        <Footer />
        <Background />
      </body>
    </html>
  );
}
