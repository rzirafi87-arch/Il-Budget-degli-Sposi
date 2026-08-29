import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type AppCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

export function AppCard({
  children,
  className,
  padding = "md",
  interactive = false,
  ...props
}: AppCardProps) {
  return (
    <div
      className={clsx(
        "app-card",
        `app-card--${padding}`,
        interactive && "app-card--interactive",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
