"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

function StarRow({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={[
            "size-3",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-[var(--border)]",
          ].join(" ")}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/**
 * Marketplace product card:
 * image → name → price + compare-at beside it → stars + reviews
 * cart icon bottom-right.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasCompare =
    !!product.originalPrice && product.originalPrice > product.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <Link
        href={`/shop/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-[var(--muted)]"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5 pr-10 sm:p-3 sm:pr-11">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] hover:text-[var(--brand)]"
        >
          {product.name}
        </Link>

        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-sm font-bold tabular-nums text-[var(--brand)] sm:text-base">
            {formatTaka(product.price)}
          </span>
          {hasCompare ? (
            <span className="text-xs tabular-nums text-[var(--muted-foreground)] line-through">
              {formatTaka(product.originalPrice!)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <StarRow rating={product.rating} />
          <span className="text-[11px] text-[var(--muted-foreground)]">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Add ${product.name} to cart`}
        onClick={() => addItem(product, 1)}
        className="absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full bg-[var(--brand)] text-white transition-opacity hover:opacity-90 sm:size-9"
      >
        <ShoppingCart className="size-3.5 sm:size-4" strokeWidth={2} />
      </button>
    </article>
  );
}
