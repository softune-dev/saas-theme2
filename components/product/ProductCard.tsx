"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

/**
 * Marketplace product card — image, title, price, then Order Now + cart
 * side by side (both brand fills). No fabricated ratings.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const router = useRouter();
  const hasCompare =
    !!product.originalPrice && product.originalPrice > product.price;
  const discount =
    hasCompare && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : product.discountPercent;

  function handleOrderNow(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, undefined, undefined, { openDrawer: false });
    router.push("/checkout");
  }

  function handleAddToCart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openDrawer();
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_28%,var(--border))] hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)]">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[var(--muted)]"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-[var(--muted-foreground)]">
            No image
          </div>
        )}

        {discount && discount > 0 ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--brand-fg)] shadow-sm sm:text-[11px]">
            -{discount}%
          </span>
        ) : null}

        {product.badge ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-black/5 sm:text-[11px]">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
        {product.categoryName ? (
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)] sm:block">
            {product.categoryName}
          </p>
        ) : null}

        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors hover:text-[var(--brand)] sm:text-[15px]"
        >
          {product.name}
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-extrabold tabular-nums tracking-tight text-[var(--foreground)] sm:text-lg">
            {formatTaka(product.price)}
          </span>
          {hasCompare ? (
            <span className="text-xs tabular-nums text-[var(--muted-foreground)] line-through sm:text-sm">
              {formatTaka(product.originalPrice!)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-stretch gap-2 pt-1">
          <button
            type="button"
            onClick={handleOrderNow}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-3 text-xs font-semibold tracking-wide text-[var(--brand-fg)] transition-opacity hover:opacity-90 sm:text-[13px]"
          >
            Order Now
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--brand-fg)] transition-opacity hover:opacity-90"
          >
            <ShoppingBag className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
