/**
 * Bottom Navigation Bar per mobile (Android e iOS style)
 * Sostituisce la navigazione top su schermi piccoli
 */

"use client";

import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  /** Forza visualizzazione anche su desktop (default: solo mobile) */
  showOnDesktop?: boolean;
}

export default function BottomNav({ items, showOnDesktop = false }: BottomNavProps) {
  const pathname = usePathname();
  const { deviceType, os } = useDeviceDetection();

  // Mostra solo su mobile/tablet (a meno che showOnDesktop sia true)
  if (!showOnDesktop && deviceType === "desktop") {
    return null;
  }

  // iOS style: più arrotondato, icone più grandi
  const isIOSStyle = os === "ios";

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white border-t border-gray-200",
        "shadow-2xl",
        // Safe area per iOS home indicator
        os === "ios" && "pb-safe-bottom"
      )}
      style={{
        paddingBottom: os === "ios" ? "max(env(safe-area-inset-bottom), 8px)" : "8px",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center",
                "min-w-[60px] py-2 px-3 rounded-lg",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#A6B5A0]",
                isActive
                  ? "text-[#8da182]"
                  : "text-gray-500 active:bg-gray-100"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div className="relative">
                <span
                  className={clsx(
                    "text-2xl",
                    isIOSStyle ? "text-[26px]" : "text-[24px]"
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                
                {/* Badge notifiche */}
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                    aria-label={`${item.badge} notifiche`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              
              <span
                className={clsx(
                  "text-[11px] font-medium mt-1",
                  isIOSStyle ? "tracking-tight" : "tracking-normal"
                )}
              >
                {item.label}
              </span>
              
              {/* Indicatore attivo iOS style */}
              {isActive && isIOSStyle && (
                <div className="w-1 h-1 bg-[#8da182] rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Spacer per evitare che il contenuto venga nascosto dalla bottom nav
 */
export function BottomNavSpacer() {
  const { deviceType, os } = useDeviceDetection();
  
  if (deviceType === "desktop") {
    return null;
  }

  return (
    <div
      className="h-20"
      style={{
        height: os === "ios" ? "calc(64px + env(safe-area-inset-bottom))" : "64px",
      }}
      aria-hidden="true"
    />
  );
}
