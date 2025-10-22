import type { Metadata } from "next";
import "./globals.css";
import NavTabs from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "Il Mio Budget Matrimonio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-[conic-gradient(at_20%_10%,#f7f4ec,white)] text-[#2b2b2b]">
        <header className="max-w-6xl mx-auto px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif">Il Mio Budget Matrimonio</h1>
            <div className="flex items-center gap-4 text-sm">
              <a 
                className="text-blue-600 hover:underline" 
                href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
                target="_blank"
                rel="noopener noreferrer"
              >
                Parla con noi
              </a>
              <a className="text-blue-600 hover:underline" href="/auth">
                Registrati
              </a>
            </div>
          </div>
          <div className="border-b mt-3" />
          <div className="mt-4">
            <NavTabs />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
