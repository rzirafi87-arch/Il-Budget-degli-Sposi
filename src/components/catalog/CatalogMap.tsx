"use client";

import type { CatalogSearchResult } from "@/lib/catalogSearch";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function LoadingMap() {
  const t = useTranslations("milestone8.map");
  return <div className="h-80 animate-pulse rounded-xl bg-gray-100" aria-label={t("loading")} />;
}

const MapCanvas = dynamic(() => import("./CatalogMapCanvas"), { ssr: false, loading: LoadingMap });

export function hasValidMapCoordinates(item: Pick<CatalogSearchResult, "latitude" | "longitude">) {
  const latitude = item.latitude;
  const longitude = item.longitude;
  return latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    && !(latitude === 0 && longitude === 0);
}

export function CatalogMap({ results, selectedId, onSelect }: { results: CatalogSearchResult[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  const t = useTranslations("milestone8.map");
  const markers = results.filter(hasValidMapCoordinates);
  if (!markers.length) return null;
  return <div aria-label={t("results")} className="min-w-0 overflow-hidden rounded-xl border border-gray-200">
    <MapCanvas results={markers} selectedId={selectedId} onSelect={onSelect} />
    <p className="border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
      {t("dataAttribution")} © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · ODbL
    </p>
  </div>;
}
