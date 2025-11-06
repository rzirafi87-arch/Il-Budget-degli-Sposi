/**
 * Container responsivo ottimizzato per PC, Tablet, Android e iOS
 * Gestisce automaticamente padding, margini e layout in base al dispositivo
 */

"use client";

import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import clsx from "clsx";
import { type ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  /** Rimuovi padding laterali su mobile */
  noPadding?: boolean;
  /** Usa full width su mobile */
  fullWidthMobile?: boolean;
  /** Aggiungi safe area per iOS notch */
  safeBoundaries?: boolean;
  /** Centratura contenuto */
  centered?: boolean;
  /** Max width personalizzato */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export default function ResponsiveContainer({
  children,
  className,
  noPadding = false,
  fullWidthMobile = false,
  safeBoundaries = true,
  centered = false,
  maxWidth = "xl",
}: ResponsiveContainerProps) {
  const { deviceType, os, isPortrait } = useDeviceDetection();

  const maxWidthClass = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  const containerClasses = clsx(
    // Base
    "w-full",
    maxWidthClass,
    centered && "mx-auto",
    
    // Padding responsivo
    !noPadding && {
      // Mobile: padding ridotto ma touch-friendly
      "px-4 py-3": deviceType === "mobile",
      // Tablet: padding medio
      "px-6 py-4": deviceType === "tablet",
      // Desktop: padding generoso
      "px-8 py-6": deviceType === "desktop",
    },
    
    // Safe area per iOS (notch e home indicator)
    safeBoundaries && os === "ios" && [
      "pt-safe-top",
      "pb-safe-bottom",
      "pl-safe-left",
      "pr-safe-right",
    ],
    
    // Full width su mobile se richiesto
    fullWidthMobile && deviceType === "mobile" && "!px-0",
    
    // Ottimizzazioni orientamento
    isPortrait && deviceType === "mobile" && "pb-6",
    
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

/**
 * Grid responsivo ottimizzato per diversi dispositivi
 */
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  /** Colonne su mobile (default: 1) */
  mobileCols?: 1 | 2;
  /** Colonne su tablet (default: 2) */
  tabletCols?: 2 | 3 | 4;
  /** Colonne su desktop (default: 3) */
  desktopCols?: 2 | 3 | 4 | 5 | 6;
  /** Gap tra elementi */
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = "md",
}: ResponsiveGridProps) {
  const { deviceType } = useDeviceDetection();

  const gapClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const gridClasses = clsx(
    "grid",
    gapClass,
    {
      [`grid-cols-${mobileCols}`]: deviceType === "mobile",
      [`grid-cols-${tabletCols}`]: deviceType === "tablet",
      [`grid-cols-${desktopCols}`]: deviceType === "desktop",
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

/**
 * Stack responsivo (layout verticale/orizzontale in base al dispositivo)
 */
interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  /** Direzione su mobile */
  mobileDirection?: "vertical" | "horizontal";
  /** Direzione su desktop */
  desktopDirection?: "vertical" | "horizontal";
  /** Allineamento elementi */
  align?: "start" | "center" | "end" | "stretch";
  /** Spaziatura tra elementi */
  spacing?: "sm" | "md" | "lg" | "xl";
}

export function ResponsiveStack({
  children,
  className,
  mobileDirection = "vertical",
  desktopDirection = "horizontal",
  align = "stretch",
  spacing = "md",
}: ResponsiveStackProps) {
  const { deviceType } = useDeviceDetection();

  const spacingClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  }[spacing];

  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const isMobile = deviceType === "mobile";
  const isVertical = isMobile ? mobileDirection === "vertical" : desktopDirection === "vertical";

  const stackClasses = clsx(
    "flex",
    isVertical ? "flex-col" : "flex-row",
    spacingClass,
    alignClass,
    className
  );

  return <div className={stackClasses}>{children}</div>;
}
