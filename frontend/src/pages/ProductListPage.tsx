import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Product } from "../types";

export function ProductListPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data.products);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];
    const q = search.toLowerCase();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);
    if (inStockOnly) result = result.filter((p) => p.stock > 0);
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, search, sort, priceMin, priceMax, inStockOnly]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="hidden lg:block w-60 shrink-0 space-y-4">
            <div className="h-10 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
            <div className="h-8 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
            <div className="h-8 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
            <div className="h-8 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-8 w-32 bg-[var(--color-bg-subtle)] rounded animate-pulse mb-6" />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                  <div className="h-44 bg-[var(--color-bg-subtle)] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[var(--color-bg-subtle)] rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-[var(--color-bg-subtle)] rounded animate-pulse w-1/2" />
                    <div className="h-5 bg-[var(--color-bg-subtle)] rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Search</h3>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Price Range</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] placeholder:text-[var(--color-text-muted)]"
                />
                <span className="text-[var(--color-text-muted)] text-sm">-</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Stock Status</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[var(--color-border-strong)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]/20"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">In Stock Only</span>
              </label>
            </div>

            <button
              onClick={() => { setSearch(""); setPriceMin(""); setPriceMax(""); setInStockOnly(false); }}
              className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Products</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{filtered.length} products found</p>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm bg-[var(--color-bg-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <use href="#icon-package" />
                </svg>
              </div>
              <p className="text-[var(--color-text-secondary)] font-medium">No products found</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card hover className="h-full overflow-hidden">
                    <div className="h-44 bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-border)] flex items-center justify-center relative">
                      <svg className="w-12 h-12 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <use href="#icon-package" />
                      </svg>
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge variant="warning" size="sm" className="absolute top-2 right-2">Low Stock</Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge variant="danger" size="sm" className="absolute top-2 right-2">Out of Stock</Badge>
                      )}
                      {product.stock > 5 && (
                        <Badge variant="success" size="sm" className="absolute top-2 right-2">In Stock</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[var(--color-text)] text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{product.store?.name}</p>
                      <p className="text-base font-bold text-[var(--color-primary-600)] mt-2">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-text-muted)]">Stock: {product.stock}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
