/**
 * Pagina di esempio che dimostra tutti i componenti responsive
 * Ottimizzata per PC, Tablet, Android e iOS
 */

"use client";

import ResponsiveCard, { CardSection } from "@/components/ResponsiveCard";
import ResponsiveContainer, { ResponsiveGrid, ResponsiveStack } from "@/components/ResponsiveContainer";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useTranslations } from "next-intl";

export default function ResponsiveShowcasePage() {
  const deviceInfo = useDeviceDetection();
  const t = useTranslations("milestone9.runtime");

  const navItems = [
    { href: "/dashboard", label: t("responsiveShowcase.nav.dashboard"), icon: "🏠" },
    { href: "/budget", label: t("responsiveShowcase.nav.budget"), icon: "💰" },
    { href: "/invitati", label: t("responsiveShowcase.nav.guests"), icon: "👥", badge: 3 },
    { href: "/fornitori", label: t("responsiveShowcase.nav.suppliers"), icon: "🏢" },
  ];

  return (
    <ResponsiveLayout
      showBottomNav={true}
      navItems={navItems}
      header={
        <div className="p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-serif font-bold text-gray-800">
            {t("responsiveShowcase.title")}
          </h1>
        </div>
      }
    >
      <ResponsiveContainer maxWidth="2xl" centered>
        {/* Info dispositivo corrente */}
        <ResponsiveCard variant="sage" padding="lg" className="mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            {t("responsiveShowcase.deviceInfo.title")}
          </h2>
          <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3}>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.type")}</p>
              <p className="text-lg font-semibold capitalize">{deviceInfo.deviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.os")}</p>
              <p className="text-lg font-semibold uppercase">{deviceInfo.os}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.viewport")}</p>
              <p className="text-lg font-semibold">
                {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.size")}</p>
              <p className="text-lg font-semibold uppercase">{deviceInfo.viewportSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.touch")}</p>
              <p className="text-lg font-semibold">
                {deviceInfo.isTouchDevice ? t("responsiveShowcase.deviceInfo.yes") : t("responsiveShowcase.deviceInfo.no")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("responsiveShowcase.deviceInfo.orientation")}</p>
              <p className="text-lg font-semibold">
                {deviceInfo.isPortrait ? t("responsiveShowcase.deviceInfo.portrait") : t("responsiveShowcase.deviceInfo.landscape")}
              </p>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Grid responsiva di cards */}
        <h2 className="text-2xl font-serif font-bold mb-4">{t("responsiveShowcase.grid.title")}</h2>
        <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="md">
          <CardSection
            title={t("responsiveShowcase.grid.budget.title")}
            subtitle={t("responsiveShowcase.grid.budget.subtitle")}
            icon="💰"
            hoverable
            onClick={() => alert(t("responsiveShowcase.grid.budget.clicked"))}
            footer={
              <span className="btn-primary block w-full text-center">
                {t("responsiveShowcase.grid.budget.open")}
              </span>
            }
          >
            <p className="text-gray-700">
              {t("responsiveShowcase.grid.budget.description")}
            </p>
          </CardSection>

          <CardSection
            title={t("responsiveShowcase.grid.guests.title")}
            subtitle={t("responsiveShowcase.grid.guests.subtitle")}
            icon="👥"
            hoverable
            href="/invitati"
            footer={
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t("responsiveShowcase.grid.guests.count")}</span>
                <span className="text-sm font-semibold text-green-600">98% RSVP</span>
              </div>
            }
          >
            <p className="text-gray-700">
              {t("responsiveShowcase.grid.guests.description")}
            </p>
          </CardSection>

          <CardSection
            title={t("responsiveShowcase.grid.timeline.title")}
            subtitle={t("responsiveShowcase.grid.timeline.subtitle")}
            icon="📅"
            hoverable
            onClick={() => alert(t("responsiveShowcase.grid.timeline.clicked"))}
            footer={
              <div className="text-sm text-gray-600">
                {t("responsiveShowcase.grid.timeline.progress")}
              </div>
            }
          >
            <p className="text-gray-700">
              {t("responsiveShowcase.grid.timeline.description")}
            </p>
          </CardSection>
        </ResponsiveGrid>

        {/* Stack responsivo */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">
          {t("responsiveShowcase.stack.title")}
        </h2>
        <ResponsiveStack
          mobileDirection="vertical"
          desktopDirection="horizontal"
          spacing="md"
          align="stretch"
        >
          <ResponsiveCard variant="rose" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">{t("responsiveShowcase.stack.bride")}</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 8.500</p>
            <p className="text-sm text-gray-600">{t("responsiveShowcase.stack.budgetUsed")}</p>
          </ResponsiveCard>

          <ResponsiveCard variant="beige" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">{t("responsiveShowcase.stack.groom")}</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 7.200</p>
            <p className="text-sm text-gray-600">{t("responsiveShowcase.stack.budgetUsed")}</p>
          </ResponsiveCard>

          <ResponsiveCard variant="sage" padding="md" className="flex-1">
            <h3 className="font-serif font-bold text-lg mb-2">{t("responsiveShowcase.stack.shared")}</h3>
            <p className="text-3xl font-bold text-[#8da182]">€ 15.300</p>
            <p className="text-sm text-gray-600">{t("responsiveShowcase.stack.budgetUsed")}</p>
          </ResponsiveCard>
        </ResponsiveStack>

        {/* Pulsanti responsive */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">{t("responsiveShowcase.buttons.title")}</h2>
        <ResponsiveStack mobileDirection="vertical" desktopDirection="horizontal" spacing="md">
          <button className="btn-primary flex-1">
            {t("responsiveShowcase.buttons.save")}
          </button>
          <button className="btn-secondary flex-1">
            {t("responsiveShowcase.buttons.cancel")}
          </button>
        </ResponsiveStack>

        {/* Card interattive */}
        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">{t("responsiveShowcase.cards.title")}</h2>
        <div className="space-y-4">
          {[
            { title: "Location Villa Rossi", location: "Roma", price: "€ 3.500", rating: "⭐ 4.8" },
            { title: "Catering Delizie", location: "Milano", price: "€ 5.200", rating: "⭐ 4.9" },
            { title: "Fotografo Marco B.", location: "Firenze", price: "€ 1.800", rating: "⭐ 5.0" },
          ].map((item, i) => (
            <ResponsiveCard
              key={i}
              hoverable
              onClick={() => alert(t("responsiveShowcase.cards.selected", { name: item.title }))}
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
            {t("responsiveShowcase.optimizations.title")}
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {deviceInfo.os === "ios" && (
              <>
                <li>{t("responsiveShowcase.optimizations.ios.safeAreas")}</li>
                <li>{t("responsiveShowcase.optimizations.ios.tapHighlight")}</li>
                <li>{t("responsiveShowcase.optimizations.ios.smoothScrolling")}</li>
              </>
            )}
            {deviceInfo.os === "android" && (
              <>
                <li>{t("responsiveShowcase.optimizations.android.ripple")}</li>
                <li>{t("responsiveShowcase.optimizations.android.shadows")}</li>
                <li>{t("responsiveShowcase.optimizations.android.fontRendering")}</li>
              </>
            )}
            {deviceInfo.deviceType === "desktop" && (
              <>
                <li>{t("responsiveShowcase.optimizations.desktop.hover")}</li>
                <li>{t("responsiveShowcase.optimizations.desktop.keyboard")}</li>
                <li>{t("responsiveShowcase.optimizations.desktop.multiColumn")}</li>
              </>
            )}
            {deviceInfo.isTouchDevice && (
              <li>{t("responsiveShowcase.optimizations.touchTargets")}</li>
            )}
            <li>{t("responsiveShowcase.optimizations.layouts")}</li>
            <li>{t("responsiveShowcase.optimizations.adaptiveFont", { device: deviceInfo.deviceType })}</li>
          </ul>
        </div>
      </ResponsiveContainer>
    </ResponsiveLayout>
  );
}
