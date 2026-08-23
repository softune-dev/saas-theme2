"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck, CreditCard } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";
import { submitOrder, type PublicOrderOut } from "@/lib/checkout";
import type { PublicPaymentMethod } from "@/lib/theme-types";

// Only the local part after the fixed "+880" prefix — 10 digits, starting
// 3-9 per the real BD mobile prefixes. Mirrors app/api/public.py's
// _validate_bd_phone, which is the real server-side gate.
const BD_LOCAL_RE = /^1[3-9]\d{8}$/;

function isValidBdLocalPhone(raw: string): boolean {
  return BD_LOCAL_RE.test(raw.replace(/\D/g, ""));
}

const PAYMENT_LABELS: Record<PublicPaymentMethod["provider"], string> = {
  cod: "Cash on Delivery",
  manual: "Manual Payment (bKash/Nagad/Rocket)",
  bkash: "bKash",
  nagad: "Nagad",
  sslcommerz: "SSLCommerz",
  rocket: "Rocket",
};

export function CheckoutPageClient({
  host,
  siteName,
  logoUrl,
  paymentMethods,
}: {
  host: string;
  siteName: string;
  logoUrl: string | null;
  /** Only methods the merchant actually enabled in Settings → Payments —
   * checkout can only render cod/manual today regardless of what's
   * connected (gateways have no live checkout flow yet). */
  paymentMethods: PublicPaymentMethod[];
}) {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    deliveryLocations,
    selectedDeliveryLocation,
    setDeliveryLocation,
    clearCart,
  } = useCart();

  const checkoutReadyMethods = paymentMethods.filter(
    (m) => m.provider === "cod" || m.provider === "manual",
  );
  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    checkoutReadyMethods[0]?.provider ?? null,
  );
  const [transactionId, setTransactionId] = useState("");
  const [txnIdError, setTxnIdError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrderOut | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || placing || !paymentMethod) return;
    if (!isValidBdLocalPhone(form.phone)) {
      setPhoneError("Enter a valid Bangladeshi mobile number, e.g. 17XXXXXXXX.");
      return;
    }
    if (paymentMethod === "manual" && !transactionId.trim()) {
      setTxnIdError("Transaction ID is required for manual payment.");
      return;
    }
    setPlacing(true);
    setError(null);
    setPhoneError(null);
    setTxnIdError(null);
    try {
      const placed = await submitOrder(host, {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: `+880${form.phone.replace(/\D/g, "")}`,
          address: form.address,
          city: form.city,
          zip: form.zip,
        },
        delivery_location: selectedDeliveryLocation,
        payment_method: paymentMethod,
        transaction_id: paymentMethod === "manual" ? transactionId.trim() : undefined,
      });
      setOrder(placed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function handleCloseReceipt() {
    clearCart();
    router.push("/");
  }

  if (items.length === 0 && !order) {
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

  if (order) {
    return (
      <>
        <div className="mx-auto flex min-h-[70vh] max-w-[480px] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--brand)]/10 text-2xl text-[var(--brand)]">
            ✓
          </div>
          {logoUrl ? (
            <div className="relative mt-4 h-8 w-28">
              <Image src={logoUrl} alt={siteName} fill className="object-contain" />
            </div>
          ) : null}
          <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
            Order placed
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Order #{order.order_number} — we&apos;ll confirm by phone shortly.
          </p>

          <div className="mt-6 w-full space-y-2 rounded-xl border border-[var(--border)] bg-white p-5 text-left text-sm">
            {order.items.map((i, idx) => (
              <div key={`${i.name}-${idx}`} className="flex justify-between gap-4">
                <span className="truncate text-[var(--foreground)]">
                  {i.quantity}x {i.name}
                </span>
                <span className="tabular-nums font-medium">{formatTaka(i.total_cents / 100)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-2 text-[var(--muted-foreground)]">
              <span>Shipping</span>
              <span className="tabular-nums">{formatTaka(order.shipping_cents / 100)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-2 text-base font-semibold text-[var(--foreground)]">
              <span>Total</span>
              <span className="tabular-nums text-[var(--brand)]">{formatTaka(order.total_cents / 100)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseReceipt}
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

        <form className="mt-6 grid gap-6 lg:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-5 lg:col-span-7">
            <section className="rounded-xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Contact & delivery
              </h2>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      First name
                    </span>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                      placeholder="First name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      Last name
                    </span>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                      placeholder="Last name"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Phone
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 focus-within:border-[var(--brand)]">
                    <span className="shrink-0 text-sm text-[var(--muted-foreground)]">+880</span>
                    <input
                      required
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setForm((f) => ({ ...f, phone: digits }));
                        if (phoneError) setPhoneError(null);
                      }}
                      className="w-full min-w-0 flex-1 bg-transparent text-sm outline-none"
                      placeholder="1XXXXXXXXX"
                    />
                  </div>
                  {phoneError ? (
                    <p className="mt-1 text-xs text-rose-600">{phoneError}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Delivery address
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                    placeholder="House, road, area"
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      City
                    </span>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                      placeholder="City"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      Postal code
                    </span>
                    <input
                      required
                      value={form.zip}
                      onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                      placeholder="Postal code"
                    />
                  </label>
                </div>
              </div>
            </section>

            {deliveryLocations.length > 0 ? (
              <section className="rounded-xl border border-[var(--border)] bg-white p-5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Delivery area
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Rates come from each product&apos;s delivery charges — not hardcoded.
                </p>
                <div className="mt-3 space-y-2">
                  {deliveryLocations.map((loc) => {
                    const selected = selectedDeliveryLocation === loc;
                    const feeForLoc = items
                      .filter(
                        (item) =>
                          !item.product.freeDelivery &&
                          (item.product.deliveryCharges?.length ?? 0) > 0,
                      )
                      .reduce((sum, item) => {
                        const match = item.product.deliveryCharges.find((dc) => dc.name === loc);
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
                          <span className="font-medium text-[var(--foreground)]">{loc}</span>
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${
                            selected ? "text-[var(--brand)]" : "text-[var(--muted-foreground)]"
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

            {/* Only what the merchant actually enabled in Settings → Payments.
             * No fabricated COD default: if nothing is enabled, say so honestly. */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Payment method
              </h2>
              {checkoutReadyMethods.length === 0 ? (
                <p className="mt-3 rounded-lg bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
                  This store hasn&apos;t enabled a payment method yet. Please contact them directly to complete your order.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {checkoutReadyMethods.map((method) => {
                    const selected = paymentMethod === method.provider;
                    return (
                      <label
                        key={method.provider}
                        className={`block cursor-pointer rounded-xl border px-3 py-3 text-sm transition-colors ${
                          selected
                            ? "border-[var(--brand)] bg-[var(--brand)]/5"
                            : "border-[var(--border)] hover:border-[var(--brand)]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <input
                              type="radio"
                              name="payment_method"
                              checked={selected}
                              onChange={() => {
                                setPaymentMethod(method.provider);
                                setTxnIdError(null);
                              }}
                              className="accent-[var(--brand)]"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--foreground)]">
                                {method.label || PAYMENT_LABELS[method.provider]}
                              </p>
                              {selected && method.provider === "manual" && method.config.payment_number ? (
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                  Send payment to{" "}
                                  <strong className="text-[var(--foreground)]">
                                    {method.config.payment_number}
                                  </strong>
                                  {method.config.wallets?.length
                                    ? ` via ${method.config.wallets.join(", ")}`
                                    : ""}
                                  , then enter your transaction ID below.
                                </p>
                              ) : null}
                            </div>
                          </div>
                          {method.provider === "cod" ? (
                            <Truck strokeWidth={1.5} className="size-5 shrink-0 text-[var(--muted-foreground)]" />
                          ) : (
                            <CreditCard strokeWidth={1.5} className="size-5 shrink-0 text-[var(--muted-foreground)]" />
                          )}
                        </div>
                        {selected && method.provider === "manual" ? (
                          <div className="mt-3 pl-7" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              autoComplete="off"
                              placeholder="Transaction ID"
                              value={transactionId}
                              required={paymentMethod === "manual"}
                              onChange={(e) => {
                                setTransactionId(e.target.value);
                                if (txnIdError) setTxnIdError(null);
                              }}
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                            />
                            {txnIdError ? (
                              <p className="mt-1.5 text-xs text-rose-600">{txnIdError}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              )}
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
                <dd className="tabular-nums font-medium">{formatTaka(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold tabular-nums text-[var(--brand)]">{formatTaka(total)}</dd>
              </div>
            </dl>

            {error ? <p className="mt-3 text-xs text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={placing || !paymentMethod}
              className="mt-5 w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : "Place order"}
            </button>
          </aside>
        </form>
      </div>
      <Footer />
    </>
  );
}
