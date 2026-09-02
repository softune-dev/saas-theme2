"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { FeatureIcon } from "@/lib/icon-map";
import type { ProductCategory } from "@/lib/theme-types";

/**
 * Category strip: one horizontal row.
 * - Mobile: circular cutout + name below the circle (outside).
 * - sm+: rectangular card — image zone + label as separate rows so padding
 *   around the image is even (absolute label used to crush bottom gap).
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

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          {settings.categoriesTitle || "Shop by Category"}
        </h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          View All
        </Link>
      </div>

      {/* overflow-x clips both axes — pad the lift distance so hover
       * -translate-y doesn't chop the top edge of the card. */}
      <div className="flex gap-3 overflow-x-auto pt-3 pb-2 scrollbar-none sm:gap-3.5 sm:pt-4">
        {isSkeleton
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex shrink-0 flex-col w-[5.5rem] items-center sm:h-44 sm:w-36 sm:items-stretch select-none"
              >
                <div className="relative flex w-full flex-col overflow-hidden bg-white border border-[var(--border)] aspect-square rounded-full sm:aspect-auto sm:min-h-0 sm:flex-1 sm:rounded-xl items-center justify-center p-3 text-center">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] mb-1 sm:mb-2">
                    <Plus className="size-4 sm:size-5" strokeWidth={2} />
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
                // Thin light primary edge (inset avoids global * border-color)
                "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_22%,transparent)]",
                "group-hover:bg-[var(--background)] group-hover:shadow-[inset_0_0_0_1px_var(--brand)]",
                "aspect-square rounded-full sm:aspect-auto sm:min-h-0 sm:flex-1 sm:rounded-xl",
              ].join(" ")}
            >
              {/* Image zone — equal inset on all sides; label is a sibling
               * row on sm+ (not absolute), so bottom gap matches top. */}
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
                    className="size-8 text-[var(--brand)] sm:size-10"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              {/* Name inside card — sm+ only, own row so image gap stays balanced */}
              <p className="hidden shrink-0 truncate px-2 pb-2.5 pt-1 text-center text-sm font-semibold tracking-tight text-[var(--foreground)] sm:block">
                {cat.name}
              </p>
            </div>
            {/* Name outside circle — small screens only; wrap, never truncate */}
            <p className="mt-1.5 w-full text-center text-xs font-semibold leading-snug tracking-tight text-[var(--foreground)] break-words sm:hidden">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
