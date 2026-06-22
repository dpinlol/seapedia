import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";
import { Store } from "../../types";

export function SellerStorePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchStore = () => {
    api.get("/stores/me").then((res) => {
      setStore(res.data.store);
      setName(res.data.store.name);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchStore(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/stores", { name });
      setStore(res.data.store);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create store");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/stores", { name });
      setStore({ ...store!, name: res.data.store.name });
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update store");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse h-48 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)]" />
      </DashboardLayout>
    );
  }

  if (!store && !editing) {
    return (
      <DashboardLayout>
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Create Your Store</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Set up your store to start selling products on SEAPEDIA.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
              <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Toko Serba Ada" />
              <Button type="submit" loading={saving} className="w-full">Create Store</Button>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">My Store</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Manage your store profile</p>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => { setName(store!.name); setEditing(true); }}>Edit</Button>
            )}
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Store Name</p>
                  <p className="font-medium text-[var(--color-text)]">{store?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Products</p>
                  <p className="font-medium text-[var(--color-text)]">{store?.products?.length || 0}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="flex gap-2">
                  <Button type="submit" loading={saving}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => { setName(store!.name); setEditing(false); setError(""); }}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
