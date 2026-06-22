interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  onClick,
  hover = false,
  padding = "none",
}: CardProps) {
  const paddings: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] ${
        hover
          ? "hover:shadow-lg hover:border-[var(--color-border-strong)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          : "shadow-[var(--shadow-sm)]"
      } ${onClick ? "cursor-pointer" : ""} ${paddings[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-5 border-b border-[var(--color-border)] ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-5 border-t border-[var(--color-border)] ${className}`}>
      {children}
    </div>
  );
}
