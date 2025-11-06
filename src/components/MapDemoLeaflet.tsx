"use client";
import "leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Props = {
  favoriteMarkers: number[];
  setFavoriteMarkersAction: Dispatch<SetStateAction<number[]>>;
};

export default function MapDemoLeaflet({ favoriteMarkers, setFavoriteMarkersAction }: Props) {
  // setFavoriteMarkersAction è usato nei marker
  const markers = [
    { id: 1, pos: [45.4654, 9.1859], label: "Fornitore Demo 1", cat: "Atelier", loc: "Milano, Lombardia" },
    { id: 2, pos: [41.9028, 12.4964], label: "Fornitore Demo 2", cat: "Fotografi", loc: "Roma, Lazio" },
    { id: 3, pos: [40.8518, 14.2681], label: "Fornitore Demo 3", cat: "Catering", loc: "Napoli, Campania" },
  ];
  return (
    // @ts-expect-error - React 19 + react-leaflet 5 type issue (runtime works fine)
    <MapContainer center={[45.4654, 9.1859]} zoom={6} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  />
      {markers.map((m) => (
        <Marker key={m.id} position={m.pos as [number, number]}>
          <Popup>
            <div className="flex items-center gap-2">
              <b>{m.label}</b>
              <button
                aria-label="Preferito"
                className={favoriteMarkers.includes(m.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}
                onClick={() => setFavoriteMarkersAction((fav: number[]) => fav.includes(m.id) ? fav.filter((i: number) => i !== m.id) : [...fav, m.id])}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                {favoriteMarkers.includes(m.id)
                  ? <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.2-9-8.7C-1.2 7.2 3.2 2.5 8.1 4.7c1.2.5 2.2 1.5 2.9 2.7.7-1.2 1.7-2.2 2.9-2.7C20.8 2.5 25.2 7.2 21 12.3c-2.5 3.5-9 8.7-9 8.7z" fill="currentColor"/></svg>
                  : <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.2-9-8.7C-1.2 7.2 3.2 2.5 8.1 4.7c1.2.5 2.2 1.5 2.9 2.7.7-1.2 1.7-2.2 2.9-2.7C20.8 2.5 25.2 7.2 21 12.3c-2.5 3.5-9 8.7-9 8.7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            {m.loc}<br />Categoria: {m.cat}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
