interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-[var(--color-text-muted)] mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
