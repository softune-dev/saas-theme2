import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Footer } from "@/components/footer/Footer";
import {
  buildMetadata,
  getPageSeo,
  getSiteConfig,
  getSiteHost,
} from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("faq", host);
  return buildMetadata(seo);
}

export default async function FaqPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const faqs = config.site.faqs ?? [];

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <section className="mx-auto w-full max-w-[1280px] px-3 pt-12 text-center sm:px-4 sm:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          Help & answers
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          FAQ
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          Delivery, payments, returns, and more — answered from this store&apos;s
          own FAQ list.
        </p>
      </section>

      <section className="mx-auto w-full max-w-3xl flex-1 px-3 py-10 sm:px-4 sm:py-14">
        {faqs.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            No frequently asked questions yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={faq.id}
                open={i === 0}
                className="group rounded-2xl bg-white px-4 py-3.5 ring-1 ring-black/[0.04] open:ring-[var(--brand)]/25 sm:px-5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:content-none">
                  {faq.question}
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl bg-white p-6 text-center ring-1 ring-black/[0.04] sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
              <HelpCircle className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Still have questions?
              </h3>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Reach out and the store will get back to you.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90"
          >
            Contact us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
