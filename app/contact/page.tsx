"use client";

import { useState } from "react";
import { SystemPageShell } from "@/components/ui/SystemPageShell";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SystemPageShell title="Contact us">
      <p>
        Questions about an order, a product, or partnership? Send a message —
        this is a demo form (not wired to email yet).
      </p>
      {sent ? (
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4 text-sm font-medium text-[var(--foreground)]">
          Thanks — we&apos;ll get back to you shortly.
        </p>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input
            required
            name="name"
            placeholder="Your name"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
          <textarea
            required
            name="message"
            rows={4}
            placeholder="How can we help?"
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
          <button
            type="submit"
            className="rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Send message
          </button>
        </form>
      )}
      <h2>Direct</h2>
      <p>
        Phone: +880 1700-000000
        <br />
        Email: hello@bazaar.example
      </p>
    </SystemPageShell>
  );
}
