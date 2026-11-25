"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {partyText} from "@/features/events/eighteenth/copy";
import PartyPayment from "@/features/events/eighteenth/PartyPayment";
import PartyDetails from "@/features/events/eighteenth/PartyDetails";
import { useCallback, useEffect, useRef, useState } from "react";

const categories = ["venue", "catering", "cake", "dj", "photography", "decor", "invites"] as const;
type Entry = { id: string; category: string; committed: number; paid: number; status: string };
type Party = { id: string; name: string; event_date: string; total_budget: number; currency: string | null };

export default function PartyDashboard({ token }: { token: string }) {
  const t = useTranslations("party18");
  const locale = useLocale();
  const tx=(text:string)=>partyText(locale,text);
  const [detailsDirty,setDetailsDirty]=useState(false);
  const [paymentDrafts,setPaymentDrafts]=useState<Record<string,boolean>>({});
  const paymentDirty=Object.values(paymentDrafts).some(Boolean);
  const markPaymentDirty=useCallback((id:string,dirty:boolean)=>setPaymentDrafts(old=>old[id]===dirty?old:{...old,[id]:dirty}),[]);

  const [party, setParty] = useState<Party | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [revision, refresh] = useState(0);
  const [amount, setAmount] = useState("");
  useEffect(()=>{if(!detailsDirty&&!paymentDirty&&!amount)return;const leave=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",leave);return()=>window.removeEventListener("beforeunload",leave);},[detailsDirty,paymentDirty,amount]);
  const [category, setCategory] = useState<string>("venue");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setParty(null);setEntries([]);setNotice('');
    async function load() {
      const options = { headers: { Authorization: "Bearer " + token }, signal: controller.signal };
      const summary = await fetch("/api/my/eighteenth-dashboard", options);
      if (!summary.ok) throw new Error();
      const { event, entries: rows } = await summary.json();
      if (!event?.id || !Array.isArray(rows)) throw new Error();
      if (!controller.signal.aborted) { setParty(event); setEntries(rows); }
    }
    void load().catch(() => { if (!controller.signal.aborted) setNotice("error"); });
    return () => controller.abort();
  }, [token, revision]);

  async function save(status: string) {
    if(saving.current || !party)return;
    if(detailsDirty||paymentDirty){setNotice("error");return;}
    if(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0||Number(amount)>999999999){setNotice('error');return;}
    saving.current=true;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/my/expenses", {
        method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", "X-Expected-Event-Id":party.id },
        body: JSON.stringify({ category, subcategory: category, amount: Number(amount),
          status, spendType: "common", date: new Date().toLocaleDateString("en-CA"), fromDashboard: true }),
      });
      if (!response.ok) throw new Error();
      setAmount(""); setNotice("saved"); refresh(n => n + 1);
    } catch { setNotice("error"); } finally { saving.current=false;setBusy(false); }
  }
  const paid = entries.reduce((sum, entry) => sum + entry.paid, 0);
  const quotes = entries.filter(entry => entry.status !== "rejected").reduce((sum, entry) => sum + Math.max(0,entry.committed-entry.paid), 0);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: party?.currency || "EUR" });
  return <main className="mx-auto grid max-w-xl gap-5 p-4">
    {notice && <p role={notice==='error'?'alert':'status'}>{t(notice)}</p>}
    {notice==='error'&&<button type="button" onClick={()=>refresh(n=>n+1)}>{t('retry')}</button>}
    {party && <>
      <header><h1 className="text-2xl font-bold">{party.name}</h1>
        <time dateTime={party.event_date}>{new Intl.DateTimeFormat(locale, {dateStyle: "long", timeZone: "UTC"}).format(new Date(party.event_date))}</time></header>
      {<PartyDetails locale={locale} eventId={party.id} day={party.event_date.slice(0,10)} name={party.name} onDirty={setDetailsDirty}/>}
      {detailsDirty&&<p role="status">{tx("Salva i dettagli della festa prima di registrare una spesa.")}</p>}
      <p>{t("first")}</p>
      <nav className="grid gap-2">{["invitati", "location", "fornitori", "timeline"].map(path =>
        <Link key={path} onClick={e=>{if((detailsDirty||paymentDirty||amount)&&!window.confirm(tx("Hai modifiche non salvate. Vuoi lasciarle?")))e.preventDefault();}} className="underline" href={`/${locale}/${path}`}>{t("links." + path)}</Link>)}</nav>
      <dl>{Object.entries({budget: party.total_budget, paid, remaining: party.total_budget - paid, quotes}).map(([key, value]) =>
        <div className="flex flex-wrap justify-between gap-2" key={key}><dt>{t(key)}</dt><dd>{money.format(value)}</dd></div>)}</dl>
      <form className="grid gap-3" onSubmit={e => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        void save(submitter?.value === "pending" ? "pending" : "approved");
      }}>
        <label className="grid">{t("category")}<select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(key => <option key={key} value={key}>{t("categories." + key)}</option>)}</select></label>
        <label className="grid">{t("amount")}<input type="number" required min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></label>
        <button disabled={busy||detailsDirty||paymentDirty} className="app-button app-button--primary" value="approved">{t("expense")}</button>
        <button disabled={busy||detailsDirty||paymentDirty} value="pending">{t("quote")}</button>
      </form>
      {entries.length ? <ul>{entries.map(entry => <li key={entry.id}>
        {categories.some(key => key === entry.category) ? t("categories." + entry.category) : entry.category} · {money.format(entry.committed)}
        {<p>{tx("Pagato")}: {money.format(entry.paid)} · {tx("Saldo")}: {money.format(Math.max(0,entry.committed-entry.paid))}</p>}
        {entry.status!=="rejected"&&entry.committed>entry.paid&&<PartyPayment locale={locale} eventId={party.id} expenseId={entry.id} remaining={entry.committed-entry.paid} blocked={detailsDirty||busy||Boolean(amount)||Object.entries(paymentDrafts).some(([id,dirty])=>id!==entry.id&&dirty)} onDirty={markPaymentDirty} onSaved={()=>refresh(n=>n+1)}/>}
      </li>)}</ul> : <p>{t("empty")}</p>}
    </>}
  </main>;
}
