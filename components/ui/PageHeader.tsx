import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
