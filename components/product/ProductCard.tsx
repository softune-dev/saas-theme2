"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

/**
 * Marketplace product card:
 * image → name → price + compare-at beside it → Order Now button
 * cart icon bottom-right. No review stars/count — real reviews aren't
 * built yet, so this never shows a fabricated rating.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const hasCompare =
    !!product.originalPrice && product.originalPrice > product.price;

  function handleOrderNow() {
    addItem(product, 1);
    router.push("/checkout");
  }

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

        <button
          type="button"
          onClick={handleOrderNow}
          className="mt-1 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          Order Now
        </button>
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
