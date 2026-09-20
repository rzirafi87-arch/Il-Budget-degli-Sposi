"use client";

import type { SupplierLink, SupplierOption, SupplierReferenceInput } from "@/lib/supplierWorkContracts";
import { useId, useMemo, useState } from "react";

type Props = {
  label: string;
  searchLabel: string;
  emptyLabel: string;
  savedLabel: string;
  privateLabel: string;
  options: readonly SupplierOption[];
  value: SupplierLink | SupplierReferenceInput | null;
  disabled?: boolean;
  onChange: (value: SupplierReferenceInput | null) => void;
  testId?: string;
};

function identity(value: SupplierLink | SupplierReferenceInput | null) {
  if (!value) return "";
  const resourceId = "resourceId" in value ? value.resourceId : value.resource_id;
  return `${value.scope}:${resourceId}`;
}

export function SupplierSelector({
  label,
  searchLabel,
  emptyLabel,
  savedLabel,
  privateLabel,
  options,
  value,
  disabled,
  onChange,
  testId,
}: Props) {
  const id = useId();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.name.toLocaleLowerCase().includes(needle));
  }, [options, search]);

  return (
    <div className="min-w-0 space-y-2">
      {options.length > 8 ? (
        <label className="block text-sm font-medium text-fg" htmlFor={`${id}-search`}>
          <span>{searchLabel}</span>
          <input
            id={`${id}-search`}
            type="search"
            className="app-input mt-1 w-full"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={disabled}
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-fg" htmlFor={`${id}-select`}>
        <span>{label}</span>
        <select
          id={`${id}-select`}
          data-testid={testId}
          className="app-select mt-1 w-full"
          value={identity(value)}
          disabled={disabled}
          onChange={(event) => {
            if (!event.target.value) {
              onChange(null);
              return;
            }
            const [scope, resourceId] = event.target.value.split(":", 2);
            if ((scope === "saved" || scope === "private") && resourceId) {
              onChange({ scope, resource_id: resourceId });
            }
          }}
        >
          <option value="">{emptyLabel}</option>
          {filtered.map((option) => (
            <option key={`${option.scope}:${option.resourceId}`} value={`${option.scope}:${option.resourceId}`}>
              {option.name} — {option.scope === "saved" ? savedLabel : privateLabel}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
