import type { Metadata } from "next";
import { Footer } from "@/components/footer/Footer";
import {
  buildMetadata,
  getPageSeo,
  getSiteConfig,
  getSiteHost,
} from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("privacy", host);
  return buildMetadata(seo);
}

export default async function PrivacyPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const privacy = config.site.legal?.privacy;
  const isPublished = Boolean(privacy?.published && privacy.content.trim());

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <section className="border-b border-[var(--border)] bg-white py-12 text-center sm:py-16">
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Trust & security
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {privacy?.title || "Privacy Policy"}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl flex-1 px-3 py-10 sm:px-4 sm:py-14">
        <div className="rounded-2xl bg-white p-6 text-sm leading-relaxed whitespace-pre-line text-[var(--muted-foreground)] ring-1 ring-black/[0.04] sm:p-8 sm:text-[15px]">
          {isPublished ? (
            privacy!.content
          ) : (
            <p className="text-center">
              Privacy policy isn&apos;t published yet — check back soon.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
