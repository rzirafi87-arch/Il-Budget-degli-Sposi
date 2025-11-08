"use client";
// Stub temporaneo della mappa: le dipendenze leaflet/react-leaflet non sono installate.
// In produzione sostituire con implementazione reale dopo `npm install leaflet react-leaflet`.
type Props = { favoriteMarkers: number[]; setFavoriteMarkersAction: (fn: (prev: number[]) => number[]) => void };
export default function MapDemoLeaflet({ favoriteMarkers }: Props) {
  return (
    <div className="flex items-center justify-center h-64 w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
      <div>
        <p className="font-semibold mb-1">Mappa fornitori disattivata</p>
        <p>
          Installare <code>leaflet</code> e <code>react-leaflet</code> per riattivare. Preferiti attuali: {favoriteMarkers.length}
        </p>
      </div>
    </div>
  );
}
