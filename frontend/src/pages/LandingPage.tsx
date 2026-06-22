import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ApplicationReview, Product } from "../types";

const categories = [
  { name: "Electronics", icon: "device-mobile" },
  { name: "Fashion", icon: "tag" },
  { name: "Home & Living", icon: "home" },
  { name: "Food & Beverages", icon: "cake" },
  { name: "Sports", icon: "truck" },
  { name: "Books", icon: "book-open" },
  { name: "Automotive", icon: "truck" },
  { name: "Health", icon: "heart" },
];

const features = [
  {
    icon: "shopping-cart",
    title: "Multi-Role Marketplace",
    desc: "Buy, sell, or deliver — all in one platform with dedicated experiences for every role.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: "truck",
    title: "Flexible Delivery",
    desc: "Choose from Instant, Next Day, or Regular delivery with real-time SLA tracking.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: "wallet",
    title: "Wallet Payments",
    desc: "Wallet-based system with PPN 12% calculation and discount code support.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: "shield-check",
    title: "Secure Transactions",
    desc: "Every transaction is protected with end-to-end encryption and fraud detection.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up as a buyer, seller, or driver in seconds." },
  { num: "02", title: "Browse & Order", desc: "Discover products from trusted sellers across Indonesia." },
  { num: "03", title: "Fast Delivery", desc: "Get your order delivered with real-time tracking and SLA guarantees." },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/reviews").then((res) => setReviews(res.data.reviews));
    api.get("/products").then((res) => setProducts(res.data.products));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface-900)] via-[var(--color-surface-800)] to-[var(--color-primary-900)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Welcome to{" "}
              <span className="text-[var(--color-primary-300)]">SEAPEDIA</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--color-surface-300)] max-w-2xl mx-auto leading-relaxed">
              The marketplace that connects sellers, buyers, and delivery drivers in one seamless experience.
            </p>
            <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-surface-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 text-sm bg-white/10 text-white placeholder-[var(--color-surface-400)] backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]/50"
                />
              </div>
            </form>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/products">
                <Button size="lg" className="!bg-white !text-[var(--color-surface-900)] hover:!bg-[var(--color-surface-100)] shadow-lg">
                  Browse Products
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="!border-white/30 !text-white hover:!bg-white/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-lg p-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?q=${encodeURIComponent(cat.name.toLowerCase())}`}
                className="px-4 py-2 rounded-xl bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)] hover:border-[var(--color-primary-200)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Featured Products</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Discover what's trending</p>
            </div>
            <Link to="/products" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              View All &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card hover className="h-full overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-border)] flex items-center justify-center relative">
                    <svg className="w-12 h-12 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <use href="#icon-package" />
                    </svg>
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge variant="warning" size="sm" className="absolute top-2 right-2">
                        Low Stock
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge variant="danger" size="sm" className="absolute top-2 right-2">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--color-text)] text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{product.store?.name}</p>
                    <p className="text-base font-bold text-[var(--color-primary-600)] mt-2">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-[var(--color-bg-subtle)] border-y border-[var(--color-border)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">How It Works</h2>
            <p className="mt-3 text-[var(--color-text-secondary)] max-w-xl mx-auto">Get started in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.num} padding="lg" className="relative text-center">
                <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.num}
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Why SEAPEDIA?</h2>
          <p className="mt-3 text-[var(--color-text-secondary)] max-w-xl mx-auto">Everything you need in one platform, built for every role.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Card key={f.title} padding="lg" hover>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <svg className={`w-6 h-6 ${f.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <use href={`#icon-${f.icon}`} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-[var(--color-bg-subtle)] border-y border-[var(--color-border)] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">What People Say</h2>
              <p className="mt-3 text-[var(--color-text-secondary)] max-w-xl mx-auto">Hear from our community of buyers, sellers, and drivers.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <Card key={review.id} padding="lg">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "text-[var(--color-warning)]" : "text-[var(--color-border-strong)]"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">— {review.reviewerName}</p>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/reviews">
                <Button variant="outline">Write a Review</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">Join SEAPEDIA today and be part of our growing marketplace community.</p>
          <Link to="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
