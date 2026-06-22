import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
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

export function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get("/orders/seller").then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleProcess = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/process`);
      fetchOrders();
    } catch {}
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Incoming Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No incoming orders.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-[var(--color-text-secondary)]">Order #{order.id.slice(0, 8)}</p>
                      <Badge variant={
                        order.status === "PESANAN_SELESAI" ? "success" :
                        order.status === "MENUNGGU_PENGIRIM" ? "primary" :
                        "warning"
                      }>{statusLabels[order.status]}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Buyer: {order.buyer?.user?.username} &middot; {order.items?.length} items
                    </p>
                    <div className="text-sm text-[var(--color-text-muted)] mt-1">
                      {order.items?.map((item: any) => (
                        <span key={item.id} className="mr-3">{item.productName} x{item.quantity}</span>
                      ))}
                    </div>
                    <p className="font-medium mt-1">Rp {order.finalTotal.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {order.status === "SEDANG_DIKEMAS" && (
                      <Button size="sm" onClick={() => handleProcess(order.id)}>Process Order</Button>
                    )}
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">Detail</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
