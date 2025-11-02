"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIdea = pathname?.startsWith("/idea-di-budget");

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2">Budget</h2>
      {/* Tabs in stile Contabilità */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <Link
          href="/budget"
          className={`px-4 sm:px-6 py-3 font-semibold transition-all ${!isIdea ? "text-white border-b-4 rounded-t-lg" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"}`}
          style={!isIdea ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          Spese approvate
        </Link>
        <Link
          href="/idea-di-budget"
          className={`px-4 sm:px-6 py-3 font-semibold transition-all ${isIdea ? "text-white border-b-4 rounded-t-lg" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg"}`}
          style={isIdea ? { background: "var(--color-sage)", borderColor: "#8a9d84" } : {}}
        >
          Idea di spesa
        </Link>
      </div>
      {children}
    </section>
  );
}
