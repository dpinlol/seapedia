import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import api from "../services/api";

const statusLabels: Record<string, string> = {
  SEDANG_DIKEMAS: "Sedang Dikemas",
  MENUNGGU_PENGIRIM: "Menunggu Pengirim",
  SEDANG_DIKIRIM: "Sedang Dikirim",
  PESANAN_SELESAI: "Pesanan Selesai",
  DIKEMBALIKAN: "Dikembalikan",
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.order);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse h-64 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-[var(--color-text-muted)]">Order not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">&larr; Back</Button>

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{order.store?.name}</p>
          </div>
          <Badge variant={
            order.status === "PESANAN_SELESAI" ? "success" :
            order.status === "DIKEMBALIKAN" ? "danger" :
            order.status === "SEDANG_DIKIRIM" ? "primary" :
            "warning"
          }>
            {statusLabels[order.status] || order.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">{item.productName} x{item.quantity}</span>
                <span className="text-[var(--color-text)]">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Subtotal</span><span className="text-[var(--color-text)]">Rp {order.subtotal.toLocaleString("id-ID")}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Discount</span><span className="text-[var(--color-success)]">-Rp {order.discountAmount.toLocaleString("id-ID")}</span></div>}
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Delivery Fee</span><span className="text-[var(--color-text)]">Rp {order.deliveryFee.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">PPN 12%</span><span className="text-[var(--color-text)]">Rp {order.ppn.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between font-bold text-base"><span className="text-[var(--color-text)]">Total</span><span className="text-[var(--color-text)]">Rp {order.finalTotal.toLocaleString("id-ID")}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold text-[var(--color-text)]">Status Timeline</h2></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.statusHistory.map((h: any) => (
              <div key={h.id} className="flex gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{statusLabels[h.status] || h.status}</p>
                    {h.note && <p className="text-xs text-[var(--color-text-secondary)]">{h.note}</p>}
                    <p className="text-xs text-[var(--color-text-muted)]">{new Date(h.timestamp).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
