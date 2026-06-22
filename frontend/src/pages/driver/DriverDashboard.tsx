import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";

export function DriverDashboard() {
  const [available, setAvailable] = useState(0);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/delivery/available"),
      api.get("/delivery/earnings"),
    ])
      .then(([avail, earn]) => {
        setAvailable(avail.data.jobs.length);
        setEarnings(earn.data.earnings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          Driver Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Find delivery jobs and track your earnings
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon="truck"
          label="Available Jobs"
          value={available}
          color="blue"
          loading={loading}
        />
        <StatsCard
          icon="history"
          label="Completed Jobs"
          value={earnings?.totalJobs || 0}
          color="green"
          loading={loading}
        />
        <StatsCard
          icon="trending-up"
          label="Total Earnings"
          value={`Rp ${(earnings?.totalEarnings || 0).toLocaleString("id-ID")}`}
          color="purple"
          loading={loading}
        />
      </div>

      <div className="flex gap-3">
        <Link to="/driver/jobs">
          <Button variant="primary">Find Jobs</Button>
        </Link>
        <Link to="/driver/history">
          <Button variant="outline">My History</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
