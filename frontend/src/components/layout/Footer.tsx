export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-card)] border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} SEAPEDIA. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">A multi-role marketplace experience</p>
        </div>
      </div>
    </footer>
  );
}
