"use client";

import eventsConfig from "@/data/config/events.json";
import { AUTH_RESEND_COOLDOWN_SECONDS, authErrorMessage } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

const supabase = getBrowserClient();
type Mode = "login" | "register" | "forgot" | "waiting";

export default function AuthPage() {
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [brideBudget, setBrideBudget] = useState("");
  const [groomBudget, setGroomBudget] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => { if (!cooldown) return; const timer = window.setInterval(() => setCooldown(v => Math.max(0, v - 1)), 1000); return () => window.clearInterval(timer); }, [cooldown]);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) window.location.replace(`/${locale}/dashboard`); }); }, [locale]);

  async function request(path: string, body: object) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || "Request failed");
    return json;
  }

  async function signUp() {
    setError(null); setMessage(null); setLoading(true);
    try {
      await request("/api/auth/register", { primaryEmail: email, password, eventType, partnerEmail: partnerEmail || undefined, weddingDate: weddingDate || undefined, brideBudget: brideBudget ? Number(brideBudget) : undefined, groomBudget: groomBudget ? Number(groomBudget) : undefined, totalBudget: eventType !== "wedding" && brideBudget ? Number(brideBudget) : undefined });
      setMode("waiting"); setCooldown(AUTH_RESEND_COOLDOWN_SECONDS);
    } catch (e) { setError(authErrorMessage(e instanceof Error ? e.message : undefined)); }
    finally { setLoading(false); }
  }

  async function signIn() {
    setError(null); setMessage(null); setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (authError) { setError(authErrorMessage(authError.message)); if (authError.message.toLowerCase().includes("email not confirmed")) setMode("waiting"); }
    else window.location.assign(`/${locale}/dashboard`);
  }

  async function resend() {
    if (cooldown || loading) return;
    setError(null); setLoading(true);
    try { const result = await request("/api/auth/resend", { email }); setMessage(result.message); setCooldown(AUTH_RESEND_COOLDOWN_SECONDS); }
    catch (e) { setError(authErrorMessage(e instanceof Error ? e.message : undefined)); }
    finally { setLoading(false); }
  }

  async function recover() {
    setError(null); setLoading(true);
    try { const result = await request("/api/auth/recovery", { email }); setMessage(result.message); }
    catch (e) { setError(authErrorMessage(e instanceof Error ? e.message : undefined)); }
    finally { setLoading(false); }
  }

  if (mode === "waiting") return <main className="mx-auto max-w-lg space-y-5 p-8"><h1 className="text-2xl font-bold">Conferma la tua email</h1><p>Abbiamo inviato un link di conferma. Aprilo per attivare l’account.</p><p className="text-sm text-muted-fg">{email}</p><button className="app-button app-button-primary" onClick={resend} disabled={loading || cooldown > 0}>Invia di nuovo l’email di conferma{cooldown ? ` (${cooldown}s)` : ""}</button><button className="app-button app-button-ghost" onClick={() => { setMode("login"); setError(null); }}>Torna al login</button>{message && <p role="status" className="text-green-700">{message}</p>}{error && <p ref={errorRef} tabIndex={-1} role="alert" className="text-red-700">{error}</p>}</main>;

  return <main className="mx-auto max-w-lg space-y-4 p-8"><h1 className="text-2xl font-bold">Accedi o registrati</h1>
    {mode === "register" && <><label className="block">Tipo di evento<select className="mt-1 block w-full border px-3 py-2" value={eventType} onChange={e => setEventType(e.target.value)}>{eventsConfig.filter(ev => ev.available).map(ev => <option key={ev.slug} value={ev.slug}>{ev.emoji} {ev.label}</option>)}</select></label>{eventType === "wedding" && <><label className="block">Email partner (opzionale)<input className="mt-1 block w-full border px-3 py-2" type="email" autoComplete="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} /></label><label className="block">Data matrimonio<input className="mt-1 block w-full border px-3 py-2" type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} /></label></>}<div className="grid gap-3 sm:grid-cols-2"><label className="block">{eventType === "wedding" ? "Budget sposa (€)" : "Budget totale (€)"}<input className="mt-1 block w-full border px-3 py-2" type="number" min="0" inputMode="decimal" value={brideBudget} onChange={e => setBrideBudget(e.target.value)} /></label>{eventType === "wedding" && <label className="block">Budget sposo (€)<input className="mt-1 block w-full border px-3 py-2" type="number" min="0" inputMode="decimal" value={groomBudget} onChange={e => setGroomBudget(e.target.value)} /></label>}</div></>}
    <label className="block">Email<input className="mt-1 block w-full border px-3 py-2" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required aria-describedby={error ? "auth-error" : undefined} /></label>
    {mode !== "forgot" && <label className="block">Password<input className="mt-1 block w-full border px-3 py-2" type="password" minLength={mode === "register" ? 10 : undefined} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} required aria-describedby={error ? "auth-error" : undefined} />{mode === "register" && <span className="text-xs text-muted-fg">Almeno 10 caratteri.</span>}</label>}
    <div className="flex flex-wrap gap-2"><button className="app-button app-button-primary" onClick={mode === "login" ? signIn : mode === "register" ? signUp : recover} disabled={loading || !email || (mode !== "forgot" && !password)}>{loading ? "Operazione in corso…" : mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Invia istruzioni"}</button>{mode === "login" && <><button className="app-button app-button-ghost" onClick={() => setMode("register")}>Registrati</button><button className="app-button app-button-ghost" onClick={() => setMode("forgot")}>Password dimenticata?</button></>}{mode !== "login" && <button className="app-button app-button-ghost" onClick={() => setMode("login")}>Torna al login</button>}</div>
    {message && <p role="status" className="text-green-700">{message}</p>}{error && <p id="auth-error" ref={errorRef} tabIndex={-1} role="alert" className="text-red-700">{error}</p>}
  </main>;
}
