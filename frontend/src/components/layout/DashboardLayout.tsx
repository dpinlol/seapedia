import { Link, useNavigate, useLocation } from "react-router-dom";
import { getStoredUser, clearToken } from "../../store/auth";
import { Role } from "../../types";

const navItems: Record<Role, { label: string; path: string }[]> = {
  ADMIN: [
    { label: "Overview", path: "/admin/dashboard" },
    { label: "Vouchers", path: "/admin/vouchers" },
    { label: "Promos", path: "/admin/promos" },
    { label: "Overdue", path: "/admin/overdue" },
  ],
  SELLER: [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Store", path: "/seller/store" },
    { label: "Products", path: "/seller/products" },
    { label: "Orders", path: "/seller/orders" },
    { label: "Income", path: "/seller/income" },
  ],
  BUYER: [
    { label: "Products", path: "/products" },
    { label: "Cart", path: "/buyer/cart" },
    { label: "Orders", path: "/buyer/orders" },
    { label: "Spending", path: "/buyer/spending" },
    { label: "Wallet", path: "/buyer/wallet" },
    { label: "Addresses", path: "/buyer/addresses" },
  ],
  DRIVER: [
    { label: "Dashboard", path: "/driver/dashboard" },
    { label: "Find Jobs", path: "/driver/jobs" },
    { label: "History", path: "/driver/history" },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.activeRole || user?.roles[0];

  if (!user || !role) {
    navigate("/login");
    return null;
  }

  const items = navItems[role as Role] || [];

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      <aside className="w-64 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] hidden md:flex md:flex-col">
        <div className="p-5 border-b border-[var(--color-border)]">
          <Link to="/" className="text-lg font-bold text-[var(--color-primary-600)] tracking-tight">SEAPEDIA</Link>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 capitalize">{role?.toLowerCase()} dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] flex justify-around py-2 z-50">
        {items.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-xs px-2 py-1 rounded ${
              location.pathname === item.path ? "text-[var(--color-primary-600)] font-medium bg-[var(--color-primary-50)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="text-xs px-2 py-1 rounded text-[var(--color-text-muted)]"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
