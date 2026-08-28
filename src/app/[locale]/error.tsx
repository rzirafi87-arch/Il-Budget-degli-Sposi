"use client";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Qualcosa è andato storto</h1>
      <p className="max-w-lg text-muted-fg">Non è stato possibile caricare questa pagina. Riprova tra poco.</p>
      <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={reset}>
        Riprova
      </button>
    </main>
  );
}
