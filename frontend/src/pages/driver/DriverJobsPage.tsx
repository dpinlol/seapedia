import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import api from "../../services/api";

const deliveryLabels: Record<string, string> = {
  INSTANT: "Instant",
  NEXT_DAY: "Next Day",
  REGULAR: "Regular",
};

export function DriverJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = () => {
    api.get("/delivery/available").then((res) => {
      setJobs(res.data.jobs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleTake = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await api.post(`/delivery/${jobId}/take`);
      fetchJobs();
    } catch {} finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Available Jobs</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No available jobs right now.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Order #{job.orderId.slice(0, 8)}</p>
                    <p className="font-medium text-[var(--color-text)]">{job.order.store?.name}</p>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {job.order.items?.map((item: any) => (
                        <span key={item.id} className="mr-2">{item.productName} x{item.quantity}</span>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {deliveryLabels[job.order.deliveryMethod] || job.order.deliveryMethod} &middot;
                      Fee: Rp {job.order.deliveryFee.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTake(job.id)}
                    loading={actionLoading === job.id}
                  >
                    Take Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
