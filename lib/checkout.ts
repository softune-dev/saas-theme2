/**
 * Real checkout submission — POST /public/site/{host}/orders (app/api/public.py).
 *
 * Prices and the delivery fee are computed server-side from the real product
 * rows; this only sends product_id/quantity, never a price the browser could
 * tamper with. See CartContext.tsx for the client-side delivery fee preview
 * shown before submit — the server recomputes it independently and that's
 * the number that actually gets charged.
 */

import { getRecaptchaToken, throwForErrorResponse } from "./recaptcha";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export type PublicOrderItemIn = {
  product_id: string;
  quantity: number;
};

export type CheckoutCustomer = {
  first_name: string;
  last_name: string;
  /** BD mobile number only — validated both client-side (isValidBdPhone in
   * CheckoutPageClient.tsx) and server-side (_validate_bd_phone in
   * app/api/public.py, the real gate). */
  phone: string;
  address: string;
  city: string;
  zip: string;
};

export type PublicOrderItemOut = {
  name: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  /** Set only when an active Event's discount actually applied to this
   * line at checkout — permanent, from the order's own immutable snapshot,
   * not a live lookup. */
  event_name?: string | null;
  event_discount_percent?: number | null;
};

export type PublicOrderOut = {
  order_number: string;
  items: PublicOrderItemOut[];
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  delivery_location: string | null;
  created_at: string;
};

export async function submitOrder(
  host: string,
  payload: {
    items: PublicOrderItemIn[];
    customer: CheckoutCustomer;
    delivery_location: string | null;
    payment_method: string;
    /** Required by the backend when payment_method is "manual". */
    transaction_id?: string;
  },
  /** Present only on a retry after a RecaptchaChallengeRequiredError. */
  recaptcha_v2_token: string = "",
): Promise<PublicOrderOut> {
  const recaptcha_token = await getRecaptchaToken("checkout");
  const res = await fetch(`${API_BASE_URL}/public/site/${host}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, recaptcha_token, recaptcha_v2_token }),
  });
  if (!res.ok) {
    await throwForErrorResponse(res, "Couldn't place your order. Please try again.");
  }
  return res.json() as Promise<PublicOrderOut>;
}
