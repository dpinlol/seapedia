import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

export function BuyerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchData = () => {
    Promise.all([
      api.get("/wallet/balance"),
      api.get("/wallet/transactions"),
    ]).then(([bal, tx]) => {
      setBalance(bal.data.balance);
      setTransactions(tx.data.transactions);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpLoading(true);
    try {
      const res = await api.post("/wallet/topup", { amount: parseFloat(amount) });
      setBalance(res.data.balance);
      setAmount("");
      fetchData();
    } catch {} finally {
      setTopUpLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Wallet</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card padding="md">
          <h2 className="font-semibold text-[var(--color-text)] mb-3">Balance</h2>
          {loading ? (
            <div className="h-10 w-32 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-[var(--color-primary-600)]">Rp {balance.toLocaleString("id-ID")}</p>
          )}
        </Card>

        <Card padding="md">
          <h2 className="font-semibold text-[var(--color-text)] mb-3">Top Up</h2>
          <form onSubmit={handleTopUp} className="flex gap-2">
            <Input type="number" min={1000} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
            <Button type="submit" loading={topUpLoading} className="shrink-0">Top Up</Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold text-[var(--color-text)]">Transaction History</h2></CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{tx.description}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{new Date(tx.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className={`text-sm font-medium ${tx.amount > 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    {tx.amount > 0 ? "+" : ""}Rp {tx.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
