import type { ReactNode } from "react";

export const metadata = {
  title: "Cresima",
};

export default function CresimaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-warm-gray)" }}>
          Cresima
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Strumenti essenziali per organizzare la Cresima.
        </p>
      </header>
      {children}
    </div>
  );
}

