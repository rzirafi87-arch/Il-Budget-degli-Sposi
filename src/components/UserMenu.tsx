"use client";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/AppButton";

export default function UserMenu() {
  const locale = useLocale();
  const t = useTranslations("runtimeUi.shared");
  const [user, setUser] = useState<{ email?: string; name?: string } | null | undefined>(undefined);
  useEffect(() => {
    const sb = getBrowserClient();
    let active = true;

    async function loadUser(session: Session | null) {
      if (!active) return;
      if (!session) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch("/api/my/profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = response.ok ? await response.json() : null;
        if (active) {
          setUser({
            email: session.user.email,
            name: json?.profile?.full_name || undefined,
          });
        }
      } catch {
        if (active) {
          setUser({ email: session.user.email });
        }
      }
    }

    void sb.auth.getSession()
      .then(({ data }) => loadUser(data.session))
      .catch(() => {
        if (active) setUser(null);
      });

    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      // The auth callback already receives the current session. Calling
      // getSession() from inside it can contend for Supabase's auth lock and
      // leave every authenticated screen waiting indefinitely.
      void loadUser(session);
    });

    const update = () => {
      void sb.auth.getSession()
        .then(({ data: sessionData }) => loadUser(sessionData.session))
        .catch(() => {
          if (active) setUser(null);
        });
    };
    window.addEventListener("profile-updated", update);

    return () => {
      active = false;
      data.subscription.unsubscribe();
      window.removeEventListener("profile-updated", update);
    };
  }, []);

  if (user === undefined) return <span className="h-9 w-20 animate-pulse rounded bg-black/5" aria-hidden />;
  if (!user) return <Link className={buttonClasses({ variant: "ghost", size: "sm", className: "hidden lg:inline-flex" })} href={`/${locale}/auth`}><LogIn size={17} aria-hidden />{t("signIn")}</Link>;
  return <details className="relative min-w-0"><summary className={buttonClasses({ variant: "ghost", size: "sm", className: "max-w-40 sm:max-w-60" })}><UserRound size={17} className="shrink-0" aria-hidden /><span className="truncate">{user.name || user.email || t("profile")}</span></summary><div className="absolute right-0 z-50 mt-2 min-w-56 rounded-xl border bg-white p-2 shadow-lg"><p className="truncate px-3 py-2 text-xs text-muted-fg">{user.email}</p><Link className="block rounded px-3 py-2 hover:bg-black/5" href={`/${locale}/profilo`}>{t("profile")}</Link><button className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-black/5" onClick={async () => { const sb = getBrowserClient(); const { data } = await sb.auth.getSession(); const jwt = data.session?.access_token; if (jwt) await fetch("/api/my/current-event", { method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } }); localStorage.removeItem("eventType"); localStorage.removeItem("currentEventChangedAt"); await sb.auth.signOut(); window.location.assign(`/${locale}`); }}><LogOut size={16} aria-hidden />{t("logout")}</button></div></details>;
}
