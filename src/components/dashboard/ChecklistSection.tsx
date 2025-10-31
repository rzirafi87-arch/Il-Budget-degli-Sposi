import React from "react";

type ChecklistItem = {
  id?: string;
  module_name: string;
  is_required?: boolean;
};

type Props = {
  checklist: ChecklistItem[];
  checkedChecklist: { [key: string]: boolean };
  setCheckedChecklist: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

export default function ChecklistSection({ checklist, checkedChecklist, setCheckedChecklist }: Props) {
  if (!checklist.length) return null;
  return (
    <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <h3 className="text-xl font-bold mb-2 text-yellow-700">Checklist</h3>
      <ul className="space-y-1">
        {checklist.map((c) => (
          <li key={c.id || c.module_name} className="flex items-center gap-2">
            <input type="checkbox" checked={!!checkedChecklist[c.id || c.module_name]} onChange={()=>setCheckedChecklist(prev=>({...prev, [c.id || c.module_name]: !prev[c.id || c.module_name]}))} />
            <span className={checkedChecklist[c.id || c.module_name] ? "line-through text-gray-400" : "font-semibold text-yellow-800"}>{c.module_name}</span>
            {c.is_required ? <span className="text-xs text-yellow-700 ml-1">(obbligatorio)</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
