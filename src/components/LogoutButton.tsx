"use client";

import { buttonClasses } from "@/components/ui/AppButton";
import { logoutCurrentSession } from "@/lib/logout";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type LogoutButtonProps = {
  placement?: "menu" | "profile";
};

export default function LogoutButton({ placement = "menu" }: LogoutButtonProps) {
  const locale = useLocale();
  const t = useTranslations("runtimeUi.shared");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    setFailed(false);

    try {
      const supabase = getBrowserClient();
      const { data } = await supabase.auth.getSession();
      await logoutCurrentSession({
        supabase,
        accessToken: data.session?.access_token,
      });
      window.location.replace(`/${locale}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  const menu = placement === "menu";
  return (
    <div className={menu ? undefined : "space-y-2"}>
      <button
        type="button"
        className={menu
          ? "flex min-h-11 w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
          : buttonClasses({ variant: "outline", className: "w-full sm:w-auto" })}
        disabled={busy}
        onClick={logout}
      >
        <LogOut size={17} aria-hidden />
        {busy ? t("loggingOut") : t("logout")}
      </button>
      {failed && <p className="text-sm text-red-700" role="alert">{t("logoutFailed")}</p>}
    </div>
  );
}
