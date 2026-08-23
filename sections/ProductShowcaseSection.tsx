"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

export function ProductShowcaseSection({
  showcaseProductId,
  products,
}: {
  showcaseProductId: string;
  products: Product[];
}) {
  const { addItem, openDrawer } = useCart();

  // Only the merchant-picked product — no silent fall-through to products[0].
  const product = showcaseProductId
    ? products.find((p) => p.id === showcaseProductId)
    : undefined;

  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : [];
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");

  useEffect(() => {
    const next = product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "";
    setSelectedSize(next);
  }, [product?.id, product?.sizes]);

  if (!product) return null;

  const image = product.images?.[0] ?? "";
  const needsSize = sizes.length > 0;
  const canAdd = !needsSize || Boolean(selectedSize);

  function handleAddToBag() {
    if (!canAdd || !product) return;
    addItem(product, 1, selectedSize || undefined);
    openDrawer();
  }

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
      <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--muted)]">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          {product.categoryName ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {product.categoryName}
            </span>
          ) : null}

          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {product.name}
          </h2>

          {sizes.length > 0 ? (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Size
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
                      selectedSize === s
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--brand)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {formatTaka(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="text-base text-[var(--muted-foreground)] line-through">
                {formatTaka(product.originalPrice)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={!canAdd}
              className="flex-1 rounded-[var(--theme-btn-radius)] border border-[var(--foreground)] py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to cart
            </button>
            <Link
              href={`/shop/${product.slug}`}
              className="flex-1 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
