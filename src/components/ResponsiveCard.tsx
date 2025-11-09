/**
 * Card responsiva ottimizzata per PC, Android e iOS
 * Gestisce automaticamente padding, ombre, bordi e interazioni touch
 */

"use client";

import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import clsx from "clsx";
import { type ReactNode } from "react";

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  /** Abilita effetto hover (solo desktop) */
  hoverable?: boolean;
  /** Abilita click/tap */
  onClick?: () => void;
  /** Link href (alternativa a onClick) */
  href?: string;
  /** Variante colore */
  variant?: "default" | "sage" | "rose" | "beige";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Mostra bordo */
  bordered?: boolean;
  /** Elevazione ombra */
  elevation?: "none" | "sm" | "md" | "lg";
}

export default function ResponsiveCard({
  children,
  className,
  hoverable = false,
  onClick,
  href,
  variant = "default",
  padding = "md",
  bordered = true,
  elevation = "sm",
}: ResponsiveCardProps) {
  const { deviceType, os, isTouchDevice } = useDeviceDetection();

  const Component = href ? "a" : onClick ? "button" : "div";
  const extraProps = href ? { href } : onClick ? { onClick, type: "button" as const } : {};

  // Padding responsive
  const paddingClass = {
    sm: {
      mobile: "p-3",
      tablet: "p-4",
      desktop: "p-5",
    },
    md: {
      mobile: "p-4",
      tablet: "p-5",
      desktop: "p-6",
    },
    lg: {
      mobile: "p-5",
      tablet: "p-6",
      desktop: "p-8",
    },
  }[padding][deviceType];

  // Background variants
  const variantClass = {
    default: "bg-bg/95 dark:bg-secondary/10 text-fg",
    sage: "bg-gradient-to-br from-white via-secondary/40 to-primary/60 dark:from-secondary/30 dark:via-secondary/50 dark:to-primary/70 text-fg",
    rose: "bg-gradient-to-br from-white to-[#fff5f7] dark:from-[#30211d] dark:to-[#1b1b1b] text-fg",
    beige: "bg-gradient-to-br from-white to-[#faf8f5] dark:from-[#1b1b19] dark:to-[#151513] text-fg",
  }[variant];

  // Elevazione ombre
  const shadowClass = {
    none: "",
    sm: "shadow-soft-sm",
    md: "shadow-soft",
    lg: "shadow-soft-lg",
  }[elevation];

  // Border
  const borderClass = bordered ? "border border-border" : "";

  // Interattività
  const interactiveClass = (onClick || href)
    ? [
        "cursor-pointer",
        "transition-all duration-200",
        // Desktop hover (solo se non touch)
        !isTouchDevice && hoverable && "hover:shadow-soft-lg hover:-translate-y-1",
        // Mobile/tablet tap feedback
        isTouchDevice && "active:scale-[0.98] active:shadow-sm",
        // Focus
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg",
      ]
    : [];

  const cardClasses = clsx(
    "rounded-soft-lg",
    paddingClass,
    variantClass,
    shadowClass,
    borderClass,
    interactiveClass,
    className
  );

  return (
    <Component 
      className={cardClasses} 
      {...extraProps}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Card con header e footer predefiniti
 */
interface CardSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  href?: string;
  /** Variante colore */
  variant?: "default" | "sage" | "rose" | "beige";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
}

export function CardSection({
  children,
  className,
  title,
  subtitle,
  icon,
  action,
  footer,
  hoverable = false,
  onClick,
  href,
  variant = "default",
  padding = "md",
}: CardSectionProps) {
  const { deviceType } = useDeviceDetection();

  const titleSize = {
    mobile: "text-lg",
    tablet: "text-xl",
    desktop: "text-2xl",
  }[deviceType];

  return (
    <ResponsiveCard hoverable={hoverable} onClick={onClick} href={href} className={className} variant={variant} padding={padding}>
      {(title || subtitle || icon || action) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
            <div>
            {title && (
              <h3 className={clsx("font-serif font-bold text-fg", titleSize)}>
                {title}
              </h3>
            )}
              {subtitle && (
                <p className="text-sm text-muted-fg mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </ResponsiveCard>
  );
}
