"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/** Hide entirely when the merchant hasn't written title or body — no mock copy. */
export function BannerCtaSection({
  ctaTitle,
  ctaBody,
  ctaButton,
}: {
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}) {
  const title = (ctaTitle ?? "").trim();
  const body = (ctaBody ?? "").trim();
  const button = (ctaButton ?? "").trim() || "Subscribe";

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!title && !body) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) setSubscribed(true);
  }

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--brand)]/5 p-6 sm:p-10">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          {title ? (
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto max-w-lg text-sm text-[var(--muted-foreground)] sm:text-base">
              {body}
            </p>
          ) : null}

          {subscribed ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span>Thank you for subscribing.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 pt-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] sm:flex-1"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <span>{button}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
