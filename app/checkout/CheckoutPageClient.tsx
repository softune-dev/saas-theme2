"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";

export function CheckoutPageClient() {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    deliveryLocations,
    selectedDeliveryLocation,
    setDeliveryLocation,
    clearCart,
    total,
  } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [payment] = useState<"cod">("cod");
  const [done, setDone] = useState(false);

  if (items.length === 0 && !done) {
    return (
      <>
        <div className="mx-auto flex min-h-[50vh] max-w-[480px] flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Nothing to checkout</h1>
          <Link href="/shop" className="mt-4 text-sm font-semibold text-[var(--brand)]">
            Browse products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (done) {
    return (
      <>
        <div className="mx-auto flex min-h-[50vh] max-w-[480px] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--brand)]/10 text-2xl text-[var(--brand)]">
            ✓
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
            Order placed
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Demo checkout only — no payment was processed. We&apos;ll confirm
            by phone shortly.
          </p>
          <button
            type="button"
            onClick={() => {
              clearCart();
              router.push("/");
            }}
            className="mt-6 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white"
          >
            Back to home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Checkout
        </h1>

        <form
          className="mt-6 grid gap-6 lg:grid-cols-12"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <div className="space-y-5 lg:col-span-7">
            <section className="rounded-xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Contact & delivery
              </h2>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Full name
                  </span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                    placeholder="Your full name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Phone
                  </span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                    placeholder="01XXXXXXXXX"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Delivery address
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                    placeholder="House, road, area"
                  />
                </label>
              </div>
            </section>

            {deliveryLocations.length > 0 ? (
              <section className="rounded-xl border border-[var(--border)] bg-white p-5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Delivery area
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Rates come from each product&apos;s delivery charges — not
                  hardcoded.
                </p>
                <div className="mt-3 space-y-2">
                  {deliveryLocations.map((loc) => {
                    const selected = selectedDeliveryLocation === loc;
                    // Sum each charged item's rate for this named area (same
                    // rules as CartContext.deliveryFee for the selected loc).
                    const feeForLoc = items
                      .filter(
                        (item) =>
                          !item.product.freeDelivery &&
                          (item.product.deliveryCharges?.length ?? 0) > 0,
                      )
                      .reduce((sum, item) => {
                        const match = item.product.deliveryCharges.find(
                          (dc) => dc.name === loc,
                        );
                        return sum + (match ? match.charge : 0);
                      }, 0);
                    return (
                      <label
                        key={loc}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-sm ${
                          selected
                            ? "border-[var(--brand)] bg-[var(--brand)]/5"
                            : "border-[var(--border)] hover:border-[var(--brand)]/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="delivery-area"
                            checked={selected}
                            onChange={() => setDeliveryLocation(loc)}
                            className="accent-[var(--brand)]"
                          />
                          <span className="font-medium text-[var(--foreground)]">
                            {loc}
                          </span>
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${
                            selected
                              ? "text-[var(--brand)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {formatTaka(feeForLoc)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Payment method
              </h2>
              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--brand)] bg-[var(--brand)]/5 px-3 py-3">
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "cod"}
                  readOnly
                  className="accent-[var(--brand)]"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Cash on delivery
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Pay when your order arrives
                  </p>
                </div>
              </label>
            </section>
          </div>

          <aside className="h-fit rounded-xl border border-[var(--border)] bg-white p-5 lg:col-span-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Order summary
            </h2>
            <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto">
              {items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[var(--muted)]">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--foreground)]">
                      {item.product.name} × {item.quantity}
                    </p>
                    <p className="text-xs tabular-nums text-[var(--muted-foreground)]">
                      {formatTaka(item.product.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Subtotal</dt>
                <dd className="tabular-nums font-medium">{formatTaka(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Delivery</dt>
                <dd className="tabular-nums font-medium">
                  {formatTaka(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold tabular-nums text-[var(--brand)]">
                  {formatTaka(total)}
                </dd>
              </div>
            </dl>
            <button
              type="submit"
              className="mt-5 w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-white"
            >
              Place order
            </button>
          </aside>
        </form>
      </div>
      <Footer />
    </>
  );
}
