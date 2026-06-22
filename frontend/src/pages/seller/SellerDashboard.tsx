import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Card, CardContent } from "../../components/ui/Card";
import api from "../../services/api";

export function SellerDashboard() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stores/me")
      .then((res) => {
        setStore(res.data.store);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const productCount = store?.products?.length ?? 0;
  const totalStock =
    store?.products?.reduce((sum: number, p: any) => sum + p.stock, 0) ?? 0;
  const avgPrice =
    productCount > 0
      ? store.products.reduce((sum: number, p: any) => sum + p.price, 0) /
        productCount
      : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Seller Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your store, products, and orders
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon="package"
          label="Products"
          value={productCount}
          color="blue"
          loading={loading}
        />
        <StatsCard
          icon="package"
          label="Total Stock"
          value={totalStock}
          color="green"
          loading={loading}
        />
        <StatsCard
          icon="trending-up"
          label="Avg Price"
          value={`Rp ${avgPrice.toLocaleString("id-ID")}`}
          color="purple"
          loading={loading}
        />
      </div>

      {store && (
        <Card className="max-w-md">
          <CardContent>
            <p className="text-sm text-[var(--color-text-secondary)]">Store</p>
            <p className="text-lg font-semibold text-[var(--color-text)] mt-0.5">
              {store.name}
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
