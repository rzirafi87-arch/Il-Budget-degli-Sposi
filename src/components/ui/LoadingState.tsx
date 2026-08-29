type LoadingStateProps = {
  label?: string;
  cards?: number;
};

export function LoadingState({ label = "Caricamento in corso", cards = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="app-skeleton h-9 w-52" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="app-card app-card--md space-y-3" aria-hidden>
            <div className="app-skeleton h-5 w-2/3" />
            <div className="app-skeleton h-4 w-full" />
            <div className="app-skeleton h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
