/**
 * Esempio di integrazione del sistema responsive nella dashboard
 * Mostra come migrare componenti esistenti al nuovo sistema
 */

"use client";

import ResponsiveCard, { CardSection } from "@/components/ResponsiveCard";
import ResponsiveContainer, { ResponsiveGrid, ResponsiveStack } from "@/components/ResponsiveContainer";

// Esempio: Budget Summary con layout responsive
export function BudgetSummaryResponsive() {
  return (
    <ResponsiveContainer maxWidth="xl" centered>
      <h2 className="text-2xl font-serif font-bold mb-4">Riepilogo Budget</h2>
      
      {/* Grid adattiva: 1 col mobile, 2 tablet, 3 desktop */}
      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="md">
        <CardSection
          title="Sposa"
          icon="👰"
          variant="rose"
          footer={
            <div className="text-sm text-gray-600">
              65% del budget utilizzato
            </div>
          }
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 8.500</p>
          <p className="text-sm text-gray-600 mt-1">di € 13.000</p>
        </CardSection>

        <CardSection
          title="Sposo"
          icon="🤵"
          variant="beige"
          footer={
            <div className="text-sm text-gray-600">
              58% del budget utilizzato
            </div>
          }
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 7.200</p>
          <p className="text-sm text-gray-600 mt-1">di € 12.500</p>
        </CardSection>

        <CardSection
          title="Comune"
          icon="💑"
          variant="sage"
          footer={
            <div className="text-sm text-gray-600">
              72% del budget utilizzato
            </div>
          }
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 15.300</p>
          <p className="text-sm text-gray-600 mt-1">di € 21.200</p>
        </CardSection>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}

// Esempio: Quick Actions con stack responsive
export function QuickActionsResponsive() {
  return (
    <ResponsiveContainer maxWidth="xl" centered className="mt-6">
      <h2 className="text-2xl font-serif font-bold mb-4">Azioni Rapide</h2>
      
      {/* Stack: verticale su mobile, orizzontale su desktop */}
      <ResponsiveStack
        mobileDirection="vertical"
        desktopDirection="horizontal"
        spacing="md"
      >
        <ResponsiveCard
          hoverable
          onClick={() => alert("Aggiungi spesa")}
          variant="sage"
          className="flex-1"
        >
          <div className="text-center py-4">
            <span className="text-4xl mb-2 block">💰</span>
            <h3 className="font-semibold">Aggiungi Spesa</h3>
          </div>
        </ResponsiveCard>

        <ResponsiveCard
          hoverable
          onClick={() => alert("Aggiungi invitato")}
          variant="rose"
          className="flex-1"
        >
          <div className="text-center py-4">
            <span className="text-4xl mb-2 block">👥</span>
            <h3 className="font-semibold">Aggiungi Invitato</h3>
          </div>
        </ResponsiveCard>

        <ResponsiveCard
          hoverable
          onClick={() => alert("Cerca fornitore")}
          variant="beige"
          className="flex-1"
        >
          <div className="text-center py-4">
            <span className="text-4xl mb-2 block">🏢</span>
            <h3 className="font-semibold">Cerca Fornitore</h3>
          </div>
        </ResponsiveCard>
      </ResponsiveStack>
    </ResponsiveContainer>
  );
}

// Esempio: Lista fornitori con card touch-friendly
export function VendorListResponsive() {
  const vendors = [
    { id: 1, name: "Villa Rossi", location: "Roma, RM", price: "€ 3.500", rating: 4.8, verified: true },
    { id: 2, name: "Catering Delizie", location: "Milano, MI", price: "€ 5.200", rating: 4.9, verified: true },
    { id: 3, name: "Fotografo Marco B.", location: "Firenze, FI", price: "€ 1.800", rating: 5.0, verified: false },
  ];

  return (
    <ResponsiveContainer maxWidth="xl" centered className="mt-6">
      <h2 className="text-2xl font-serif font-bold mb-4">Fornitori Consigliati</h2>
      
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <ResponsiveCard
            key={vendor.id}
            hoverable
            onClick={() => alert(`Selezionato: ${vendor.name}`)}
            elevation="md"
            padding="md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  {vendor.verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      ✓ Verificato
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">📍 {vendor.location}</p>
                <p className="text-sm text-gray-700 mt-1">⭐ {vendor.rating}/5.0</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-[#8da182]">{vendor.price}</p>
                <button className="mt-2 px-4 py-2 bg-[#8da182] text-white rounded-full text-sm font-semibold hover:bg-[#7a8d74] transition-colors">
                  Dettagli
                </button>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </div>
    </ResponsiveContainer>
  );
}

// Esempio: Form di ricerca responsive
export function SearchFormResponsive() {
  return (
    <ResponsiveContainer maxWidth="xl" centered className="mt-6">
      <ResponsiveCard padding="lg">
        <h2 className="text-xl font-serif font-bold mb-4">Cerca Fornitori</h2>
        
        <div className="space-y-4">
          {/* Campo ricerca */}
          <input
            type="text"
            placeholder="Nome fornitore..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6B5A0] focus:border-transparent"
            style={{ minHeight: "48px" }} // Touch-friendly
          />

          {/* Filtri in grid responsive */}
          <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="sm">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" style={{ minHeight: "48px" }}>
              <option>Tipo fornitore</option>
              <option>Location</option>
              <option>Catering</option>
              <option>Fotografo</option>
            </select>

            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" style={{ minHeight: "48px" }}>
              <option>Regione</option>
              <option>Lazio</option>
              <option>Lombardia</option>
              <option>Toscana</option>
            </select>

            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" style={{ minHeight: "48px" }}>
              <option>Budget</option>
              <option>€ 0 - 1.000</option>
              <option>€ 1.000 - 5.000</option>
              <option>€ 5.000+</option>
            </select>
          </ResponsiveGrid>

          {/* Pulsanti in stack responsive */}
          <ResponsiveStack
            mobileDirection="vertical"
            desktopDirection="horizontal"
            spacing="md"
          >
            <button className="btn-primary flex-1">
              🔍 Cerca
            </button>
            <button className="btn-secondary flex-1">
              ↻ Reset
            </button>
          </ResponsiveStack>
        </div>
      </ResponsiveCard>
    </ResponsiveContainer>
  );
}
