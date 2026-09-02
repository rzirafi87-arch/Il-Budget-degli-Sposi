"use client";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/AppButton";

export default function UserMenu() {
  const locale = useLocale();
  const [user, setUser] = useState<{ email?: string; name?: string } | null | undefined>(undefined);
  useEffect(() => {
    const sb = getBrowserClient();
    async function refresh() {
      const { data } = await sb.auth.getSession();
      const session = data.session;
      if (!session) return setUser(null);
      const response = await fetch("/api/my/profile", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = response.ok ? await response.json() : null;
      setUser({ email: session.user.email, name: json?.profile?.full_name || undefined });
    }
    refresh();
    const { data } = sb.auth.onAuthStateChange(() => refresh());
    const update = () => refresh(); window.addEventListener("profile-updated", update);
    return () => { data.subscription.unsubscribe(); window.removeEventListener("profile-updated", update); };
  }, []);
  if (user === undefined) return <span className="h-9 w-20 animate-pulse rounded bg-black/5" aria-hidden />;
  if (!user) return <Link className={buttonClasses({ variant: "ghost", size: "sm", className: "hidden lg:inline-flex" })} href={`/${locale}/auth`}><LogIn size={17} aria-hidden />Accedi</Link>;
  return <details className="relative"><summary className={buttonClasses({ variant: "ghost", size: "sm" })}><UserRound size={17} aria-hidden />{user.name || user.email || "Profilo"}</summary><div className="absolute right-0 z-50 mt-2 min-w-56 rounded-xl border bg-white p-2 shadow-lg"><p className="truncate px-3 py-2 text-xs text-muted-fg">{user.email}</p><Link className="block rounded px-3 py-2 hover:bg-black/5" href={`/${locale}/profilo`}>Profilo</Link><button className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-black/5" onClick={async () => { const sb = getBrowserClient(); const { data } = await sb.auth.getSession(); const jwt = data.session?.access_token; if (jwt) await fetch("/api/my/current-event", { method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } }); localStorage.removeItem("eventType"); localStorage.removeItem("currentEventChangedAt"); await sb.auth.signOut(); window.location.assign(`/${locale}`); }}><LogOut size={16} aria-hidden />Logout</button></div></details>;
}
