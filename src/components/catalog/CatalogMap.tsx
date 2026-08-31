"use client";

import type { CatalogSearchResult } from "@/lib/catalogSearch";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./CatalogMapCanvas"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-xl bg-gray-100" aria-label="Loading map" /> });

export function CatalogMap({ results, selectedId, onSelect }: { results: CatalogSearchResult[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  const markers = results.filter((item) => item.latitude !== null && item.longitude !== null);
  if (!markers.length) return null;
  return <div aria-label="Catalog results map" className="overflow-hidden rounded-xl border border-gray-200"><MapCanvas results={markers} selectedId={selectedId} onSelect={onSelect} /></div>;
}
