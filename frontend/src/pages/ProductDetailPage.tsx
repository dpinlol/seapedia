import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getToken, getStoredUser } from "../store/auth";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Product } from "../types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const user = getStoredUser();
  const isLoggedIn = !!getToken() && !!user;

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data.product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setAdding(true);
    try {
      await api.post("/cart/add", { productId: id, quantity });
      setAdded(true);
    } catch {} finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-[var(--color-bg-subtle)] rounded" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="h-96 bg-[var(--color-bg-subtle)] rounded-xl" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 w-20 bg-[var(--color-bg-subtle)] rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-[var(--color-bg-subtle)] rounded" />
              <div className="h-5 w-1/4 bg-[var(--color-bg-subtle)] rounded" />
              <div className="h-10 w-1/3 bg-[var(--color-bg-subtle)] rounded" />
              <div className="h-24 bg-[var(--color-bg-subtle)] rounded" />
              <div className="h-12 w-full bg-[var(--color-bg-subtle)] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <use href="#icon-alert-circle" />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)] font-medium">Product not found</p>
        <Link to="/products" className="text-[var(--color-primary-600)] text-sm mt-2 inline-block hover:underline">&larr; Back to products</Link>
      </div>
    );
  }

  const stockLabel = product.stock === 0 ? "Out of Stock" : product.stock <= 5 ? "Low Stock" : "In Stock";
  const stockBadgeVariant = product.stock === 0 ? "danger" : product.stock <= 5 ? "warning" : "success";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Image Gallery */}
        <div>
          <div className="h-80 md:h-96 bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-border)] rounded-xl flex items-center justify-center relative">
            <svg className="w-24 h-24 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <use href="#icon-package" />
            </svg>
          </div>
          <div className="flex gap-3 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-lg bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-border)] flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-[var(--color-primary-400)] transition-colors">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <use href="#icon-package" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Purchase Panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{product.name}</h1>
            <Badge variant={stockBadgeVariant} size="sm">{stockLabel}</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">
            Sold by{" "}
            <Link to={`/stores/${product.storeId}`} className="text-[var(--color-primary-600)] hover:underline font-medium">
              {product.store?.name}
            </Link>
          </p>
          <p className="text-3xl font-bold text-[var(--color-primary-600)] mt-3 mb-5">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 border-t border-[var(--color-border)] pt-5">
            {product.description}
          </p>

          <div className="space-y-4">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--color-text)]">Quantity</span>
              <div className="flex items-center border border-[var(--color-border-strong)] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-sm hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium text-[var(--color-text)] border-x border-[var(--color-border-strong)] min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 text-sm hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            {added ? (
              <div className="flex gap-3">
                <Button variant="success" className="flex-1" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Added to Cart
                </Button>
                <Button variant="outline" onClick={() => navigate("/buyer/cart")}>
                  View Cart
                </Button>
              </div>
            ) : (
              <Button onClick={handleAddToCart} loading={adding} className="w-full" disabled={product.stock === 0} size="lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {product.stock === 0 ? "Out of Stock" : isLoggedIn ? "Add to Cart" : "Login to Add to Cart"}
              </Button>
            )}

            <p className="text-xs text-[var(--color-text-muted)] text-center">
              Free shipping on orders over Rp 100,000
            </p>
          </div>

          {/* Product Info Sections */}
          <div className="mt-8 space-y-3 border-t border-[var(--color-border)] pt-6">
            <Card padding="md" className="flex items-center gap-4">
              <svg className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Product Details</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Dimensions, weight, and materials</p>
              </div>
            </Card>
            <Card padding="md" className="flex items-center gap-4">
              <svg className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Shipping Info</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Delivery estimates and shipping fees</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
