"use client";

import Link from "next/link";
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

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
      <h2 className="mb-5 text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
        {(categoryShowcaseTitle ?? "").trim() || "Popular departments"}
      </h2>

      <div className="flex w-full flex-col gap-8">
        {categories.map((cat) => (
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
