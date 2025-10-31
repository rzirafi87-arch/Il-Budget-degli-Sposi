import React from "react";

type Tradition = {
  name: string;
  description: string;
};

type Props = {
  traditions: Tradition[];
};

export default function TraditionsSection({ traditions }: Props) {
  if (!traditions.length) return null;
  return (
    <div className="mt-8 mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <h2 className="text-2xl font-bold mb-4 text-yellow-700">Tradizioni</h2>
      <ul className="space-y-2">
        {traditions.map((t, idx) => (
          <li key={t.name + idx}>
            <span className="font-semibold text-yellow-800">{t.name}</span>: <span className="text-gray-700">{t.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
