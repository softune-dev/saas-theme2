"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { calculateDiscount, formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

/**
 * Featured product spotlight on the home page — large image + buy panel,
 * save badge from compare-at price, short description, variants.
 */
export function ProductShowcaseSection({
  showcaseProductId,
  products,
}: {
  showcaseProductId: string;
  products: Product[];
}) {
  const { addItem, openDrawer } = useCart();
  const router = useRouter();

  const product = showcaseProductId
    ? products.find((p) => p.id === showcaseProductId)
    : undefined;

  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : [];
  const colors = product?.colors ?? [];
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colors[0]?.name,
  );

  useEffect(() => {
    setSelectedSize(
      product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "",
    );
    setSelectedColor(product?.colors?.[0]?.name);
  }, [product?.id, product?.sizes, product?.colors]);

  if (!product) {
    return (
      <section className="mx-auto max-w-[1280px] px-3 py-8 sm:px-4 sm:py-12">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04] select-none">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image stage */}
            <div className="relative aspect-[4/5] bg-[var(--muted)] sm:aspect-square lg:aspect-auto lg:min-h-[520px]" />

            {/* Content */}
            <div className="flex flex-col justify-center gap-5 p-5 sm:gap-6 sm:p-8 lg:p-10">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-[var(--muted)] rounded" />
                <div className="h-8 sm:h-10 w-3/4 bg-[var(--muted)] rounded" />
                <div className="h-4 w-1/2 bg-[var(--muted)] rounded" />
              </div>

              <div className="h-9 w-36 bg-[var(--muted)] rounded" />

              {/* Colors Skeleton */}
              <div>
                <div className="h-3 w-16 bg-[var(--muted)] rounded mb-2.5" />
                <div className="flex gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="size-9 rounded-full bg-[var(--muted)]"
                    />
                  ))}
                </div>
              </div>

              {/* Sizes Skeleton */}
              <div>
                <div className="h-3 w-14 bg-[var(--muted)] rounded mb-2" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-12 rounded-[var(--theme-btn-radius)] bg-[var(--muted)]"
                    />
                  ))}
                </div>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-stretch">
                <div className="h-12 flex-1 rounded-[var(--theme-btn-radius)] bg-[var(--muted)]" />
                <div className="h-12 flex-1 rounded-[var(--theme-btn-radius)] bg-[var(--muted)]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const image = product.images?.[0] ?? "";
  const needsSize = sizes.length > 0;
  const canAdd = !needsSize || Boolean(selectedSize);
  const hasCompare =
    !!product.originalPrice && product.originalPrice > product.price;
  const discount =
    product.discountPercent ??
    calculateDiscount(product.price, product.originalPrice);

  function handleAddToBag() {
    if (!canAdd || !product) return;
    addItem(product, 1, selectedSize || undefined, selectedColor);
    openDrawer();
  }

  function handleBuyNow() {
    if (!canAdd || !product) return;
    addItem(product, 1, selectedSize || undefined, selectedColor, {
      openDrawer: false,
    });
    router.push("/checkout");
  }

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-8 sm:px-4 sm:py-12">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image stage */}
          <div className="relative aspect-[4/5] bg-[var(--muted)] sm:aspect-square lg:aspect-auto lg:min-h-[520px]">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />
            ) : null}

            {discount > 0 ? (
              <span className="absolute left-4 top-4 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-bold tracking-wide text-[var(--brand-fg)] shadow-sm sm:left-5 sm:top-5 sm:text-sm">
                Save {discount}%
              </span>
            ) : null}

            {product.badge ? (
              <span className="absolute right-4 top-4 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-black/5 sm:right-5 sm:top-5">
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-5 p-5 sm:gap-6 sm:p-8 lg:p-10">
            <div className="space-y-2">
              {product.categoryName ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {product.categoryName}
                </p>
              ) : null}
              <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
                {product.name}
              </h2>
              {product.tagline ? (
                <p className="max-w-md text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
                  {product.tagline}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-[var(--foreground)]">
                {formatTaka(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-base tabular-nums text-[var(--muted-foreground)] line-through">
                  {formatTaka(product.originalPrice!)}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-md bg-[var(--brand)]/10 px-2 py-0.5 text-sm font-bold text-[var(--brand)]">
                  -{discount}%
                </span>
              ) : null}
            </div>

            {colors.length > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  <span>{product.colorLabel || "Color"}</span>
                  {selectedColor ? (
                    <span className="normal-case tracking-normal text-[var(--foreground)]">
                      {selectedColor}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={c.name}
                      title={c.name}
                      className={[
                        "size-9 shrink-0 rounded-full border transition-all",
                        selectedColor === c.name
                          ? "ring-2 ring-[var(--brand)] ring-offset-2"
                          : "border-[var(--border)] hover:ring-2 hover:ring-[var(--border)] hover:ring-offset-2",
                      ].join(" ")}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sizes.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {product.sizeLabel || "Size"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={[
                        "min-w-11 rounded-[var(--theme-btn-radius)] border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                        selectedSize === s
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--brand)]",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-stretch">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!canAdd}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="size-4" strokeWidth={2} />
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canAdd}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy now
              </button>
            </div>

            <Link
              href={`/shop/${product.slug}`}
              className="text-center text-sm font-semibold text-[var(--brand)] hover:underline sm:text-left"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
