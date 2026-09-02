"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { Product, ProductCategory } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";

function CategoryProductSlider({
  categoryId,
  categoryName,
  categorySlug,
  products,
}: {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  products: Product[];
}) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const categoryProducts = products.filter((p) => p.categoryId === categoryId);
  if (categoryProducts.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h3 className="min-w-0 text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          {categoryName}
        </h3>
        <Link
          href={`/shop?category=${encodeURIComponent(categorySlug)}`}
          className="shrink-0 text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex w-full cursor-grab gap-3 pb-1 active:cursor-grabbing">
          {categoryProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_30%] lg:flex-[0_0_22%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCategorySlider({ blockIdx }: { blockIdx: number }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
            <Plus className="size-3.5" strokeWidth={2} />
          </div>
          <h3 className="min-w-0 text-lg font-bold tracking-tight text-[var(--muted-foreground)] sm:text-xl">
            Add category {blockIdx + 1}
          </h3>
        </div>
        <span className="shrink-0 text-sm font-semibold text-[var(--muted-foreground)]">
          Add products
        </span>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex w-full cursor-grab gap-3 pb-1 active:cursor-grabbing">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_30%] lg:flex-[0_0_22%]"
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] select-none">
                <div className="relative aspect-square overflow-hidden bg-[var(--muted)] flex flex-col items-center justify-center p-4 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--muted-foreground)] shadow-xs mb-2">
                    <Plus className="size-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--muted-foreground)]">
                    Add product {i + 1}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="h-3.5 w-3/4 bg-[var(--muted)] rounded" />
                  <div className="h-3.5 w-16 bg-[var(--muted)] rounded" />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryShowcaseSection({
  categoryShowcaseTitle,
  categoryShowcaseCategoryIds,
  categories: allCategories,
  products,
}: {
  categoryShowcaseTitle: string;
  categoryShowcaseCategoryIds: string[];
  categories: ProductCategory[];
  products: Product[];
}) {
  // The merchant must explicitly pick categories in the editor — no
  // "nothing selected = show every category" fallback.
  const categories =
    categoryShowcaseCategoryIds?.length > 0
      ? allCategories.filter((cat) => categoryShowcaseCategoryIds.includes(cat.id))
      : [];

  const isSkeleton = categories.length === 0;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
      <h2 className="mb-5 text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
        {(categoryShowcaseTitle ?? "").trim() || "Popular categories"}
      </h2>

      <div className="flex w-full flex-col gap-8">
        {isSkeleton
          ? Array.from({ length: 2 }).map((_, blockIdx) => (
              <SkeletonCategorySlider key={blockIdx} blockIdx={blockIdx} />
            ))
          : categories.map((cat) => (
              <CategoryProductSlider
                key={cat.id}
                categoryId={cat.id}
                categoryName={cat.name}
                categorySlug={cat.slug}
                products={products}
              />
            ))}
      </div>
    </section>
  );
}
