import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

const deliveryMethods = [
  { value: "INSTANT", label: "Instant", fee: 25000, eta: "1-3 hours" },
  { value: "NEXT_DAY", label: "Next Day", fee: 10000, eta: "Next day" },
  { value: "REGULAR", label: "Regular", fee: 5000, eta: "3-5 days" },
];

export function BuyerCheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const [deliveryMethod, setDeliveryMethod] = useState("REGULAR");
  const [voucherCode, setVoucherCode] = useState("");
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/cart"),
      api.get("/wallet/balance"),
      api.get("/addresses"),
    ]).then(([c, b, a]) => {
      setCart(c.data.cart);
      setBalance(b.data.balance);
      setAddresses(a.data.addresses);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const subtotal = cart?.items?.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) || 0;
  const deliveryFee = deliveryMethods.find((d) => d.value === deliveryMethod)?.fee || 0;
  const discount = 0; // Will be calculated by backend
  const ppn = subtotal * 0.12;
  const finalTotal = subtotal + deliveryFee + ppn;

  const handleCheckout = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/orders/checkout", {
        deliveryMethod,
        voucherCode: voucherCode || undefined,
        promoCode: promoCode || undefined,
      });
      setSuccess(res.data.order);
    } catch (err: any) {
      setError(err.response?.data?.error || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <Card className="max-w-lg mx-auto">
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 bg-[var(--color-success)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Order Placed!</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Order #{success.id.slice(0, 8)}</p>
            <div className="space-y-2 text-sm text-left mb-6">
              <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Subtotal</span><span className="text-[var(--color-text)]">Rp {success.subtotal.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Delivery Fee</span><span className="text-[var(--color-text)]">Rp {success.deliveryFee.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">PPN 12%</span><span className="text-[var(--color-text)]">Rp {success.ppn.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between font-bold"><span className="text-[var(--color-text)]">Total Paid</span><span className="text-[var(--color-text)]">Rp {success.finalTotal.toLocaleString("id-ID")}</span></div>
            </div>
            <Button onClick={() => navigate("/buyer/orders")}>View Orders</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return <DashboardLayout><div className="animate-pulse h-96 bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)]" /></DashboardLayout>;
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <DashboardLayout>
        <Card><CardContent className="text-center py-8">
          <p className="text-[var(--color-text-muted)]">Your cart is empty</p>
          <Button className="mt-4" onClick={() => navigate("/products")}>Browse Products</Button>
        </CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Delivery Method</h2></CardHeader>
            <CardContent className="space-y-3">
              {deliveryMethods.map((dm) => (
                <label key={dm.value} className={`flex items-center justify-between p-3 border rounded-[var(--radius-lg)] cursor-pointer transition-colors ${deliveryMethod === dm.value ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]" : "border-[var(--color-border)] hover:border-[var(--color-primary-300)]"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="delivery" value={dm.value} checked={deliveryMethod === dm.value} onChange={() => setDeliveryMethod(dm.value)} className="accent-[var(--color-primary-600)]" />
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{dm.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{dm.eta}</p>
                    </div>
                  </div>
                  <p className="font-medium text-[var(--color-text)]">Rp {dm.fee.toLocaleString("id-ID")}</p>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold text-[var(--color-text)]">Discount Codes</h2></CardHeader>
            <CardContent className="space-y-3">
              <Input label="Voucher Code" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Enter voucher code" />
              <Input label="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter promo code" />
              <p className="text-xs text-[var(--color-text-muted)]">Vouchers and promos are validated by the backend during checkout.</p>
            </CardContent>
          </Card>

          {addresses.length > 0 && (
            <Card>
              <CardHeader><h2 className="font-semibold">Shipping Address</h2></CardHeader>
              <CardContent>
                {addresses.filter((a) => a.isDefault).map((addr) => (
                  <div key={addr.id}>
                    <p className="font-medium text-[var(--color-text)]">{addr.label}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{addr.address}, {addr.city}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{addr.phone}</p>
                  </div>
                ))}
                {addresses.filter((a) => !a.isDefault).length > 0 && !addresses.find((a) => a.isDefault) && (
                  <p className="text-sm text-gray-500">{addresses[0].address}, {addresses[0].city}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
              <div className="px-6 py-5 border-b border-[var(--color-border)]">
                <h2 className="font-semibold text-[var(--color-text)]">Order Summary</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="space-y-2 text-sm">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] truncate">{item.product.name} x{item.quantity}</span>
                      <span className="text-[var(--color-text)]">Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-[var(--color-border)]" />
                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-secondary)]">Subtotal</span><span className="text-[var(--color-text)]">Rp {subtotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-secondary)]">Delivery Fee</span><span className="text-[var(--color-text)]">Rp {deliveryFee.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-secondary)]">PPN 12%</span><span className="text-[var(--color-text)]">Rp {ppn.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between font-bold text-base"><span className="text-[var(--color-text)]">Total</span><span className="text-[var(--color-text)]">Rp {finalTotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-muted)]">Balance</span><span className={balance >= finalTotal ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>Rp {balance.toLocaleString("id-ID")}</span></div>
                {balance < finalTotal && <p className="text-xs text-[var(--color-danger)]">Insufficient balance. Please top up.</p>}
                {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
                <Button className="w-full" onClick={handleCheckout} loading={submitting} disabled={balance < finalTotal}>
                  Place Order
                </Button>
              </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
