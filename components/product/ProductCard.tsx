"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";
import { QuickViewModal } from "./QuickViewModal";

/**
 * Marketplace product card — image, title, price, then Order Now + cart
 * side by side (both brand fills). No fabricated ratings. The card has its
 * own border + shadow so it reads as a distinct surface against the page
 * background; the image sits flush at the top with only its own rounded
 * corners (matching the card's), then a clear gap separates it from the
 * text block below.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const router = useRouter();
  const [quickView, setQuickView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.images.filter(Boolean);

  useEffect(() => {
    if (!hovered || images.length < 2) {
      if (!hovered) setImageIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [hovered, images.length]);

  const shownImage = images[imageIndex] ?? images[0];
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
    <>
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-t-xl bg-[var(--muted)]"
      >
        {shownImage ? (
          <Image
            src={shownImage}
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
          <span className="absolute left-2 top-2 rounded-md bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--brand-fg)] shadow-sm sm:text-[11px]">
            -{discount}%
          </span>
        ) : null}

        {product.badge ? (
          <span className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-black/5 sm:text-[11px]">
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Quick view ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickView(true);
          }}
          className="absolute bottom-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-[var(--foreground)] opacity-0 shadow-sm ring-1 ring-black/5 transition-opacity group-hover:opacity-100 max-md:opacity-100"
        >
          <Eye className="size-4" strokeWidth={2} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3 pt-3.5">
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
    <QuickViewModal
      product={quickView ? product : null}
      isOpen={quickView}
      onClose={() => setQuickView(false)}
    />
    </>
  );
}
