import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

export function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "PERCENTAGE", discountValue: "", expiryDate: "", maxUsage: "", minPurchase: "0",
  });

  const fetch = () => {
    api.get("/discounts/vouchers").then((res) => {
      setVouchers(res.data.vouchers);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/discounts/vouchers", {
        ...form,
        discountValue: parseFloat(form.discountValue),
        maxUsage: parseInt(form.maxUsage),
        minPurchase: parseFloat(form.minPurchase),
      });
      setShowForm(false);
      setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", expiryDate: "", maxUsage: "", minPurchase: "0" });
      fetch();
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Vouchers</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>Create Voucher</Button>}
      </div>

      {showForm && (
        <Card className="max-w-lg mb-6">
          <CardHeader><h2 className="font-semibold">New Voucher</h2></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              <div className="flex gap-2">
                <Button type="button" variant={form.discountType === "PERCENTAGE" ? "primary" : "outline"} size="sm" onClick={() => setForm({ ...form, discountType: "PERCENTAGE" })}>Percentage</Button>
                <Button type="button" variant={form.discountType === "FIXED" ? "primary" : "outline"} size="sm" onClick={() => setForm({ ...form, discountType: "FIXED" })}>Fixed</Button>
              </div>
              <Input label={form.discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount (Rp)"} type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
              <Input label="Expiry Date" type="datetime-local" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
              <Input label="Max Usage" type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} required />
              <Input label="Min Purchase (Rp)" type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>Create</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : vouchers.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No vouchers yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{v.code}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {v.discountType === "PERCENTAGE" ? `${v.discountValue}% off` : `Rp ${v.discountValue.toLocaleString("id-ID")} off`}
                    &middot; Used {v.currentUsage}/{v.maxUsage}
                    &middot; Min: Rp {v.minPurchase.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-[var(--color-text-secondary)]">Expires: {new Date(v.expiryDate).toLocaleDateString("id-ID")}</p>
                  <p className={new Date(v.expiryDate) < new Date() ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}>
                    {new Date(v.expiryDate) < new Date() ? "Expired" : "Active"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
