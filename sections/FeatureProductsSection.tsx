"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
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

  const isSkeleton = products.length === 0;

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
        {isSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <article
                key={i}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] select-none"
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--muted)] flex flex-col items-center justify-center p-4 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--muted-foreground)] shadow-xs mb-2">
                    <Plus className="size-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--muted-foreground)]">
                    Add your product {i + 1}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
                  <div className="hidden h-2.5 w-16 bg-[var(--muted)] rounded sm:block" />
                  <div className="h-4 w-3/4 bg-[var(--muted)] rounded" />
                  <div className="h-4 w-20 bg-[var(--muted)] rounded" />

                  <div className="mt-auto flex items-stretch gap-2 pt-1">
                    <div className="h-10 flex-1 rounded-[var(--theme-btn-radius)] bg-[var(--muted)]" />
                    <div className="size-10 rounded-[var(--theme-btn-radius)] bg-[var(--muted)] shrink-0" />
                  </div>
                </div>
              </article>
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
