import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type AppButtonSize = "sm" | "md" | "lg" | "icon";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  className?: string;
} = {}) {
  return clsx("app-button", `app-button--${variant}`, `app-button--${size}`, className);
}

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
};

export function AppButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="app-spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}

type AppButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  "aria-label"?: string;
};

export function AppButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: AppButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
