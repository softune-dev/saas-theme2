"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FreeDeliveryNote } from "@/components/cart/FreeDeliveryNote";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";
import { ManualPaymentModal, type ManualWallet } from "@/components/checkout/ManualPaymentModal";
import { NagadPaymentModal } from "@/components/checkout/NagadPaymentModal";
import { captureAbandonedCheckout, storeTakesOrders, submitOrder, type PublicOrderOut } from "@/lib/checkout";
import { OrderLimitError, RecaptchaChallengeRequiredError, hasV2Fallback } from "@/lib/recaptcha";
import { orderWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";
import { RecaptchaDisclosure } from "@/components/recaptcha-disclosure";
import {
  RecaptchaV2Fallback,
  type RecaptchaV2FallbackHandle,
} from "@/components/recaptcha-v2-fallback";
import type { PublicPaymentMethod } from "@/lib/theme-types";
import { resolveVariantCombination } from "@/lib/variant-combo";
import { unitPrice } from "@/lib/pricing";

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
  ordering = "checkout",
  limited = false,
  whatsapp = "",
  phone = "",
}: {
  host: string;
  siteName: string;
  logoUrl: string | null;
  /** Only methods the merchant actually enabled in Settings → Payments —
   * checkout can only render cod/manual today regardless of what's
   * connected (gateways have no live checkout flow yet). */
  paymentMethods: PublicPaymentMethod[];
  /** Config's top-level `ordering`; missing means "checkout". "whatsapp"
   * turns Place order into a prepared WhatsApp message instead. */
  ordering?: "checkout" | "whatsapp";
  /** The store has a monthly order limit (the same plan that shows the badge). */
  limited?: boolean;
  /** The store's WhatsApp, falling back to its phone (as the product page does). */
  whatsapp?: string;
  phone?: string;
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
  const manualMethod = checkoutReadyMethods.find((m) => m.provider === "manual");
  const manualWallets: ManualWallet[] = manualMethod?.config.wallets?.length
    ? manualMethod.config.wallets
    : ["bkash"];
  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    checkoutReadyMethods[0]?.provider ?? null,
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [activeManualWallet, setActiveManualWallet] = useState<ManualWallet | null>(null);
  const [order, setOrder] = useState<PublicOrderOut | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsChallenge, setNeedsChallenge] = useState(false);
  // Set when POST /orders answers 403 order_limit: the store hit its monthly
  // limit even though config still said "checkout" (the POST is the authority).
  // transactionId is kept when the shopper had already paid in the modal.
  const [limit, setLimit] = useState<{ whatsapp: string | null; transactionId?: string } | null>(null);
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

  // WhatsApp ordering: the number from a limit response wins, else the
  // store's own WhatsApp, else its phone.
  const whatsappMode = ordering === "whatsapp";
  const waMessage = orderWhatsappMessage({
    storeName: siteName,
    items: items.map((i) => ({
      name: i.product.name,
      variant: [i.selectedSize && `Size ${i.selectedSize}`, i.selectedColor && `Color ${i.selectedColor}`]
        .filter(Boolean)
        .join(", "),
      quantity: i.quantity,
      linePrice: formatTaka(unitPrice(i.product, i.selectedSize, i.selectedColor) * i.quantity),
    })),
    subtotal: formatTaka(subtotal),
    delivery: formatTaka(deliveryFee),
    deliveryLocation: selectedDeliveryLocation,
    total: formatTaka(total),
    customer: {
      name: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone ? `+880${form.phone.replace(/\D/g, "")}` : "",
      address: [form.address, form.city, form.zip].filter(Boolean).join(", "),
    },
    transactionId: limit?.transactionId,
  });
  const waUrl = whatsappLink(limit?.whatsapp || whatsapp || phone, waMessage);
  const showWaStep = !!limit || (whatsappMode && !waUrl);

  // Fires once per real checkout view — see aurora's CheckoutPageClient for
  // the identical pattern this mirrors.
  useEffect(() => {
    if (items.length === 0) return;
    trackInitiateCheckout(
      items.map((i) => ({ id: i.product.id, name: i.product.name, price: unitPrice(i.product, i.selectedSize, i.selectedColor), quantity: i.quantity })),
      total,
      "BDT",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount with a non-empty cart, not on every total/items identity change
  }, []);

  // Abandoned-checkout capture: once the phone looks like a real BD mobile
  // number, quietly tell the backend what's in the cart so this shows up in
  // the merchant's abandoned-checkouts list if they never finish. Debounced
  // so it doesn't fire on every keystroke while still typing.
  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isValidBdLocalPhone(form.phone) || items.length === 0) return;
    if (captureTimer.current) clearTimeout(captureTimer.current);
    captureTimer.current = setTimeout(() => {
      captureAbandonedCheckout(
        host,
        `+880${form.phone.replace(/\D/g, "")}`,
        items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      );
    }, 800);
    return () => {
      if (captureTimer.current) clearTimeout(captureTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-fire on phone/cart changes, not host identity
  }, [form.phone, items]);

  async function placeOrder(transactionIdValue?: string) {
    setPlacing(true);
    setError(null);
    try {
      const placed = await submitOrder(host, {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          variant_key: resolveVariantCombination(i.product, i.selectedSize, i.selectedColor)?.key,
        })),
        customer: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: `+880${form.phone.replace(/\D/g, "")}`,
          address: form.address,
          city: form.city,
          zip: form.zip,
        },
        delivery_location: selectedDeliveryLocation,
        payment_method: paymentMethod as string,
        transaction_id: transactionIdValue,
      }, v2Token ?? "");
      setOrder(placed);
      // PublicOrderItemOut never carries product_id (deliberately minimal),
      // so this uses the cart's own items for real ids instead of the order
      // response, combined with the order's actual charged total/currency.
      trackPurchase({
        orderId: placed.order_number,
        value: placed.total_cents / 100,
        currency: placed.currency,
        items: items.map((i) => ({ id: i.product.id, name: i.product.name, price: unitPrice(i.product, i.selectedSize, i.selectedColor), quantity: i.quantity })),
      });
    } catch (err) {
      if (err instanceof OrderLimitError) {
        // Close any payment modal so the WhatsApp step behind it is visible.
        setLimit({ whatsapp: err.whatsapp, transactionId: transactionIdValue });
        setManualModalOpen(false);
        setActiveManualWallet(null);
        setNeedsChallenge(false);
      } else if (err instanceof RecaptchaChallengeRequiredError) {
        setNeedsChallenge(true);
        setError(hasV2Fallback ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
        v2Ref.current?.reset();
      }
      throw err;
    } finally {
      setPlacing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || placing || (!whatsappMode && !paymentMethod)) return;
    if (!isValidBdLocalPhone(form.phone)) {
      setPhoneError("Enter a valid Bangladeshi mobile number, e.g. 17XXXXXXXX.");
      return;
    }
    setPhoneError(null);

    // WhatsApp ordering: no order is created, nothing is tracked and the cart
    // stays. window.open runs straight from the submit tap (no await before
    // it), so popup blockers allow it.
    if (whatsappMode) {
      if (waUrl) window.open(waUrl, "_blank", "noopener");
      return;
    }

    // Manual payment collects the sending number + transaction id inside
    // its own branded modal (opened here, at final submit) instead of an
    // inline form field — see ManualPaymentModal. The real order is only
    // placed once that modal resolves with a transaction id.
    if (paymentMethod === "manual") {
      if (limited) {
        setPlacing(true);
        const open = await storeTakesOrders(host);
        setPlacing(false);
        if (!open) {
          setLimit({ whatsapp: null });
          return;
        }
      }
      setActiveManualWallet(manualWallets.length === 1 ? manualWallets[0] : null);
      setManualModalOpen(true);
      return;
    }

    try {
      await placeOrder();
    } catch {
      // Already surfaced via setError/setNeedsChallenge inside placeOrder.
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
                      .reduce((max, item) => {
                        const match = item.product.deliveryCharges.find((dc) => dc.name === loc);
                        return match ? Math.max(max, match.charge) : max;
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
            {!whatsappMode ? (
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
                              onChange={() => setPaymentMethod(method.provider)}
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
                              ) : method.provider === "manual" ? (
                                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                  You&apos;ll confirm payment on the next step
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
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
            ) : null}
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
                      {formatTaka(unitPrice(item.product, item.selectedSize, item.selectedColor) * item.quantity)}
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
                <FreeDeliveryNote className="col-span-full text-[var(--muted-foreground)]" />
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

            {showWaStep ? (
              <div className="mt-5 space-y-3 text-sm text-[var(--foreground)]">
                <p>
                  This store is taking orders on WhatsApp right now.
                  {limit?.transactionId
                    ? " If you already sent payment, send your transaction ID on WhatsApp."
                    : ""}
                </p>
                {waUrl ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[#25D366]/50 hover:bg-[#25D366]/5"
                  >
                    <Image src="/assets/whatsapp.svg" alt="" width={18} height={18} />
                    Order on WhatsApp
                  </a>
                ) : phone ? (
                  <a href={`tel:${phone}`} className="font-semibold text-[var(--brand)]">
                    Call {phone}
                  </a>
                ) : (
                  <Link href="/contact" className="font-semibold text-[var(--brand)]">
                    Contact the store
                  </Link>
                )}
              </div>
            ) : whatsappMode ? (
              <button
                type="submit"
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[#25D366]/50 hover:bg-[#25D366]/5"
              >
                <Image src="/assets/whatsapp.svg" alt="" width={18} height={18} />
                Order on WhatsApp
              </button>
            ) : (
            <button
              type="submit"
              disabled={placing || !paymentMethod || (needsChallenge && !v2Token)}
              className="mt-5 w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-semibold text-[var(--brand-fg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : "Place order"}
            </button>
            )}
            <div className="mt-3">
              <RecaptchaDisclosure />
            </div>
          </aside>
        </form>
      </div>
      <Footer />

      {/* Success Receipt Modal */}
      <AnimatePresence>
        {order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs print:hidden"
              onClick={handleCloseReceipt}
            />

            <style>{`
 @media print {
 body * { visibility: hidden; }
 #receipt, #receipt * { visibility: visible; }
 #receipt { position: absolute; left: 0; top: 0; margin: 0; padding: 2rem; width: 100%; max-width: none; box-shadow: none; background: white; color: #1c1c1c; }
 .print-hidden { display: none !important; }
 }
 `}</style>

            <motion.div
              id="receipt"
              initial={{ y: "100%", opacity: 0, rotateX: 45 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              style={{ transformPerspective: 1000 }}
              className="relative w-full max-w-sm bg-[#faf9f6] text-[#1c1c1c] p-8 shadow-2xl origin-bottom border border-stone-200"
            >
              {/* Radial gradient zigzag top/bottom edges */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle_at_50%_0,transparent_3px,#faf9f6_4px)] bg-[length:12px_100%] -translate-y-full" />
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[radial-gradient(circle_at_50%_100%,transparent_3px,#faf9f6_4px)] bg-[length:12px_100%] translate-y-full" />

              <div className="text-center mb-6">
                {logoUrl ? (
                  <div className="relative w-28 h-8 mx-auto mb-2">
                    <Image src={logoUrl} alt={siteName} fill className="object-contain" />
                  </div>
                ) : (
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="font-display text-3xl mb-1 text-[#1c1c1c]"
                  >
                    {siteName}
                  </h3>
                )}
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1c1c]/60 font-semibold">Order Confirmed</p>
              </div>

              <div className="text-xs text-[#1c1c1c]/70 mb-6 space-y-1.5 font-medium tracking-wide">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order #:</span>
                  <strong className="text-[#1c1c1c]">{order.order_number}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span>{paymentLabel}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-8 border-y border-dashed border-[#1c1c1c]/20 py-6 text-left">
                {order.items.map((i, idx) => (
                  <div key={`${i.name}-${idx}`} className="flex flex-col gap-0.5">
                    <div className="flex justify-between gap-4">
                      <span className="truncate text-stone-800">{i.quantity}x {i.name}</span>
                      <span className="font-semibold text-stone-900">{formatTaka(i.total_cents / 100)}</span>
                    </div>
                    {i.event_name ? (
                      <span className="text-[11px] uppercase tracking-wider text-[var(--brand)]">
                        {i.event_name} — {i.event_discount_percent}% off
                      </span>
                    ) : null}
                  </div>
                ))}
                <div className="flex justify-between gap-4 text-[#1c1c1c]/60 pt-2">
                  <span>Shipping</span>
                  <span>{order.shipping_cents > 0 ? formatTaka(order.shipping_cents / 100) : "Free"}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-[11px] uppercase tracking-[0.2em] text-stone-700">Total</span>
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="font-display text-2xl text-[#1c1c1c] font-bold"
                >
                  {formatTaka(order.total_cents / 100)}
                </span>
              </div>

              <div className="text-center space-y-3 print-hidden">
                <p className="text-xs text-[#1c1c1c]/60 leading-relaxed mb-4">
                  Thank you for your purchase, {form.firstName}.<br />
                  Your order will be shipped to {form.city} shortly.
                </p>
                <button
                  onClick={() => window.print()}
                  className="w-full rounded-[var(--theme-btn-radius)] bg-[#1c1c1c] text-[#faf9f6] py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-[#1c1c1c]/85 transition-colors font-semibold"
                >
                  Download Receipt
                </button>
                <button
                  onClick={handleCloseReceipt}
                  className="w-full rounded-[var(--theme-btn-radius)] border border-[#1c1c1c]/25 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-[#1c1c1c]/5 transition-colors font-semibold"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {manualModalOpen && manualWallets.length > 1 && !activeManualWallet ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Choose payment method</h3>
            <div className="space-y-2">
              {manualWallets.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveManualWallet(w)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {w === "bkash" || w === "nagad" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/assets/${w}.webp`} alt="" className="h-6 w-auto object-contain" />
                  ) : (
                    <span className="text-sm font-bold capitalize text-slate-700">{w}</span>
                  )}
                  <span className="text-sm font-medium capitalize text-slate-700">Pay with {w}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setManualModalOpen(false)}
              className="mt-3 w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <NagadPaymentModal
        open={manualModalOpen && activeManualWallet === "nagad"}
        paymentNumber={manualMethod?.config.payment_number ?? ""}
        shopName={siteName}
        totalCents={Math.round(total * 100)}
        onClose={() => {
          setManualModalOpen(false);
          setActiveManualWallet(null);
        }}
        onConfirm={(transactionIdValue) => placeOrder(transactionIdValue)}
      />

      <ManualPaymentModal
        open={manualModalOpen && (activeManualWallet === "bkash" || activeManualWallet === "rocket")}
        wallet={activeManualWallet === "rocket" ? "rocket" : "bkash"}
        paymentNumber={manualMethod?.config.payment_number ?? ""}
        shopName={siteName}
        totalCents={Math.round(total * 100)}
        onClose={() => {
          setManualModalOpen(false);
          setActiveManualWallet(null);
        }}
        onConfirm={(transactionIdValue) => placeOrder(transactionIdValue)}
      />
    </>
  );
}
