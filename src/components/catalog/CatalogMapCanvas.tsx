"use client";

import type { CatalogSearchResult } from "@/lib/catalogSearch";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

function Bounds({ results }: { results: CatalogSearchResult[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(results.map((r) => [r.latitude as number, r.longitude as number]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
  }, [map, results]);
  return null;
}

const markerIcon = (selected: boolean) => L.divIcon({
  className: "catalog-map-marker",
  html: `<span aria-hidden="true" style="display:block;width:${selected ? 22 : 16}px;height:${selected ? 22 : 16}px;border-radius:999px;background:${selected ? "#8d3f63" : "#586852"};border:3px solid white;box-shadow:0 1px 6px #0006"></span>`,
  iconSize: [selected ? 22 : 16, selected ? 22 : 16], iconAnchor: [selected ? 11 : 8, selected ? 11 : 8],
});

export default function CatalogMapCanvas({ results, selectedId, onSelect }: { results: CatalogSearchResult[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  const first = results[0];
  return <MapContainer center={[first.latitude as number, first.longitude as number]} zoom={9} scrollWheelZoom={false} className="h-80 w-full" preferCanvas>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Bounds results={results} />
    {results.map((result) => <Marker key={result.id} position={[result.latitude as number, result.longitude as number]} icon={markerIcon(result.id === selectedId)} eventHandlers={{ click: () => onSelect(result.id) }}><Popup><strong>{result.name}</strong><br />{[result.city, result.province].filter(Boolean).join(", ")}</Popup></Marker>)}
  </MapContainer>;
}
