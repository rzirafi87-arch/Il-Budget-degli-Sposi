// Server component (può rendere client children)
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export const revalidate = 0;

export default function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LocaleSwitcher />
      </header>

      {/* Demo contenuti localizzati */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white/80 dark:bg-neutral-900/60 p-6 shadow-sm">
          <h2 className="text-lg font-medium">Budget</h2>
          <p className="text-muted-fg">Riepilogo spese e categorie</p>
        </div>
        <div className="rounded-2xl border border-border bg-white/80 dark:bg-neutral-900/60 p-6 shadow-sm">
          <h2 className="text-lg font-medium">Timeline</h2>
          <p className="text-muted-fg">Step e scadenze evento</p>
        </div>
        <div className="rounded-2xl border border-border bg-white/80 dark:bg-neutral-900/60 p-6 shadow-sm">
          <h2 className="text-lg font-medium">Fornitori</h2>
          <p className="text-muted-fg">Ricerca e contatti</p>
        </div>
      </section>
    </main>
  );
}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Timeline</h2>
            <ol className="list-decimal ml-6">
              {timeline.map((t) => (
                <li key={t.code} className="mb-1"><b>{t.title}</b>: {t.description}</li>
              ))}
            </ol>
          </div>
        </>
      )}
    </main>
  );
}
