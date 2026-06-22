interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "teal";
  loading?: boolean;
  extra?: string;
}

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: "bg-[var(--color-primary-50)]", text: "text-[var(--color-primary-700)]", icon: "text-[var(--color-primary-600)]" },
  green: { bg: "bg-[var(--color-success)]/10", text: "text-[var(--color-success)]", icon: "text-[var(--color-success)]" },
  purple: { bg: "bg-[var(--color-accent)]/10", text: "text-[var(--color-accent)]", icon: "text-[var(--color-accent)]" },
  orange: { bg: "bg-[var(--color-warning)]/10", text: "text-[var(--color-warning)]", icon: "text-[var(--color-warning)]" },
  red: { bg: "bg-[var(--color-danger)]/10", text: "text-[var(--color-danger)]", icon: "text-[var(--color-danger)]" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", icon: "text-teal-600" },
};

export function StatsCard({
  icon,
  label,
  value,
  color = "blue",
  loading,
  extra,
}: StatsCardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] animate-pulse">
        <div className="h-4 w-20 bg-[var(--color-bg-subtle)] rounded mb-3" />
        <div className="h-7 w-28 bg-[var(--color-bg-subtle)] rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--color-text-secondary)] font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <use href={`#icon-${icon}`} />
          </svg>
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      {extra && <p className="text-xs text-[var(--color-text-muted)] mt-1">{extra}</p>}
    </div>
  );
}
