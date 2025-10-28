"use client";
import { usePathname } from "next/navigation";
import NavTabs from "@/components/NavTabs";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import DynamicHeader from "@/components/DynamicHeader";
import { ToastProvider } from "@/components/ToastProvider";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== "/select-country";
  return (
    <ToastProvider>
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-soft">
          <DynamicHeader />
          <div className="border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h1 className="text-lg sm:text-2xl font-serif font-bold" style={{ color: "var(--color-warm-gray)" }}>
                  {(() => {
                    if (typeof window !== "undefined") {
                      const lang = localStorage.getItem("lang") || "it";
                      if (lang === "es") return "El Presupuesto de los Novios";
                      if (lang === "en") return "Wedding Budget";
                    }
                    return "Il Budget degli Sposi";
                  })()}
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
      )}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-16 min-h-screen">
        {showHeader && <Breadcrumbs />}
        {children}
      </main>
      <Footer />
      <Background />
    </ToastProvider>
  );
}
