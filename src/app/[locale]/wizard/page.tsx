// Server component (usa Link client-safe)
import Link from "next/link";

export default function WizardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wizard iniziale</h1>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded-2xl px-4 py-2 bg-accent text-accent-foreground hover:opacity-90 shadow"
        >
          Salta
        </Link>
      </header>

      <section className="rounded-2xl border border-border bg-white/80 dark:bg-neutral-900/60 p-6 shadow-sm space-y-4">
        <p className="text-muted-fg">
          Seleziona lingua, nazione ed evento per personalizzare l’esperienza.
        </p>

        {/* Qui puoi inserire i tuoi step / form */}
        <div className="flex gap-3">
          <Link
            href={`/${locale}/(routes)/dashboard`}
            className="inline-flex items-center rounded-2xl px-5 py-3 bg-primary text-primary-foreground hover:opacity-90"
          >
            Inizia ora
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center rounded-2xl px-5 py-3 border border-border hover:bg-muted"
          >
            Torna alla Home
          </Link>
        </div>
      </section>
    </main>
  );
}
