interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-[var(--color-bg-subtle)] text-[var(--color-text)]",
  primary: "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  accent: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
};

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  const sizes: Record<string, string> = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
