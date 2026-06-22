import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import api from "../../services/api";

export function BuyerAddressPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "", address: "", city: "", phone: "", isDefault: false });

  const fetchAddresses = () => {
    api.get("/addresses").then((res) => {
      setAddresses(res.data.addresses);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const resetForm = () => {
    setForm({ label: "", address: "", city: "", phone: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (addr: any) => {
    setForm({ label: addr.label, address: addr.address, city: addr.city, phone: addr.phone, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
      } else {
        await api.post("/addresses", form);
      }
      resetForm();
      fetchAddresses();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await api.delete(`/addresses/${id}`);
    fetchAddresses();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">My Addresses</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>Add Address</Button>}
      </div>

      {showForm && (
        <Card className="max-w-lg mb-6">
          <CardHeader><h2 className="font-semibold">{editingId ? "Edit Address" : "New Address"}</h2></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home, Office" required />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>{editingId ? "Update" : "Save"}</Button>
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : addresses.length === 0 ? (
        <Card><CardContent className="text-center py-8"><p className="text-[var(--color-text-muted)]">No addresses saved yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[var(--color-text)]">
                    {addr.label}
                    {addr.isDefault && <Badge variant="primary" size="sm" className="ml-2">Default</Badge>}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{addr.address}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{addr.city} &middot; {addr.phone}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(addr)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(addr.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
