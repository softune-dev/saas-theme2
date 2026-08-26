"use client";

import Image from "next/image";
import { Award, Heart, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer/Footer";
import type { PublicSiteConfig } from "@/lib/theme-types";

type Theme = NonNullable<PublicSiteConfig["site"]["theme"]>;
type About = NonNullable<PublicSiteConfig["site"]["about"]>;

const PILLAR_ICONS = [Award, Heart, ShieldCheck];

/**
 * About page from Site Settings → About Us + Why Choose Us theme fields.
 * No hardcoded story copy.
 */
export function AboutPageClient({
  siteName,
  theme,
  about,
}: {
  siteName: string;
  theme: Theme;
  about: About;
}) {
  const aboutImage = about.image || "";
  const heading = about.heading || siteName;
  const paragraphs = about.paragraphs ?? [];
  const tagline = (theme.tagline as string | undefined) || "";

  const pillars = [
    { title: theme.why1Title as string, body: theme.why1 as string },
    { title: theme.why2Title as string, body: theme.why2 as string },
    { title: theme.why3Title as string, body: theme.why3 as string },
  ].filter((p) => p.title || p.body);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto w-full max-w-[1280px] px-3 pt-12 text-center sm:px-4 sm:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          Our story
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {siteName}
        </h1>
        {tagline ? (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {tagline}
          </p>
        ) : null}
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] items-center gap-8 px-3 py-10 sm:px-4 sm:py-14 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--muted)] sm:aspect-[5/4] md:aspect-[4/5]">
          {aboutImage ? (
            <Image
              src={aboutImage}
              alt={siteName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[var(--muted-foreground)]">
              Add an About image in Site Settings
            </div>
          )}
        </div>

        <div className="space-y-4 text-center md:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            About us
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]"
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              About content will appear here once added in Site Settings.
            </p>
          )}
        </div>
      </section>

      {pillars.length > 0 ? (
        <section className="border-t border-[var(--border)] bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-3 sm:px-4">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Why shop with us
              </p>
              {theme.whyTitle ? (
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {theme.whyTitle as string}
                </h3>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {pillars.map((p, i) => {
                const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                return (
                  <div
                    key={p.title || i}
                    className="rounded-2xl bg-[var(--background)] p-5 text-center sm:text-left"
                  >
                    <Icon
                      strokeWidth={1.5}
                      className="mx-auto size-7 text-[var(--brand)] sm:mx-0"
                    />
                    {p.title ? (
                      <h4 className="mt-3 text-sm font-bold text-[var(--foreground)]">
                        {p.title}
                      </h4>
                    ) : null}
                    {p.body ? (
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {p.body}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
}
