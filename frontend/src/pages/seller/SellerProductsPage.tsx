import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";
import { Product } from "../../types";

export function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const fetchProducts = () => {
    api.get("/stores/me").then((res) => {
      setProducts(res.data.store.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "" });
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">My Products</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>Add Product</Button>}
      </div>

      {showForm && (
        <Card className="max-w-lg mb-6">
          <CardHeader>
            <h2 className="font-semibold">{editingId ? "Edit Product" : "New Product"}</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
              <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--color-text)]">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg-card)] text-[var(--color-text)]"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (Rp)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={0} />
                <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min={0} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"}</Button>
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-[var(--color-text-muted)]">No products yet. Add your first product!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--color-text)]">{product.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Rp {product.price.toLocaleString("id-ID")} &middot; Stock: {product.stock}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(product)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
