"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Footer } from "@/components/footer/Footer";
import { SocialLinks } from "@/components/social-links/SocialLinks";
import type { PublicSiteConfig } from "@/lib/theme-types";

type Business = NonNullable<PublicSiteConfig["site"]["business"]>;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export function ContactPageClient({
  business,
  host,
}: {
  business: Business;
  host: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Order Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/public/site/${host}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { name, phone, subject, message } }),
      });
      if (!res.ok) {
        throw new Error("Couldn't send your message. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const address = business.address;
  const addressLine = [
    address?.street,
    address?.city,
    address?.region,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const hours = business.opening_hours ?? [];
  const hasSocials =
    business.socials &&
    !Array.isArray(business.socials) &&
    Object.values(business.socials).some(Boolean);

  const channels = [
    addressLine
      ? {
          icon: MapPin,
          label: "Address",
          body: addressLine,
          href: null as string | null,
        }
      : null,
    business.phone
      ? {
          icon: Phone,
          label: "Phone",
          body: business.phone,
          href: `tel:${business.phone}`,
        }
      : null,
    business.email
      ? {
          icon: Mail,
          label: "Email",
          body: business.email,
          href: `mailto:${business.email}`,
        }
      : null,
    business.whatsapp
      ? {
          icon: MessageCircle,
          label: "WhatsApp",
          body: "Chat with us",
          href: `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, "")}`,
        }
      : null,
  ].filter(Boolean) as {
    icon: typeof MapPin;
    label: string;
    body: string;
    href: string | null;
  }[];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto w-full max-w-[1280px] px-3 pt-12 text-center sm:px-4 sm:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          Get in touch
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Contact us
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          {business.support_note?.trim() ||
            "Questions about an order or a product? Send a message and we will get back to you."}
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] flex-1 gap-8 px-3 py-10 sm:px-4 sm:py-14 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Channels
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              How to reach us
            </h2>
          </div>

          {channels.length > 0 ? (
            <div className="space-y-3">
              {channels.map((c) => {
                const Icon = c.icon;
                const inner = (
                  <>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-[var(--foreground)]">
                        {c.body}
                      </span>
                    </span>
                  </>
                );
                return c.href ? (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      c.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-colors hover:ring-[var(--brand)]/30"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={c.label}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Contact details coming soon.
            </p>
          )}

          {hours.length > 0 ? (
            <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                <Clock className="size-3.5" strokeWidth={2} />
                Hours
              </div>
              <div className="space-y-1 text-sm text-[var(--foreground)]">
                {hours.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}

          {hasSocials ? (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Connect
              </p>
              <SocialLinks
                socials={business.socials}
                className="flex items-center gap-4"
                iconClassName="size-5"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] sm:p-7 lg:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Message
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            Send a note
          </h2>

          {submitted ? (
            <div className="space-y-3 py-12 text-center">
              <CheckCircle2
                className="mx-auto size-10 text-emerald-600"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-bold">Message received</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Thanks — we&apos;ll get back to you shortly.
              </p>
            </div>
          ) : (
            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--brand)]"
              />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--brand)]"
              />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--brand)]"
              >
                <option value="Order Inquiry">Order inquiry & tracking</option>
                <option value="Product Question">Product question</option>
                <option value="Exchange & Returns">Exchange or return</option>
                <option value="General Feedback">General feedback</option>
              </select>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--brand)]"
              />
              {error ? (
                <p className="text-xs text-rose-600">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3 text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
