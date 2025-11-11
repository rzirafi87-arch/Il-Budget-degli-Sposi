import Link from "next/link";
import type { EventMeta } from "../types";

function formatOffsetDays(offset: number): string {
  if (offset === 0) return "Event day";
  const abs = Math.abs(offset);
  const unit = abs === 1 ? "day" : "days";
  return offset < 0 ? `${abs} ${unit} before` : `${abs} ${unit} after`;
}

function humanizeEventKey(key: string): string {
  return key
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

type EventBudgetLayoutProps = {
  meta: EventMeta;
};

export default function EventBudgetLayout({ meta }: EventBudgetLayoutProps) {
  const friendlyName = meta.name || humanizeEventKey(meta.key);

  return (
    <main className="space-y-12 py-10">
<<<<<<< ours
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Budget template
        </p>
=======
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Budget template</p>
>>>>>>> theirs
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          {friendlyName} planning workspace
        </h1>
        <p className="mt-4 max-w-3xl text-base text-emerald-900/80">
<<<<<<< ours
          Use this guided layout to kick-start the {friendlyName.toLowerCase()}{" "}
          budget. The default currency is
          <span className="font-semibold"> {meta.defaultCurrency}</span>, but
          you can adapt every figure to your preferred currency inside the
          budget table.
        </p>
        <p className="mt-6 text-sm text-emerald-700/80">
          Need help filling it in? Explore the{" "}
          <Link href="/idea-di-budget" className="font-medium underline">
            budget ideas
          </Link>{" "}
          section to compare suggested allocations.
=======
          Use this guided layout to kick-start the {friendlyName.toLowerCase()} budget. The default currency is
          <span className="font-semibold"> {meta.defaultCurrency}</span>, but you can adapt every figure to your
          preferred currency inside the budget table.
        </p>
        <p className="mt-6 text-sm text-emerald-700/80">
          Need help filling it in? Explore the <Link href="/idea-di-budget" className="font-medium underline">budget
          ideas</Link> section to compare suggested allocations.
>>>>>>> theirs
        </p>
      </header>

      <section className="space-y-6">
        <div>
<<<<<<< ours
          <h2 className="text-2xl font-semibold text-neutral-900">
            Budget sections
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Organize estimates by category and track the main cost buckets of
            the event.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {meta.sections.map((section) => (
=======
          <h2 className="text-2xl font-semibold text-neutral-900">Budget sections</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Organize estimates by category and track the main cost buckets of the event.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {meta.sections.map(section => (
>>>>>>> theirs
            <article
              key={section.id}
              className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
<<<<<<< ours
              <h3 className="text-lg font-semibold text-neutral-900">
                {section.label}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                {section.categories.map((category) => (
                  <li key={category.id} className="flex items-start gap-2">
                    <span
                      className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400"
                      aria-hidden
                    />
=======
              <h3 className="text-lg font-semibold text-neutral-900">{section.label}</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                {section.categories.map(category => (
                  <li key={category.id} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" aria-hidden />
>>>>>>> theirs
                    <span>{category.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
<<<<<<< ours
          <h2 className="text-2xl font-semibold text-neutral-900">
            Timeline checkpoints
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Schedule the key milestones leading up to the celebration and keep
            the team aligned on priorities.
=======
          <h2 className="text-2xl font-semibold text-neutral-900">Timeline checkpoints</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Schedule the key milestones leading up to the celebration and keep the team aligned on priorities.
>>>>>>> theirs
          </p>
        </div>
        <ol className="space-y-4">
          {meta.timeline
            .slice()
            .sort((a, b) => a.offsetDays - b.offsetDays)
<<<<<<< ours
            .map((item) => (
=======
            .map(item => (
>>>>>>> theirs
              <li
                key={item.id}
                className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white/90 px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    {formatOffsetDays(item.offsetDays)}
                  </p>
<<<<<<< ours
                  <p className="text-base font-medium text-neutral-900">
                    {item.label}
                  </p>
=======
                  <p className="text-base font-medium text-neutral-900">{item.label}</p>
>>>>>>> theirs
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  ID: {item.id}
                </span>
              </li>
            ))}
        </ol>
      </section>
    </main>
  );
}
