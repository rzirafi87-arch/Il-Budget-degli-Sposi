import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND_NAME } from "@/config/brand";

export const metadata: Metadata = {
  title: "Battesimo di Vittoria",
  robots: { index: false, follow: false },
};

const budget = [
  ["Budget massimo", "1.500 €"],
  ["Spesa prevista", "1.354 €"],
  ["Già pagato", "283 €"],
  ["Da pagare", "1.071 €"],
  ["Margine sul budget", "146 €"],
];

export default function BaptismPreview() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <main lang="it" className="mx-auto max-w-xl px-4 py-6 text-fg sm:py-10">
      <header className="mb-6 border-b border-border pb-3 text-sm font-semibold">{BRAND_NAME}</header>
      <div className="mb-5 rounded-3xl bg-[#e7eff2] px-5 py-7 text-[#243e47]">
        <p className="mb-2 text-sm">Anteprima · Dati di esempio</p>
        <h1 className="font-serif text-3xl font-bold">Battesimo di Vittoria</h1>
        <p className="mt-2">Domenica 18 aprile 2027</p>
      </div>
      <section className="app-card mb-4 space-y-4 p-5">
        <h2 className="font-serif text-xl font-semibold">Programma</h2>
        <div><p className="text-sm text-muted-fg">10:30 · Cerimonia</p><h3 className="font-semibold">Comunità San Luca</h3><p>Piazza del Gelso 4</p></div>
        <div><p className="text-sm text-muted-fg">13:00 · Ritrovo</p><h3 className="font-semibold">Pranzo alla Trattoria del Cedro</h3><p>Via del Cedro 12</p></div>
      </section>
      <div className="space-y-3">
        <details className="app-card p-4" open><summary className="cursor-pointer font-semibold">Invitati e conferme</summary>
          <p className="mt-3">30 alla cerimonia · 28 al pranzo</p>
          <p className="mt-1 text-sm text-muted-fg">A tavola ci saranno 22 adulti, 5 bambini con menù e Vittoria. Per lei è previsto un seggiolone.</p></details>
        <details className="app-card p-4"><summary className="cursor-pointer font-semibold">Budget e pagamenti</summary>
          <dl className="mt-3 space-y-2">{budget.map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></details>
        <details className="app-card p-4"><summary className="cursor-pointer font-semibold">Invito per la famiglia</summary>
          <p className="mt-3">Ci farebbe piacere avervi con noi per il battesimo di Vittoria.</p>
          <p className="mt-2">Vi aspettiamo il 18 aprile alle 10:30 alla Comunità San Luca. Alle 13:00 ci ritroviamo per il pranzo alla Trattoria del Cedro.</p>
          <p className="mt-2">Entro l’8 aprile fate sapere a Elena chi sarà alla cerimonia e chi verrà anche a pranzo.</p></details>
        <details className="app-card p-4"><summary className="cursor-pointer font-semibold">Scadenze</summary>
          <ul className="mt-3 space-y-2"><li><strong>8 aprile</strong> · Raccogliere le conferme.</li><li><strong>9 aprile</strong> · Ricontattare chi deve ancora rispondere.</li><li><strong>11 aprile</strong> · Comunicare le presenze alla trattoria e verificare seggiolone, menù e accessibilità.</li></ul></details>
      </div>
    </main>
  );
}
