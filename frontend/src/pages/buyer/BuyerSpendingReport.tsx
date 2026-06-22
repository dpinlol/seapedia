import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

export function BuyerSpendingReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/reports/buyer-spending").then((res) => {
      setReport(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Spending Report</h1>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : report ? (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card padding="lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Total Orders</p>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{report.report.totalOrders}</p>
            </Card>
            <Card padding="lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Total Spent</p>
              <p className="text-2xl font-bold text-[var(--color-text)] mt-1">Rp {report.report.totalSpent.toLocaleString("id-ID")}</p>
            </Card>
            <Card padding="lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Total Discounts</p>
              <p className="text-2xl font-bold text-[var(--color-success)] mt-1">Rp {report.report.totalDiscounts.toLocaleString("id-ID")}</p>
            </Card>
          </div>

          <Card>
            <CardHeader><h2 className="font-semibold text-[var(--color-text)]">Order History</h2></CardHeader>
            <CardContent>
              {report.orders.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No orders.</p>
              ) : (
                <div className="space-y-2">
                  {report.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[var(--color-text)]">Rp {order.finalTotal.toLocaleString("id-ID")}</p>
                        {order.discountAmount > 0 && (
                          <p className="text-xs text-[var(--color-success)]">-Rp {order.discountAmount.toLocaleString("id-ID")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-[var(--color-text-muted)]">Failed to load report.</p>
      )}
    </DashboardLayout>
  );
}
