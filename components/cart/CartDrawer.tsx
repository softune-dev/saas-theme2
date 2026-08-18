"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "./CartContext";
import { formatTaka } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Cart ({itemCount})
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
                className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Browse products and add items to get started.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.product.id}-${item.selectedSize}-${idx}`}
                      className="flex gap-3 p-4"
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--brand)]"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--brand)]">
                          {formatTaka(item.product.price)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-[var(--border)]">
                            <button
                              type="button"
                              aria-label="Decrease"
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                            <span className="w-7 text-center text-xs font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase"
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                            className="text-xs font-medium text-[var(--muted-foreground)] hover:text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <div className="space-y-3 border-t border-[var(--border)] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">
                    {formatTaka(subtotal)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-white"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-[var(--theme-btn-radius)] border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  View cart
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
