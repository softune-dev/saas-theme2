"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Package } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";
import { submitOrder, type PublicOrderOut } from "@/lib/checkout";
import { RecaptchaChallengeRequiredError, hasV2Fallback } from "@/lib/recaptcha";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";
import { RecaptchaDisclosure } from "@/components/recaptcha-disclosure";
import {
  RecaptchaV2Fallback,
  type RecaptchaV2FallbackHandle,
} from "@/components/recaptcha-v2-fallback";
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

/** Storefront logos for checkout payment UI (public/assets). */
const WALLET_LOGOS: Record<string, string> = {
  bkash: "/assets/bkash.webp",
  nagad: "/assets/nagad.webp",
  cod: "/assets/cod.webp",
  manual: "/assets/manual.webp",
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
  const [paymentNumberCopied, setPaymentNumberCopied] = useState(false);
  const [order, setOrder] = useState<PublicOrderOut | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsChallenge, setNeedsChallenge] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);
  const v2Ref = useRef<RecaptchaV2FallbackHandle>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const total = subtotal + deliveryFee;

  // Fires once per real checkout view — see aurora's CheckoutPageClient for
  // the identical pattern this mirrors.
  useEffect(() => {
    if (items.length === 0) return;
    trackInitiateCheckout(
      items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      total,
      "BDT",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount with a non-empty cart, not on every total/items identity change
  }, []);

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
      }, v2Token ?? "");
      setOrder(placed);
      // PublicOrderItemOut never carries product_id (deliberately minimal),
      // so this uses the cart's own items for real ids instead of the order
      // response, combined with the order's actual charged total/currency.
      trackPurchase({
        orderId: placed.order_number,
        value: placed.total_cents / 100,
        currency: placed.currency,
        items: items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      });
    } catch (err) {
      if (err instanceof RecaptchaChallengeRequiredError) {
        setNeedsChallenge(true);
        setError(hasV2Fallback ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
        v2Ref.current?.reset();
      }
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

  const paymentLabel = paymentMethod
    ? PAYMENT_LABELS[paymentMethod as PublicPaymentMethod["provider"]] ||
      paymentMethod
    : "—";

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
                    const isManual = method.provider === "manual";
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
                              {method.provider === "cod" ? (
                                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                  Pay when your order arrives
                                </p>
                              ) : null}
                            </div>
                          </div>
                          {WALLET_LOGOS[method.provider] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={WALLET_LOGOS[method.provider]}
                              alt=""
                              className="h-7 w-auto shrink-0 object-contain"
                            />
                          ) : null}
                        </div>

                        {selected && isManual ? (
                          <div
                            className="mt-3 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {method.config.payment_number ? (
                              <div>
                                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                                  Send payment to
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-lg font-semibold text-[var(--foreground)]">
                                    {method.config.payment_number}
                                  </p>
                                  <button
                                    type="button"
                                    aria-label={
                                      paymentNumberCopied
                                        ? "Copied"
                                        : "Copy payment number"
                                    }
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const number = method.config.payment_number;
                                      if (!number) return;
                                      try {
                                        await navigator.clipboard.writeText(number);
                                        setPaymentNumberCopied(true);
                                        window.setTimeout(
                                          () => setPaymentNumberCopied(false),
                                          1500,
                                        );
                                      } catch {
                                        /* clipboard may be blocked; number stays visible to copy manually */
                                      }
                                    }}
                                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                                  >
                                    {paymentNumberCopied ? (
                                      <Check
                                        strokeWidth={1.75}
                                        className="size-3.5 text-emerald-600"
                                      />
                                    ) : (
                                      <Copy
                                        strokeWidth={1.75}
                                        className="size-3.5"
                                      />
                                    )}
                                  </button>
                                </div>
                                {method.config.wallets?.length ? (
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {method.config.wallets.map((w) => {
                                      const key = w.toLowerCase();
                                      const logo = WALLET_LOGOS[key];
                                      return logo ? (
                                        <span
                                          key={w}
                                          className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-[var(--border)]"
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={logo}
                                            alt={w}
                                            className="h-6 w-auto object-contain"
                                          />
                                        </span>
                                      ) : (
                                        <span
                                          key={w}
                                          className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--foreground)] ring-1 ring-[var(--border)]"
                                        >
                                          {w}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                                Transaction ID *
                              </label>
                              <input
                                type="text"
                                name="transaction_id"
                                autoComplete="off"
                                placeholder="e.g. TXN123456789"
                                value={transactionId}
                                required={paymentMethod === "manual"}
                                onChange={(e) => {
                                  setTransactionId(e.target.value);
                                  if (txnIdError) setTxnIdError(null);
                                }}
                                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
                              />
                              {txnIdError ? (
                                <p className="mt-1.5 text-xs text-rose-600">{txnIdError}</p>
                              ) : null}
                            </div>
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

            {needsChallenge && hasV2Fallback ? (
              <div className="mt-3">
                <RecaptchaV2Fallback ref={v2Ref} onVerify={setV2Token} />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={placing || !paymentMethod || (needsChallenge && !v2Token)}
              className="mt-5 w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-[var(--brand-fg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : "Place order"}
            </button>
            <div className="mt-3">
              <RecaptchaDisclosure />
            </div>
          </aside>
        </form>
      </div>
      <Footer />

      {/* Marketplace success modal — card receipt (not Aurora's fashion ticket). */}
      <AnimatePresence>
        {order ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] print:hidden"
              onClick={handleCloseReceipt}
            />

            <style>{`
@media print {
  body * { visibility: hidden; }
  #bazaar-receipt, #bazaar-receipt * { visibility: visible; }
  #bazaar-receipt {
    position: absolute; left: 0; top: 0; margin: 0;
    padding: 2rem; width: 100%; max-width: none;
    box-shadow: none; border-radius: 0; background: white;
  }
  .print-hidden { display: none !important; }
}
`}</style>

            <motion.div
              id="bazaar-receipt"
              role="dialog"
              aria-labelledby="order-success-title"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white text-[var(--foreground)] shadow-2xl ring-1 ring-black/5"
              style={{ padding: "2rem" }}
            >
              <div className="mb-6 text-center">
                {logoUrl ? (
                  <div className="relative mx-auto mb-3 h-8 w-28">
                    <Image
                      src={logoUrl}
                      alt={siteName}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <h3
                    id="order-success-title"
                    className="mb-1 font-display text-2xl font-bold tracking-tight"
                  >
                    {siteName}
                  </h3>
                )}
                <p
                  id={logoUrl ? "order-success-title" : undefined}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
                >
                  Order confirmed
                </p>
              </div>

              <div className="mb-5 space-y-2 text-xs font-medium">
                {(
                  [
                    [
                      "Date",
                      new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ],
                    ["Order", `#${order.order_number.replace(/^#/, "")}`],
                    ["Payment", paymentLabel],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline gap-2 text-[var(--muted-foreground)]"
                  >
                    <span className="shrink-0">{label}</span>
                    <span
                      aria-hidden
                      className="min-w-4 flex-1 border-b border-dashed border-[var(--border)]"
                    />
                    <span className="shrink-0 font-medium text-[var(--foreground)]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-3 border-y border-dashed border-[var(--border)] py-5">
                {order.items.map((line, idx) => {
                  const cartMatch = items.find(
                    (c) => c.product.name === line.name,
                  );
                  const image = cartMatch?.product.images?.[0];
                  return (
                    <div
                      key={`${line.name}-${idx}`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                        {image ? (
                          <Image
                            src={image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[var(--muted-foreground)]">
                            <Package className="size-4" strokeWidth={1.5} />
                          </span>
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">
                        {line.quantity}× {line.name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatTaka(line.total_cents / 100)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-baseline gap-2 pt-1 text-sm text-[var(--muted-foreground)]">
                  <span className="shrink-0">Shipping</span>
                  <span
                    aria-hidden
                    className="min-w-4 flex-1 border-b border-dashed border-[var(--border)]"
                  />
                  <span className="shrink-0 tabular-nums font-medium text-[var(--foreground)]">
                    {order.shipping_cents > 0
                      ? formatTaka(order.shipping_cents / 100)
                      : "Free"}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex items-end justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Total
                </span>
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--brand)]">
                  {formatTaka(order.total_cents / 100)}
                </span>
              </div>

              <div className="print-hidden space-y-2.5 text-center">
                <p className="mb-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  Thank you{form.firstName ? `, ${form.firstName}` : ""}.
                  {form.city
                    ? ` Your order will ship to ${form.city} shortly.`
                    : " We\u2019ll confirm by phone shortly."}
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90"
                >
                  Print receipt
                </button>
                <button
                  type="button"
                  onClick={handleCloseReceipt}
                  className="w-full rounded-[var(--theme-btn-radius)] border border-[var(--border)] py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
