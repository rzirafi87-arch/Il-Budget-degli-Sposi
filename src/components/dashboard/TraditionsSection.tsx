import React from "react";

type Tradition = {
  name: string;
  description: string;
};

type Props = {
  traditions: Tradition[];
};

export default function TraditionsSection({ traditions }: Props) {
  // Deduplica per nome+descrizione per evitare duplicati
  const uniqueTraditions = React.useMemo(() => {
    const map = new Map<string, Tradition>();
    for (const t of traditions) {
      const key = `${(t.name || "").trim().toLowerCase()}|${(t.description || "").trim().toLowerCase()}`;
      if (!map.has(key)) map.set(key, t);
    }
    return Array.from(map.values());
  }, [traditions]);
  if (!uniqueTraditions.length) return null;
  return (
    <div className="mt-8 mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <h2 className="text-2xl font-bold mb-4 text-yellow-700">Tradizioni</h2>
      <ul className="space-y-2">
        {uniqueTraditions.map((t, idx) => (
          <li key={t.name + idx}>
            <span className="font-semibold text-yellow-800">{t.name}</span>: <span className="text-gray-700">{t.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
