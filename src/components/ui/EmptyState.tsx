import type { ReactNode } from "react";
import { AppCard } from "./AppCard";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <AppCard className="app-empty-state" padding="lg">
      <span className="app-empty-state__icon" aria-hidden>{icon}</span>
      <h2 className="app-empty-state__title">{title}</h2>
      <p className="app-empty-state__description">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </AppCard>
  );
}
