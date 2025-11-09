import { ReactNode } from "react";

export function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
      {children}
    </div>
  );
}
