"use client";
import { authErrorKey } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function ResetPasswordPage() {
  const t = useTranslations("runtimeUi.resetPassword");
  const locale = useLocale(); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  async function submit() { setBusy(true); setError(null); const result = await getBrowserClient().auth.updateUser({ password }); setBusy(false); if (result.error) setError(t(`errors.${authErrorKey(result.error.message)}`)); else { setMessage(t("updated")); window.setTimeout(() => window.location.assign(`/${locale}/auth`), 1200); } }
  return <main className="mx-auto max-w-lg space-y-4 p-8"><h1 className="text-2xl font-bold">{t("title")}</h1><label className="block">Password<input className="mt-1 block w-full border px-3 py-2" type="password" autoComplete="new-password" minLength={10} value={password} onChange={e => setPassword(e.target.value)} /></label><button className="app-button app-button-primary" disabled={busy || password.length < 10} onClick={submit}>{busy ? t("saving") : t("submit")}</button>{message && <p role="status">{message}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}</main>;
}
