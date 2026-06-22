import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import api from "../../services/api";

export function DriverHistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/delivery/my-jobs"),
      api.get("/delivery/earnings"),
    ]).then(([j, e]) => {
      setJobs(j.data.jobs);
      setEarnings(e.data.earnings);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">My Jobs</h1>

      {!loading && earnings && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card padding="lg">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Jobs</p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{jobs.length}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-[var(--color-text-secondary)]">Completed</p>
            <p className="text-2xl font-bold text-[var(--color-success)] mt-1">{earnings.totalJobs}</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Earnings</p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">Rp {earnings.totalEarnings.toLocaleString("id-ID")}</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No jobs yet.</p></CardContent></Card>
      ) : (
        <Card>
          <CardHeader><h2 className="font-semibold text-[var(--color-text)]">Job History</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Order #{job.orderId.slice(0, 8)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{job.order.store?.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      job.status === "COMPLETED" ? "success" :
                      job.status === "IN_PROGRESS" ? "primary" :
                      "default"
                    } size="sm">{job.status}</Badge>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Fee: Rp {job.order.deliveryFee.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
