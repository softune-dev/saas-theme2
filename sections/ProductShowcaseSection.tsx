"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ShoppingBag } from "lucide-react";
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
            <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center bg-[var(--muted)] p-6 text-center sm:aspect-square lg:aspect-auto lg:min-h-[520px]">
              {/* Mobile: centered + icon without circle */}
              <div className="flex flex-col items-center justify-center sm:hidden">
                <Plus className="mb-2 size-9 text-[var(--foreground)]" strokeWidth={2} />
                <span className="text-base font-bold text-[var(--foreground)]">
                  Add a product and feature it
                </span>
              </div>

              {/* Desktop: white circle with + icon */}
              <div className="hidden flex-col items-center justify-center sm:flex">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-xs">
                  <Plus className="size-7" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  Add a product and feature it
                </span>
              </div>
            </div>

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
  const discountPercent = calculateDiscount(
    product.price,
    product.originalPrice,
  );

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
                priority
                className="object-contain p-6 sm:p-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
            {discountPercent > 0 ? (
              <span className="absolute top-4 left-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Save {discountPercent}%
              </span>
            ) : null}
          </div>

          {/* Product details & buy form */}
          <div className="flex flex-col justify-center gap-5 p-5 sm:gap-6 sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                Featured Product
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                {product.name}
              </h2>
              {product.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)] line-clamp-3">
                  {product.description}
                </p>
              ) : null}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                {formatTaka(product.price)}
              </span>
              {product.originalPrice &&
              product.originalPrice > product.price ? (
                <span className="text-base text-[var(--muted-foreground)] line-through">
                  {formatTaka(product.originalPrice)}
                </span>
              ) : null}
            </div>

            {/* Color picker */}
            {colors.length > 0 ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Color:{" "}
                  <span className="font-medium text-[var(--muted-foreground)]">
                    {selectedColor || colors[0]?.name}
                  </span>
                </label>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const active = c.name === selectedColor;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={[
                          "relative size-9 rounded-full border-2 transition-all",
                          active
                            ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30 scale-105"
                            : "border-transparent hover:scale-105",
                        ].join(" ")}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Size picker */}
            {sizes.length > 0 ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Size:{" "}
                  <span className="font-medium text-[var(--muted-foreground)]">
                    {selectedSize}
                  </span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={[
                          "h-10 min-w-12 rounded-[var(--theme-btn-radius)] border px-3 text-xs font-bold transition-all",
                          active
                            ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]"
                            : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--brand)]",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-stretch">
              <button
                type="button"
                onClick={() => {
                  addItem(product, 1, selectedSize, selectedColor);
                  openDrawer();
                }}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90"
              >
                <ShoppingBag className="size-4" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addItem(product, 1, selectedSize, selectedColor);
                  router.push("/checkout");
                }}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border-2 border-[var(--foreground)] bg-white px-6 text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white"
              >
                Buy Now
              </button>
            </div>

            <Link
              href={`/shop/${product.slug}`}
              className="text-xs font-semibold text-[var(--muted-foreground)] underline hover:text-[var(--brand)]"
            >
              View full product details →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
