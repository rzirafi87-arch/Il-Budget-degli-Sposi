/**
 * Pagina di esempio che dimostra tutti i componenti responsive
 * Ottimizzata per PC, Tablet, Android e iOS
 */

"use client";

import ResponsiveCard, { CardSection } from "@/components/ResponsiveCard";
import ResponsiveContainer, { ResponsiveGrid, ResponsiveStack } from "@/components/ResponsiveContainer";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

export default function ResponsiveShowcasePage() {
  const deviceInfo = useDeviceDetection();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/budget", label: "Budget", icon: "💰" },
    { href: "/invitati", label: "Invitati", icon: "👥", badge: 3 },
    { href: "/fornitori", label: "Fornitori", icon: "🏢" },
  ];

  return (
    <ResponsiveLayout
      showBottomNav={true}
      navItems={navItems}
      header={
        <div className="p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-serif font-bold text-gray-800">
            Showcase Responsive
          </h1>
        </div>
      }
    >
      <ResponsiveContainer maxWidth="2xl" centered>
        {/* Info dispositivo corrente */}
        <ResponsiveCard variant="sage" padding="lg" className="mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Informazioni Dispositivo
          </h2>
          <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3}>
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="text-lg font-semibold capitalize">{deviceInfo.deviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sistema Operativo</p>
              <p className="text-lg font-semibold uppercase">{deviceInfo.os}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Viewport</p>
              <p className="text-lg font-semibold">
                {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dimensione</p>
              <p className="text-lg font-semibold uppercase">{deviceInfo.viewportSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Touch</p>
              <p className="text-lg font-semibold">
                {deviceInfo.isTouchDevice ? "✅ Sì" : "❌ No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Orientamento</p>
              <p className="text-lg font-semibold">
                {deviceInfo.isPortrait ? "📱 Portrait" : "📱 Landscape"}
              </p>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Grid responsiva di cards */}
        <h2 className="text-2xl font-serif font-bold mb-4">Grid Responsiva</h2>
        <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="md">
          <CardSection
            title="Budget"
            subtitle="Gestione spese"
            icon="💰"
            hoverable
            onClick={() => alert("Budget clicked!")}
            footer={
              <button className="btn-primary w-full">
                Apri Budget
              </button>
            }
          >
            <p className="text-gray-700">
              Visualizza e gestisci tutte le spese del matrimonio in un unico posto.
            </p>
          </CardSection>

          <CardSection
            title="Invitati"
            subtitle="Lista ospiti"
            icon="👥"
            hoverable
            href="/invitati"
            footer={
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">150 invitati</span>
                <span className="text-sm font-semibold text-green-600">98% RSVP</span>
              </div>
            }
          >
            <p className="text-gray-700">
              Gestisci gli inviti, traccia le conferme e organizza i tavoli.
            </p>
          </CardSection>

          <CardSection
            title="Timeline"
            subtitle="Pianificazione"
            icon="📅"
            hoverable
            onClick={() => alert("Timeline clicked!")}
            footer={
              <div className="text-sm text-gray-600">
                12 task completati su 45
              </div>
            }
          >
            <p className="text-gray-700">
              Segui la timeline dei preparativi mese per mese fino al grande giorno.
            </p>
          </CardSection>
        </ResponsiveGrid>

        {/* Stack responsivo */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">
          Layout Stack (Verticale mobile, Orizzontale desktop)
        </h2>
        <ResponsiveStack
          mobileDirection="vertical"
          desktopDirection="horizontal"
          spacing="md"
          align="stretch"
        >
          <ResponsiveCard variant="rose" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">Sposa</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 8.500</p>
            <p className="text-sm text-gray-600">Budget utilizzato</p>
          </ResponsiveCard>

          <ResponsiveCard variant="beige" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">Sposo</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 7.200</p>
            <p className="text-sm text-gray-600">Budget utilizzato</p>
          </ResponsiveCard>

          <ResponsiveCard variant="sage" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">Comune</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 15.300</p>
            <p className="text-sm text-gray-600">Budget utilizzato</p>
          </ResponsiveCard>
        </ResponsiveStack>

        {/* Pulsanti responsive */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">Pulsanti Touch-Friendly</h2>
        <ResponsiveStack mobileDirection="vertical" desktopDirection="horizontal" spacing="md">
          <button className="btn-primary flex-1">
            Salva Modifiche
          </button>
          <button className="btn-secondary flex-1">
            Annulla
          </button>
        </ResponsiveStack>

        {/* Card interattive */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">Card Interattive</h2>
        <div className="space-y-4">
          {[
            { title: "Location Villa Rossi", location: "Roma", price: "€ 3.500", rating: "⭐ 4.8" },
            { title: "Catering Delizie", location: "Milano", price: "€ 5.200", rating: "⭐ 4.9" },
            { title: "Fotografo Marco B.", location: "Firenze", price: "€ 1.800", rating: "⭐ 5.0" },
          ].map((item, i) => (
            <ResponsiveCard
              key={i}
              hoverable
              onClick={() => alert(`Selezionato: ${item.title}`)}
              elevation="md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600">📍 {item.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#8da182]">{item.price}</p>
                  <p className="text-sm">{item.rating}</p>
                </div>
              </div>
            </ResponsiveCard>
          ))}
        </div>

        {/* Messaggio ottimizzazioni specifiche */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">
            ✨ Ottimizzazioni Attive
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {deviceInfo.os === "ios" && (
              <>
                <li>✓ Safe areas per notch e home indicator</li>
                <li>✓ Tap highlight disabilitato</li>
                <li>✓ Smooth scrolling iOS</li>
              </>
            )}
            {deviceInfo.os === "android" && (
              <>
                <li>✓ Ripple effect su pulsanti (Material Design)</li>
                <li>✓ Elevazioni shadow ottimizzate</li>
                <li>✓ Font rendering Android</li>
              </>
            )}
            {deviceInfo.deviceType === "desktop" && (
              <>
                <li>✓ Hover states per mouse</li>
                <li>✓ Keyboard navigation</li>
                <li>✓ Layout multi-colonna</li>
              </>
            )}
            {deviceInfo.isTouchDevice && (
              <li>✓ Touch targets minimo 44px (Apple HIG)</li>
            )}
            <li>✓ Responsive grid e stack layouts</li>
            <li>✓ Font size adattivo ({deviceInfo.deviceType})</li>
          </ul>
        </div>
      </ResponsiveContainer>
    </ResponsiveLayout>
  );
}
