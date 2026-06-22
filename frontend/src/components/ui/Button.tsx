interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.97]";
  const variants: Record<string, string> = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 shadow-[0_1px_2px_rgba(99,102,241,0.15)] hover:shadow-[0_2px_8px_rgba(99,102,241,0.25)]",
    secondary:
      "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 focus:ring-surface-300",
    outline:
      "border border-surface-300 text-surface-700 hover:bg-surface-50 hover:border-surface-400 active:bg-surface-100 focus:ring-surface-300",
    ghost:
      "text-surface-600 hover:bg-surface-100 hover:text-surface-800 active:bg-surface-200 focus:ring-surface-300",
    danger:
      "bg-danger text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-[0_1px_2px_rgba(220,38,38,0.15)] hover:shadow-[0_2px_8px_rgba(220,38,38,0.25)]",
    success:
      "bg-success text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-[0_1px_2px_rgba(5,150,105,0.15)] hover:shadow-[0_2px_8px_rgba(5,150,105,0.25)]",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-5 py-3 text-sm gap-2 rounded-xl",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
