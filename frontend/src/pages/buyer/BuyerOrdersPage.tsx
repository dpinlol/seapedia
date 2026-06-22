import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import api from "../../services/api";

const statusLabels: Record<string, string> = {
  SEDANG_DIKEMAS: "Sedang Dikemas",
  MENUNGGU_PENGIRIM: "Menunggu Pengirim",
  SEDANG_DIKIRIM: "Sedang Dikirim",
  PESANAN_SELESAI: "Pesanan Selesai",
  DIKEMBALIKAN: "Dikembalikan",
};

export function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/buyer").then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No orders yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">Order #{order.id.slice(0, 8)}</p>
                    <Badge variant={
                      order.status === "PESANAN_SELESAI" ? "success" :
                      order.status === "DIKEMBALIKAN" ? "danger" :
                      order.status === "SEDANG_DIKIRIM" ? "primary" :
                      "warning"
                    }>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">{order.store?.name} &middot; {order.items?.length} items</span>
                    <span className="font-medium text-[var(--color-text)]">Rp {order.finalTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
