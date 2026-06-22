import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

export function BuyerCartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = () => {
    api.get("/cart").then((res) => {
      setCart(res.data.cart);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (productId: string) => {
    try {
      await api.post("/cart/add", { productId, quantity: 1 });
      fetchCart();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add item");
    }
  };

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/item/${itemId}`, { quantity });
      fetchCart();
    } catch {}
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this item?")) return;
    await api.delete(`/cart/item/${itemId}`);
    fetchCart();
  };

  const subtotal = cart?.items?.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) || 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Shopping Cart</h1>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm p-3 rounded-lg mb-4 border border-[var(--color-danger)]/20">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] animate-pulse" />)}
        </div>
      ) : !cart || cart.items?.length === 0 ? (
        <Card><CardContent className="text-center py-12">
          <p className="text-[var(--color-text-muted)] mb-4">Your cart is empty</p>
          <Button onClick={() => navigate("/products")}>Start Shopping</Button>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-[var(--color-text-muted)] mb-2">
              <span className="font-medium">Store:</span> {cart.storeName}
              <span className="ml-4 px-2 py-0.5 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded font-medium">Single-store checkout</span>
            </div>
            {cart.items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-text)]">{item.product.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Rp {item.product.price.toLocaleString("id-ID")} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-sm text-[var(--color-text)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors"
                      >+</button>
                    </div>
                    <p className="w-24 text-right font-medium text-[var(--color-text)]">
                      Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                    <button onClick={() => removeItem(item.id)} className="text-[var(--color-danger)] text-sm hover:underline cursor-pointer">
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card padding="md">
              <h2 className="font-semibold text-[var(--color-text)] mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Items</span>
                  <span className="text-[var(--color-text)]">{cart.items?.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                  <span className="font-medium text-[var(--color-text)]">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <Button className="w-full" onClick={() => navigate("/buyer/checkout")}>
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
