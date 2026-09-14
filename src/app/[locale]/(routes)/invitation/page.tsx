"use client";
import { safeInternalPath } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Invite = { status: string; expiresAt: string; eventName: string | null; ownerName: string | null };
export default function InvitationPage() {
  const locale=useLocale(), t=useTranslations("runtimeUi.partnerLifecycle"), [invite,setInvite]=useState<Invite|null>(null), [error,setError]=useState<string|null>(null), [busy,setBusy]=useState(false), alert=useRef<HTMLParagraphElement>(null);
  const token=typeof window==="undefined"?"":new URLSearchParams(window.location.search).get("token")||"";
  useEffect(()=>{ if(!token){const timer=window.setTimeout(()=>setError("INVITATION_INVALID"),0);return()=>window.clearTimeout(timer);} fetch(`/api/invitations/inspect?token=${encodeURIComponent(token)}`).then(async r=>{const j=await r.json(); if(!r.ok)throw new Error(j.error); setInvite(j.invitation);}).catch(e=>setError(e instanceof Error?e.message:"INVITATION_INVALID")); },[token]);
  useEffect(()=>{if(error)alert.current?.focus();},[error]);
  const stateMessage=(status:string)=>status==="accepted"?t("states.accepted"):status==="rejected"?t("states.rejected"):status==="revoked"?t("states.revoked"):status==="expired"?t("states.expired"):t("states.pending");
  async function decide(action:"accept"|"reject") { setBusy(true); setError(null); const {data}=await getBrowserClient().auth.getSession(); const here=safeInternalPath(`/${locale}/invitation?token=${token}`,`/${locale}/invitation`); if(!data.session){window.location.assign(`/${locale}/auth?next=${encodeURIComponent(here)}`);return;} const r=await fetch(`/api/invitations/${action}`,{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({token})}); const j=await r.json(); setBusy(false); if(!r.ok){setError(j.error);return;} window.location.replace(action==="accept"?`/${locale}/dashboard`:`/${locale}/select-event`); }
  return <main className="mx-auto max-w-xl space-y-4 p-5 sm:p-8"><h1 className="text-2xl font-bold">{t("title")}</h1>{!invite&&!error&&<p role="status">{t("loading")}</p>}{invite&&<><p>{t("invitedBy",{owner:invite.ownerName||t("owner"),event:invite.eventName||t("event")})}</p>{invite.status==="pending"?<div className="flex flex-wrap gap-3"><button autoFocus className="app-button app-button-primary" disabled={busy} onClick={()=>decide("accept")}>{t("accept")}</button><button className="app-button app-button-ghost" disabled={busy} onClick={()=>decide("reject")}>{t("reject")}</button></div>:<p role="status">{stateMessage(invite.status)}</p>}</>}{error&&<p ref={alert} tabIndex={-1} role="alert">{t("genericError",{code:error})}</p>}</main>;
}
