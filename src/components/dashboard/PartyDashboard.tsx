"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const categories = ["venue", "catering", "cake", "dj", "photography", "decor", "invites"] as const;
type Entry = { id: string; category: string; committed: number; paid: number; status: string };
type Party = { id: string; name: string; event_date: string; total_budget: number; currency: string | null };

export default function PartyDashboard({ token }: { token: string }) {
  const t = useTranslations("party18");
  const locale = useLocale();
  const [party, setParty] = useState<Party | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [revision, refresh] = useState(0);
  const [amount, setAmount] = useState("");
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
  const quotes = entries.filter(entry => entry.status === "pending").reduce((sum, entry) => sum + entry.committed, 0);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: party?.currency || "EUR" });
  return <main className="mx-auto grid max-w-xl gap-5 p-4">
    {notice && <p role={notice==='error'?'alert':'status'}>{t(notice)}</p>}
    {notice==='error'&&<button type="button" onClick={()=>refresh(n=>n+1)}>{t('retry')}</button>}
    {party && <>
      <header><h1 className="text-2xl font-bold">{party.name}</h1>
        <time dateTime={party.event_date}>{new Intl.DateTimeFormat(locale, {dateStyle: "long", timeZone: "UTC"}).format(new Date(party.event_date))}</time></header>
      <p>{t("first")}</p>
      <nav className="grid gap-2">{["invitati", "location", "fornitori", "timeline"].map(path =>
        <Link key={path} className="underline" href={`/${locale}/${path}`}>{t("links." + path)}</Link>)}</nav>
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
        <button disabled={busy} className="app-button app-button--primary" value="approved">{t("expense")}</button>
        <button disabled={busy} value="pending">{t("quote")}</button>
      </form>
      {entries.length ? <ul>{entries.map(entry => <li key={entry.id}>
        {categories.some(key => key === entry.category) ? t("categories." + entry.category) : entry.category} · {money.format(entry.committed)}
      </li>)}</ul> : <p>{t("empty")}</p>}
    </>}
  </main>;
}
