"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Marketplace quick-view — same rounded-2xl / white-card / brand-fill
 * language as ProductCard.tsx, just a bigger surface: full images, variant
 * pickers, and a quantity stepper without leaving the grid page. */
export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !product) return;
    setSelectedImage(0);
    setSelectedSize(product.sizes?.[0]);
    setSelectedColor(product.colors?.[0]?.name);
    setQuantity(1);
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !product || !mounted) return null;

  const hasCompare = !!product.originalPrice && product.originalPrice > product.price;
  const discount = hasCompare
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : undefined;

  function handleAddToCart() {
    addItem(product!, quantity, selectedSize, selectedColor);
    showToast("Added to cart", `${product!.name} added to your cart.`, "success");
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white md:max-h-[85vh] md:flex-row md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-80"
        >
          <X className="size-4" />
        </button>

        <div className="w-full shrink-0 p-3 md:w-1/2 md:p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--muted)]">
            {product.images[selectedImage] || product.images[0] ? (
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
            {discount && discount > 0 ? (
              <span className="absolute left-2.5 top-2.5 rounded-md bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--brand-fg)] shadow-sm">
                -{discount}%
              </span>
            ) : null}
          </div>

          {product.images.length > 1 ? (
            <div className="mt-2 hidden gap-2 overflow-x-auto md:flex">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative size-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${
                    selectedImage === idx ? "ring-[var(--brand)]" : "ring-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col md:w-1/2">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
            {product.categoryName ? (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {product.categoryName}
              </p>
            ) : null}

            <h2 className="mb-2 text-lg font-semibold leading-snug text-[var(--foreground)]">
              {product.name}
            </h2>

            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-[var(--foreground)]">
                {formatTaka(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-sm tabular-nums text-[var(--muted-foreground)] line-through">
                  {formatTaka(product.originalPrice!)}
                </span>
              ) : null}
            </div>

            {product.tagline ? (
              <p className="mb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {product.tagline}
              </p>
            ) : null}

            {product.colors && product.colors.length > 0 ? (
              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
                  {product.colorLabel || "Color"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex size-8 items-center justify-center rounded-full border transition-all ${
                        selectedColor === c.name
                          ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/25"
                          : "border-[var(--border)]"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.name ? <Check className="size-3.5 text-white" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes && product.sizes.length > 0 ? (
              <div className="mb-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
                  {product.sizeLabel || "Size"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                        selectedSize === s
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]"
                          : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--brand)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
                Qty
              </span>
              <div className="flex items-center overflow-hidden rounded-lg border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  -
                </button>
                <span className="min-w-9 px-2 text-center text-sm font-semibold text-[var(--foreground)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[var(--border)] p-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-[var(--brand-fg)] transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="size-4" strokeWidth={2} />
              Add to Cart &bull; {formatTaka(product.price * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
