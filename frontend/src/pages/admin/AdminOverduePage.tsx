import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../services/api";

const statusConfig: Record<string, { label: string; variant: "warning" | "danger" | "primary" | "success" }> = {
  SEDANG_DIKEMAS: { label: "Sedang Dikemas", variant: "warning" },
  MENUNGGU_PENGIRIM: { label: "Menunggu Pengirim", variant: "primary" },
  SEDANG_DIKIRIM: { label: "Sedang Dikirim", variant: "primary" },
  PESANAN_SELESAI: { label: "Selesai", variant: "success" },
  DIKEMBALIKAN: { label: "Dikembalikan", variant: "danger" },
};

const deliveryLabels: Record<string, string> = {
  INSTANT: "Instant (1 day SLA)",
  NEXT_DAY: "Next Day (2 day SLA)",
  REGULAR: "Regular (5 day SLA)",
};

export function AdminOverduePage() {
  const [overdue, setOverdue] = useState<any[]>([]);
  const [simulatedDate, setSimulatedDate] = useState("");
  const [simDays, setSimDays] = useState("1");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState("");

  const fetchOverdue = () => {
    api.get("/admin/overdue").then((res) => {
      setOverdue(res.data.overdueOrders);
      setSimulatedDate(new Date(res.data.simulatedDate).toLocaleString("id-ID"));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOverdue(); }, []);

  const handleProcess = async () => {
    setProcessing(true);
    setResult("");
    try {
      const res = await api.post("/admin/overdue/process");
      setResult(res.data.message);
      fetchOverdue();
    } catch {} finally {
      setProcessing(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setResult("");
    try {
      const res = await api.post("/admin/simulate-day", { days: parseInt(simDays) });
      setResult(res.data.message);
      fetchOverdue();
    } catch {} finally {
      setSimulating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Overdue Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">Monitor and process SLA-breaching orders</p>
        </div>
        {simulatedDate && (
          <div className="text-xs text-text-muted bg-bg-subtle px-3 py-1.5 rounded-lg">
            Simulated: {simulatedDate}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card padding="md">
          <h2 className="text-sm font-semibold text-text mb-3">Simulate Time</h2>
          <div className="flex gap-2">
            <Input type="number" min={1} value={simDays} onChange={(e) => setSimDays(e.target.value)} placeholder="Days" />
            <Button onClick={handleSimulate} loading={simulating}>Simulate</Button>
          </div>
          <p className="text-xs text-text-muted mt-2">Advance the system clock to test overdue behavior.</p>
        </Card>

        <Card padding="md">
          <h2 className="text-sm font-semibold text-text mb-2">Process Overdue</h2>
          <p className="text-sm text-text-secondary mb-3">
            {overdue.length} overdue order(s) detected.
          </p>
          <Button onClick={handleProcess} loading={processing} variant="danger">
            Process Overdue Orders
          </Button>
          <p className="text-xs text-text-muted mt-2">Auto refund + restore stock + cancel delivery.</p>
        </Card>
      </div>

      {result && (
        <div className="bg-success/10 text-success text-sm p-3 rounded-lg mb-4 border border-success/20">
          {result}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" count={3} />
        </div>
      ) : overdue.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No overdue orders"
              description="Simulate time to test the overdue SLA system."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-text">Overdue Orders</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {overdue.map((order: any) => {
                const status = statusConfig[order.status] || { label: order.status, variant: "default" as const };
                return (
                  <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-bg-subtle/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.store?.name} &middot; {deliveryLabels[order.deliveryMethod] || order.deliveryMethod}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Created {new Date(order.createdAt).toLocaleDateString("id-ID")} &middot;
                        Deadline {new Date(order.deadline).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="text-xs text-text-secondary mt-1">Rp {order.finalTotal.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
