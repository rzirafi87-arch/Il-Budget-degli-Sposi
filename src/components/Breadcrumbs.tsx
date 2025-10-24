"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Mappa dei path con label personalizzate
  const pathLabels: Record<string, string> = {
    "": "🏠 Home",
    "dashboard": "📊 Dashboard",
    "timeline": "📅 Timeline",
    "budget": "💰 Budget",
    "invitati": "👥 Invitati",
    "formazione-tavoli": "🪑 Tavoli",
    "spese": "💸 Spese",
    "entrate": "💵 Entrate",
    "fornitori": "🏢 Fornitori",
    "ricevimento": "🏛️ Ricevimento",
    "location": "📍 Location",
    "cerimonia": "⛪ Cerimonia",
    "chiesa": "⛪ Chiesa",
    "preferiti": "❤️ Preferiti",
    "documenti": "📄 Documenti",
    "lista-nozze": "🎁 Lista Nozze",
    "wedding-planner": "📋 Wedding Planner",
    "musica-cerimonia": "🎵 Musica Cerimonia",
    "musica-ricevimento": "🎶 Musica Ricevimento",
    "cose-matrimonio": "🎪 Cose Matrimonio",
    "save-the-date": "💌 Save the Date",
    "auth": "🔐 Accesso",
    "contatti": "📞 Contatti",
  };

  // Costruisci i breadcrumbs dal path
  const pathSegments = pathname.split("/").filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null; // Non mostrare breadcrumbs sulla homepage
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "🏠 Home", href: "/" },
  ];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    breadcrumbs.push({
      label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
    });
  });

  return (
    <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto pb-2" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-2 whitespace-nowrap">
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-gray-600 hover:text-[#A6B5A0] transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-bold">{crumb.label}</span>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <span className="text-gray-400">›</span>
          )}
        </span>
      ))}
    </nav>
  );
}
