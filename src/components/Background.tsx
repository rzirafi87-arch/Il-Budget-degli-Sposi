"use client";

import { usePathname } from "next/navigation";
import React from "react";

function pickBackground(pathname: string): string {
  const map: Array<{ prefix: string; cls: string }> = [
    { prefix: "/save-the-date", cls: "bg-wedding-rose-floral" },
    { prefix: "/spese", cls: "bg-wedding-sage-dots" },
    { prefix: "/entrate", cls: "bg-wedding-rose" },
    { prefix: "/invitati", cls: "bg-wedding-champagne-ornament" },
    { prefix: "/location", cls: "bg-wedding-champagne-ornament" },
    { prefix: "/chiese", cls: "bg-wedding-champagne-ornament" },
    { prefix: "/wedding-planner", cls: "bg-wedding-sage" },
    { prefix: "/musica-cerimonia", cls: "bg-wedding-champagne-ornament" },
    { prefix: "/musica-ricevimento", cls: "bg-wedding-sage-dots" },
    { prefix: "/cose-matrimonio", cls: "bg-wedding-rose-floral" },
    { prefix: "/fornitori", cls: "bg-wedding-sage" },
    { prefix: "/dashboard", cls: "bg-wedding-paper" },
    { prefix: "/budget", cls: "bg-wedding-paper" },
    { prefix: "/auth", cls: "bg-wedding-rose" },
  ];

  for (const m of map) {
    if (pathname.startsWith(m.prefix)) return m.cls;
  }

  return "bg-wedding-champagne"; // default
}

export default function Background() {
  const pathname = usePathname() || "/";
  const cls = pickBackground(pathname);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 ${cls}`}
    />
  );
}
