import clsx from "clsx";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={clsx("app-page-header", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}
        <div className="flex items-center gap-3">
          {icon ? <span className="app-page-header__icon">{icon}</span> : null}
          <h1 className="app-page-title">{title}</h1>
        </div>
        {description ? <p className="app-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="app-page-actions">{actions}</div> : null}
    </header>
  );
}
