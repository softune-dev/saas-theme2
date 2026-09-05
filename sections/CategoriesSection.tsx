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
 * Standalone clean image cards with category name text underneath on all devices.
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
        <div className="flex cursor-grab gap-3 active:cursor-grabbing sm:gap-4">
          {isSkeleton
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex shrink-0 flex-col items-center w-[5.5rem] sm:w-36 select-none"
                >
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-white sm:rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center text-[var(--muted-foreground)] sm:h-10 sm:w-10 sm:rounded-full sm:bg-[var(--muted)]">
                      <Plus className="size-7 sm:size-5" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="mt-2 w-full truncate text-center text-[11px] font-semibold text-[var(--muted-foreground)] sm:text-xs">
                    Add category {i + 1}
                  </p>
                </div>
              ))
            : cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex shrink-0 flex-col items-center w-[5.5rem] sm:w-36 transition-transform duration-300 ease-out hover:-translate-y-1.5"
                >
                  {/* Separate image card container */}
                  <div
                    className={[
                      "relative flex aspect-square w-full items-center justify-center overflow-hidden bg-white border border-[var(--border)] rounded-full sm:rounded-2xl",
                      "transition-all duration-300 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
                      "group-hover:border-[var(--brand)] group-hover:shadow-md",
                    ].join(" ")}
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 76px, 144px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-3 sm:p-4">
                        <FeatureIcon
                          name={cat.icon || "package"}
                          className="size-8 text-[var(--brand)] transition-transform duration-300 group-hover:scale-105 sm:size-10"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>

                  {/* Clean text label underneath the card */}
                  <p className="mt-2 w-full truncate text-center text-xs font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--brand)] sm:text-sm">
                    {cat.name}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
