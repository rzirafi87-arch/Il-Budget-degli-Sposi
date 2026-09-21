"use client";

import { SupplierWorkSummary } from "@/components/suppliers/SupplierWorkSummary";
import { AppButton } from "@/components/ui/AppButton";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type PrivateSupplier = {
  id: string;
  resolved_record: Record<string, unknown>;
};

type State =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "ready"; supplier: PrivateSupplier };

function text(record: Record<string, unknown>, key: string) {
  return typeof record[key] === "string" ? String(record[key]) : "";
}

export default function PrivateSupplierDetailPage() {
  const t = useTranslations("branch52M4.privateSupplier");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const resourceId = useMemo(() => Array.isArray(params.id) ? params.id[0] : params.id, [params.id]);
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const response = await fetch(`/api/my/private-catalog?resource_id=${resourceId}`, {
        cache: "no-store",
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.status === 404) {
        setState({ kind: "not-found" });
        return;
      }
      if (!response.ok) throw new Error("PRIVATE_SUPPLIER_READ_FAILED");
      const body = await response.json() as { record?: PrivateSupplier & { entity_type?: string } };
      if (!body.record || body.record.entity_type !== "supplier") {
        setState({ kind: "not-found" });
        return;
      }
      setState({ kind: "ready", supplier: body.record });
    } catch {
      setState({ kind: "error" });
    }
  }, [resourceId]);

  useEffect(() => { void load(); }, [load]);

  if (state.kind === "loading") return <p className="py-10 text-muted-fg" aria-live="polite">{t("loading")}</p>;
  if (state.kind === "not-found") return (
    <section className="app-card app-card--md space-y-4">
      <h1 className="font-serif text-2xl text-fg">{t("notFound")}</h1>
      <Link href={`/${locale}/fornitori`} className="inline-flex items-center gap-2 text-primary underline"><ArrowLeft size={16} aria-hidden />{t("back")}</Link>
    </section>
  );
  if (state.kind === "error") return (
    <section className="app-card app-card--md space-y-4" role="alert">
      <p className="text-red-700 dark:text-red-300">{t("error")}</p>
      <AppButton onClick={() => void load()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton>
    </section>
  );

  const record = state.supplier.resolved_record;
  const name = text(record, "name") || t("unnamed");
  return (
    <section className="space-y-6">
      <Link href={`/${locale}/fornitori`} className="inline-flex items-center gap-2 text-sm text-primary underline"><ArrowLeft size={16} aria-hidden />{t("back")}</Link>
      <header className="app-card app-card--md">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("badge")}</p>
        <h1 className="mt-1 font-serif text-3xl text-fg">{name}</h1>
        {text(record, "category") ? <p className="mt-2 text-muted-fg">{text(record, "category")}</p> : null}
      </header>
      <article className="app-card app-card--md">
        <h2 className="font-semibold text-fg">{t("details")}</h2>
        {text(record, "description") ? <p className="mt-3 whitespace-pre-wrap text-muted-fg">{text(record, "description")}</p> : <p className="mt-3 text-muted-fg">{t("detailsEmpty")}</p>}
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {text(record, "phone") ? <div><dt className="text-sm text-muted-fg">{t("phone")}</dt><dd>{text(record, "phone")}</dd></div> : null}
          {text(record, "email") ? <div><dt className="text-sm text-muted-fg">{t("email")}</dt><dd>{text(record, "email")}</dd></div> : null}
          {text(record, "city") ? <div><dt className="text-sm text-muted-fg">{t("city")}</dt><dd>{text(record, "city")}</dd></div> : null}
        </dl>
      </article>
      <SupplierWorkSummary endpoint={{ scope: "private", resourceId: state.supplier.id }} />
    </section>
  );
}
