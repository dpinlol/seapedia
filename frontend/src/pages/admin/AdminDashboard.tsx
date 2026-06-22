import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import api from "../../services/api";

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/monitoring")
      .then((res) => {
        setData(res.data.monitoring);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        { label: "Users", value: data.users, icon: "users", color: "blue" as const },
        { label: "Stores", value: data.stores, icon: "store", color: "green" as const },
        { label: "Products", value: data.products, icon: "package", color: "purple" as const },
        { label: "Orders", value: data.orders, icon: "shopping-cart", color: "orange" as const },
        { label: "Vouchers", value: data.vouchers, icon: "tag", color: "teal" as const },
        { label: "Promos", value: data.promos, icon: "percent", color: "red" as const },
        { label: "Delivery Jobs", value: data.deliveryJobs, icon: "truck", color: "blue" as const },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Admin Overview</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Platform-wide monitoring and management
        </p>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatsCard key={i} icon="layout-dashboard" label="" value="" loading />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
