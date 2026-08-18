"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";

export function CartPageClient() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCart();

  if (items.length === 0) {
    return (
      <>
        <div className="mx-auto flex min-h-[50vh] max-w-[640px] flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Add products from the shop to see them here.
          </p>
          <Link
            href="/shop"
            className="mt-6 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white"
          >
            Browse products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Cart ({itemCount})
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-white lg:col-span-8">
            {items.map((item, idx) => (
              <li
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="flex gap-3 p-4 sm:gap-4"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)] sm:size-24">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/shop/${item.product.slug}`}
                    className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--brand)]"
                  >
                    {item.product.name}
                  </Link>
                  {item.selectedSize ? (
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Size: {item.selectedSize}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--brand)]">
                    {formatTaka(item.product.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border border-[var(--border)]">
                      <button
                        type="button"
                        className="p-1.5"
                        aria-label="Decrease"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="p-1.5"
                        aria-label="Increase"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor,
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                  {formatTaka(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-[var(--border)] bg-white p-5 lg:col-span-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Order summary
            </h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatTaka(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Delivery calculated at checkout based on your area.
            </p>
            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-white"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="mt-2 flex w-full items-center justify-center py-2 text-sm font-medium text-[var(--brand)]"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
