"use client";

import type { SupplierLink } from "@/lib/supplierWorkContracts";
import Link from "next/link";

export function supplierDetailHref(locale: string, supplier: SupplierLink) {
  return supplier.scope === "saved" && supplier.catalogId
    ? `/${locale}/fornitori/${supplier.catalogId}`
    : `/${locale}/fornitori/privati/${supplier.resourceId}`;
}

export function SupplierLinkView({
  locale,
  supplier,
  label,
}: {
  locale: string;
  supplier: SupplierLink;
  label: string;
}) {
  return (
    <p className="text-sm text-muted-fg">
      {label}{" "}
      <Link className="font-semibold text-primary underline underline-offset-4" href={supplierDetailHref(locale, supplier)}>
        {supplier.name}
      </Link>
    </p>
  );
}
