"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useTheme } from "@/lib/theme-context";
import { FeatureIcon } from "@/lib/icon-map";
import type { ProductCategory } from "@/lib/theme-types";

/**
 * Category strip: Embla carousel row with touch/drag support and prev/next controls.
 * - Mobile: circular cutout + name below the circle (outside).
 * - sm+: rectangular card — image zone + label as separate rows.
 */
export function CategoriesSection({
  categories: allCategories,
}: {
  categories: ProductCategory[];
}) {
  const { settings } = useTheme();
  const selectedIds = settings.selectedCategoryIds ?? [];
  // Resolve selection against the real catalog. Empty selection (or stale
  // ids that match nothing) → show all real categories — never sample-data.
  const fromSettings =
    selectedIds.length > 0
      ? allCategories.filter((c) => selectedIds.includes(c.id))
      : [];
  const cats = fromSettings.length > 0 ? fromSettings : allCategories;

  const isSkeleton = cats.length === 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          {settings.categoriesTitle || "Shop by Category"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous categories"
              className="rounded-full border border-[var(--border)] bg-white p-1.5 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] sm:p-2"
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next categories"
              className="rounded-full border border-[var(--border)] bg-white p-1.5 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] sm:p-2"
            >
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </button>
          </div>
          <Link
            href="/categories"
            className="text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="overflow-hidden pt-2 pb-2" ref={emblaRef}>
        <div className="flex cursor-grab gap-3 active:cursor-grabbing sm:gap-3.5">
          {isSkeleton
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex shrink-0 flex-col w-[5.5rem] items-center sm:h-44 sm:w-36 sm:items-stretch select-none"
                >
                  <div className="relative flex w-full flex-col overflow-hidden bg-white border border-[var(--border)] aspect-square rounded-full sm:aspect-auto sm:min-h-0 sm:flex-1 sm:rounded-xl items-center justify-center p-3 text-center">
                    <div className="flex items-center justify-center text-[var(--muted-foreground)] mb-1 sm:mb-2 sm:h-10 sm:w-10 sm:rounded-full sm:bg-[var(--muted)]">
                      <Plus className="size-7 sm:size-5" strokeWidth={2} />
                    </div>
                    <p className="hidden truncate px-1 text-center text-xs font-semibold text-[var(--muted-foreground)] sm:block">
                      Add category {i + 1}
                    </p>
                  </div>
                  <p className="mt-1.5 w-full text-center text-[11px] font-semibold text-[var(--muted-foreground)] sm:hidden">
                    Add category {i + 1}
                  </p>
                </div>
              ))
            : cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={[
                    "group flex shrink-0 flex-col transition-transform duration-300 ease-out hover:-translate-y-1.5",
                    "w-[5.5rem] items-center sm:h-44 sm:w-36 sm:items-stretch",
                  ].join(" ")}
                >
                  {/* Mobile: circle only (label below). sm+: full card chrome. */}
                  <div
                    className={[
                      "relative flex w-full flex-col overflow-hidden bg-white",
                      "transition-[background-color,box-shadow] duration-300 ease-out",
                      "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_22%,transparent)]",
                      "group-hover:bg-[var(--background)] group-hover:shadow-[inset_0_0_0_1px_var(--brand)]",
                      "aspect-square rounded-full sm:aspect-auto sm:min-h-0 sm:flex-1 sm:rounded-xl",
                    ].join(" ")}
                  >
                    <div className="relative flex min-h-0 flex-1 items-center justify-center">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-3.5"
                          sizes="(max-width: 640px) 76px, 144px"
                        />
                      ) : (
                        <FeatureIcon
                          name={cat.icon || "package"}
                          className="size-8 text-[var(--brand)] transition-transform duration-300 group-hover:scale-105 sm:size-10"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    <div className="hidden border-t border-[var(--border)] bg-white/70 py-2 px-2.5 backdrop-blur-xs group-hover:bg-transparent sm:block">
                      <p className="truncate text-center text-xs font-bold text-[var(--foreground)]">
                        {cat.name}
                      </p>
                    </div>
                  </div>

                  <p className="mt-1.5 w-full truncate text-center text-[11px] font-semibold text-[var(--foreground)] sm:hidden">
                    {cat.name}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
