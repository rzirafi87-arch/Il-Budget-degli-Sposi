"use client";
import { authErrorKey } from "@/lib/auth";
import { logoutCurrentSession } from "@/lib/logout";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const t = useTranslations("runtimeUi.resetPassword");
  const locale = useLocale(); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  async function submit() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const supabase = getBrowserClient();
    const { data } = await supabase.auth.getSession();
    const result = await supabase.auth.updateUser({ password });
    if (result.error) {
      setBusy(false);
      setError(t(`errors.${authErrorKey(result.error.message)}`));
      return;
    }
    try {
      await logoutCurrentSession({ supabase, accessToken: data.session?.access_token });
      setMessage(t("updated"));
      window.setTimeout(() => window.location.replace(`/${locale}/auth`), 1200);
    } catch (signOutError) {
      setBusy(false);
      setError(t(`errors.${authErrorKey(signOutError instanceof Error ? signOutError.message : undefined)}`));
    }
  }
  return <main className="mx-auto max-w-lg space-y-4 p-8"><h1 className="text-2xl font-bold">{t("title")}</h1><PasswordInput autoComplete="new-password" minLength={10} value={password} onChange={e => setPassword(e.target.value)} /><button className="app-button app-button-primary" disabled={busy || password.length < 10} onClick={submit}>{busy ? t("saving") : t("submit")}</button>{message && <p role="status">{message}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}</main>;
}
