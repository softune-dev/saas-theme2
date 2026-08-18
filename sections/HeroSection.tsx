"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { FeatureIcon } from "@/lib/icon-map";
import type { ProductCategory } from "@/lib/theme-types";

const SLIDE_MS = 4500;

function useSlideIndex(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count]);

  const safe = count > 0 ? index % count : 0;
  return safe;
}

/**
 * Marketplace hero: category rail + multi-image promo slider.
 * White card chrome; dots overlaid on the image; View all pinned to rail bottom.
 */
export function HeroSection({
  categories = [],
}: {
  categories?: ProductCategory[];
}) {
  const { settings } = useTheme();
  const wide = (settings.heroImages ?? []).filter(Boolean);
  const square = (settings.heroImagesSquare ?? []).filter(Boolean);
  // Hero images are merchant-owned theme fields — empty means no slides,
  // not a stock Unsplash fallback (same honesty rule as catalog data).
  const desktopSlides = wide.length > 0 ? wide : [];
  const mobileSlides = square.length > 0 ? square : desktopSlides;

  const desktopIndex = useSlideIndex(desktopSlides.length);
  const mobileIndex = useSlideIndex(mobileSlides.length);

  const announcementItems = useMemo(
    () =>
      (settings.announcementItems ?? [])
        .map((s) => s.trim())
        .filter(Boolean),
    [settings.announcementItems],
  );
  const divider = settings.announcementDivider?.trim() || "·";
  // Only show when merchant has real items — no fabricated marquee copy.
  const showMarquee = announcementItems.length > 0;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-stretch overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {/* Rail stretches to banner height; View all sits at the bottom */}
        <aside className="hidden w-[15.5rem] shrink-0 flex-col border-r border-[var(--border)] lg:flex xl:w-64">
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {categories.map((cat) => (
              <li key={cat.id} className="border-b border-[var(--border)]">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group/cat flex w-full items-center px-3.5 py-3.5 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--brand)]"
                >
                  {/* Slide content only — bg stays edge-to-edge (no left gap) */}
                  <span className="flex min-w-0 flex-1 items-center gap-2.5 transition-transform duration-200 group-hover/cat:translate-x-1">
                    <FeatureIcon
                      name={cat.icon || "package"}
                      className="size-4 shrink-0 text-[var(--foreground)] transition-colors duration-200 group-hover/cat:text-[var(--brand)]"
                      strokeWidth={1.75}
                    />
                    <span className="min-w-0 flex-1 truncate transition-colors duration-200 group-hover/cat:text-[var(--brand)]">
                      {cat.name}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)] transition-colors duration-200 group-hover/cat:text-[var(--brand)]" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex shrink-0 items-center justify-center px-3.5 py-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-0.5 text-sm font-semibold tracking-tighter text-[var(--brand)] transition-opacity hover:opacity-80"
            >
              View all categories
              <ChevronRight className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
        </aside>

        {/* Banner column: thin marquee strip full image-width, then slides */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-white">
          {showMarquee ? (
            <HeroMarquee items={announcementItems} divider={divider} />
          ) : null}

          <div className="relative min-h-0 flex-1">
            <div className="relative aspect-square sm:hidden">
              {mobileSlides.map((src, i) => (
                <Image
                  key={`m-${src}-${i}`}
                  src={src}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={[
                    "object-cover transition-opacity duration-700 ease-out",
                    i === mobileIndex ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
              {mobileSlides.length > 1 ? (
                <SlideDots count={mobileSlides.length} index={mobileIndex} />
              ) : null}
            </div>

            <div className="relative hidden aspect-video sm:block">
              {desktopSlides.map((src, i) => (
                <Image
                  key={`d-${src}-${i}`}
                  src={src}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1280px) 70vw, 960px"
                  className={[
                    "object-cover transition-opacity duration-700 ease-out",
                    i === desktopIndex ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
              {desktopSlides.length > 1 ? (
                <SlideDots count={desktopSlides.length} index={desktopIndex} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Compact right→left ticker across the full hero image width.
 * Two equal halves + translateX(-50%) = seamless loop (no jump).
 * Subtle chrome — muted bar, not brand fill.
 */
function HeroMarquee({
  items,
  divider,
}: {
  items: string[];
  divider: string;
}) {
  // Repeat items so a short list still fills the viewport before looping.
  const sequence = useMemo(() => {
    const base = items.length > 0 ? items : [];
    const out: string[] = [];
    while (out.length < 8) out.push(...base);
    return out;
  }, [items]);

  const half = (
    <div className="flex shrink-0 items-center gap-8 px-4 whitespace-nowrap sm:gap-10 sm:px-5">
      {sequence.map((segment, j) => (
        <Fragment key={j}>
          <span className="text-[11px] font-medium tracking-wide text-[var(--foreground)] sm:text-xs">
            {segment}
          </span>
          <span
            className="text-[10px] text-[var(--muted-foreground)]"
            aria-hidden
          >
            {divider}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="relative z-10 shrink-0 overflow-hidden border-b border-[var(--border)] bg-[var(--muted)] py-1.5 select-none sm:py-2">
      <div className="animate-marquee-rtl">
        {half}
        <div className="flex shrink-0 items-center gap-8 px-4 whitespace-nowrap sm:gap-10 sm:px-5" aria-hidden>
          {sequence.map((segment, j) => (
            <Fragment key={`dup-${j}`}>
              <span className="text-[11px] font-medium tracking-wide text-[var(--foreground)] sm:text-xs">
                {segment}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {divider}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Dots overlaid on the banner (bottom-center), auto-advance only. */
function SlideDots({ count, index }: { count: number; index: number }) {
  return (
    <div
      className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 rounded-full transition-all duration-300",
            i === index
              ? "w-5 bg-[var(--brand)]"
              : "w-1.5 bg-white/85 ring-1 ring-black/10",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
