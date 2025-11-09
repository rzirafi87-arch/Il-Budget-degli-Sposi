import clsx from "clsx";
import { type ReactNode } from "react";

export function CtaAccent({ children }: { children: ReactNode }) {
  return (
    <button
      className="inline-flex items-center rounded-2xl px-5 py-3 bg-accent text-accent-foreground hover:opacity-90 shadow transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-bg/90 text-fg dark:bg-secondary/10 dark:text-fg p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
