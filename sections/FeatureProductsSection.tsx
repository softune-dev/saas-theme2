"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import type { Product } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";

export function FeatureProductsSection({
  products: allProducts,
}: {
  products: Product[];
}) {
  const { settings } = useTheme();
  const selectedIds = settings.selectedProductIds ?? [];
  // Editor may ship product ids from another template/site. Resolve against
  // this catalog; if none match, fall back to featured (or first 8) — not empty.
  const fromSettings = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const featured = allProducts.filter((p) => p.featured).slice(0, 8);
  const fallback =
    featured.length > 0 ? featured : allProducts.slice(0, 8);
  const products = fromSettings.length > 0 ? fromSettings : fallback;

  // Empty catalog is a real state — never invent sample products.
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          {settings.featureProductsTitle || "Best Sellers"}
        </h2>
        <Link
          href="/shop?filter=featured"
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
