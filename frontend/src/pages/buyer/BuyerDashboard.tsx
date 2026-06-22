import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import api from "../../services/api";

export function BuyerDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/wallet/balance")
      .then((res) => {
        setBalance(res.data.balance);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Buyer Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your shopping, orders, and wallet
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon="wallet"
          label="Wallet Balance"
          value={`Rp ${(balance ?? 0).toLocaleString("id-ID")}`}
          color="blue"
          loading={loading}
        />
        <Link to="/buyer/cart" className="block">
          <StatsCard
            icon="shopping-cart"
            label="Your Cart"
            value="View Cart"
            color="purple"
          />
        </Link>
        <Link to="/buyer/orders" className="block">
          <StatsCard
            icon="package"
            label="Your Orders"
            value="View Orders"
            color="green"
          />
        </Link>
      </div>

      <div className="flex gap-3">
        <Link to="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
        <Link to="/buyer/wallet">
          <Button variant="outline">Top Up Wallet</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
