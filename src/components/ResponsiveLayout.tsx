/**
 * Layout responsivo principale con adattamenti per PC, Tablet, Android e iOS
 * Gestisce navigation, header, safe areas e orientamento
 */

"use client";

import BottomNav, { BottomNavSpacer } from "@/components/BottomNav";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import clsx from "clsx";
import React, { type ReactNode } from "react";

interface ResponsiveLayoutProps {
  children: ReactNode;
  /** Mostra bottom navigation su mobile */
  showBottomNav?: boolean;
  /** Items per bottom navigation */
  navItems?: Array<{
    href: string;
    label: string;
    icon: string;
    badge?: number;
  }>;
  /** Header personalizzato */
  header?: ReactNode;
  /** Nascondi header su scroll (mobile) */
  hideHeaderOnScroll?: boolean;
}

export default function ResponsiveLayout({
  children,
  showBottomNav = true,
  navItems = [],
  header,
  hideHeaderOnScroll = false,
}: ResponsiveLayoutProps) {
  const { deviceType, os, isPortrait } = useDeviceDetection();
  const [headerVisible, setHeaderVisible] = React.useState(true);

  // Gestione scroll per nascondere header su mobile
  React.useEffect(() => {
    if (!hideHeaderOnScroll || deviceType !== "mobile") return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        // Sempre visibile in cima
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll giù - nascondi
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scroll su - mostra
        setHeaderVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideHeaderOnScroll, deviceType]);

  const containerClasses = clsx(
    "min-h-screen flex flex-col",
    // Safe areas per iOS
    os === "ios" && [
      "pt-safe-top",
      showBottomNav && "pb-safe-bottom",
    ],
    // Padding responsive
    {
      "px-4": deviceType === "mobile",
      "px-6": deviceType === "tablet",
      "px-8": deviceType === "desktop",
    }
  );

  const mainClasses = clsx(
    "flex-1",
    {
      // Mobile portrait: più padding verticale
      "py-4": deviceType === "mobile" && isPortrait,
      // Mobile landscape: padding ridotto
      "py-2": deviceType === "mobile" && !isPortrait,
      // Tablet: padding medio
      "py-6": deviceType === "tablet",
      // Desktop: padding generoso
      "py-8": deviceType === "desktop",
    }
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      {header && (
        <header
          className={clsx(
            "transition-transform duration-300",
            hideHeaderOnScroll && !headerVisible && deviceType === "mobile" && "-translate-y-full",
            os === "ios" && "backdrop-blur-sm bg-white/95",
            os === "android" && "bg-white shadow-sm"
          )}
        >
          {header}
        </header>
      )}

      {/* Main Content */}
      <main className={mainClasses}>
        {children}
      </main>

      {/* Bottom Navigation (solo mobile/tablet) */}
      {showBottomNav && navItems.length > 0 && (
        <>
          <BottomNav items={navItems} />
          <BottomNavSpacer />
        </>
      )}
    </div>
  );
}

/**
 * Componente per sezioni a schermo intero (hero, landing, ecc.)
 */
interface FullScreenSectionProps {
  children: ReactNode;
  className?: string;
  /** Background gradient o colore */
  background?: "cream" | "sage" | "rose" | "gradient" | "custom";
  /** Centratura verticale */
  centerVertical?: boolean;
}

export function FullScreenSection({
  children,
  className,
  background = "cream",
  centerVertical = true,
}: FullScreenSectionProps) {
  const { deviceType, os } = useDeviceDetection();

  const bgClass = {
    cream: "bg-[#FAF8F5]",
    sage: "bg-gradient-to-br from-[#f5f9f5] to-white",
    rose: "bg-gradient-to-br from-[#fff5f7] to-white",
    gradient: "bg-gradient-to-br from-[#FDFBF7] via-[#FAF8F5] to-[#F5F1EB]",
    custom: "",
  }[background];

  const sectionClasses = clsx(
    "min-h-screen w-full",
    bgClass,
    centerVertical && "flex items-center justify-center",
    // Padding responsive
    {
      "px-4 py-8": deviceType === "mobile",
      "px-6 py-12": deviceType === "tablet",
      "px-8 py-16": deviceType === "desktop",
    },
    // Safe area per iOS
    os === "ios" && ["pt-safe-top", "pb-safe-bottom"],
    className
  );

  return <section className={sectionClasses}>{children}</section>;
}
