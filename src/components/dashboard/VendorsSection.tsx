import React from "react";

type Vendor = {
  id?: string;
  name: string;
  type?: string;
};

type Props = {
  vendors: Vendor[];
};

export default function VendorsSection({ vendors }: Props) {
  if (!vendors.length) return null;
  return (
    <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-400 rounded">
      <h3 className="text-xl font-bold mb-2 text-green-700">Fornitori</h3>
      <ul className="space-y-1">
        {vendors.map((v) => (
          <li key={v.id || v.name}>
            <span className="font-semibold text-green-800">{v.name}</span>{v.type ? <>: <span className="text-gray-700">{v.type}</span></> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
