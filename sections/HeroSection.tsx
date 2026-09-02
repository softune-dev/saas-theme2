"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
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

/** Default marquee fallback items when no custom announcement text is configured. */
const DEFAULT_MARQUEE_ITEMS = [
  "FREE SHIPPING ON ORDERS OVER ৳2,500",
  "CASH ON DELIVERY AVAILABLE NATIONWIDE",
  "EASY 7-DAY RETURNS & EXCHANGES",
];

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
  // rendering clean skeleton blocks with + icon and aspect ratio labels.
  const desktopSlides = wide.length > 0 ? wide : [];
  const mobileSlides = square.length > 0 ? square : desktopSlides;

  const desktopIndex = useSlideIndex(desktopSlides.length);
  const mobileIndex = useSlideIndex(mobileSlides.length);

  const customAnnouncementItems = useMemo(
    () =>
      (settings.announcementItems ?? [])
        .map((s) => s.trim())
        .filter(Boolean),
    [settings.announcementItems],
  );
  const marqueeItems =
    customAnnouncementItems.length > 0
      ? customAnnouncementItems
      : DEFAULT_MARQUEE_ITEMS;
  const divider = settings.announcementDivider?.trim() || "·";

  // Category rail layout: Max 9 categories total.
  // Fills all remaining slots up to 9 with skeletons.
  const displayCategories = categories.slice(0, 9);
  const realCount = displayCategories.length;
  const skeletonCount = Math.max(0, 9 - realCount);

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-4">
      {/* Image column owns height (marquee + 16:9). Category rail is absolute
       * so it cannot stretch the card — it only fills that fixed height. */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <aside className="absolute inset-y-0 left-0 z-10 hidden w-56 flex-col border-r border-[var(--border)] bg-white lg:flex xl:w-64">
          <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {displayCategories.map((cat) => (
              <li
                key={cat.id}
                className="flex h-[52px] shrink-0 border-b border-[var(--border)] last:border-b-0"
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group/cat flex h-full w-full items-center px-4 text-sm font-semibold text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--brand)]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3 transition-transform duration-200 group-hover/cat:translate-x-1">
                    <FeatureIcon
                      name={cat.icon || "package"}
                      className="size-5 shrink-0 text-[var(--foreground)] transition-colors duration-200 group-hover/cat:text-[var(--brand)]"
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
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <li
                key={`skel-${i}`}
                className="flex h-[52px] shrink-0 items-center gap-3 border-b border-[var(--border)] px-4 select-none last:border-b-0"
              >
                <div className="size-5 shrink-0 rounded-md bg-[var(--muted)]" />
                <div className="h-4 w-28 rounded-md bg-[var(--muted)]" />
              </li>
            ))}
          </ul>
          <div className="mt-auto flex shrink-0 items-center justify-center border-t border-[var(--border)] px-4 py-3.5">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-sm font-semibold tracking-normal text-[var(--brand)] transition-opacity hover:opacity-80"
            >
              View all categories
              <ChevronRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-col bg-white lg:pl-56 xl:pl-64">
          <HeroMarquee items={marqueeItems} divider={divider} />

          <div className="relative w-full overflow-hidden leading-none">
            {/* Mobile: 1:1 aspect crop or skeleton block with centered large + icon (no background circle) and 1:1 label */}
            <div className="relative aspect-square overflow-hidden bg-[var(--muted)] sm:hidden">
              {mobileSlides.length > 0 ? (
                <>
                  {mobileSlides.map((src, i) => (
                    <Image
                      key={`m-${src}-${i}`}
                      src={src}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className={[
                        "object-cover object-center transition-opacity duration-700 ease-out",
                        i === mobileIndex ? "opacity-100" : "opacity-0",
                      ].join(" ")}
                    />
                  ))}
                  {mobileSlides.length > 1 ? (
                    <SlideDots count={mobileSlides.length} index={mobileIndex} />
                  ) : null}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none">
                  <Plus className="mb-2 size-9 text-[var(--foreground)]" strokeWidth={2} />
                  <span className="text-base font-bold text-[var(--foreground)]">
                    Add hero image
                  </span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                    1:1
                  </span>
                </div>
              )}
            </div>

            {/* Desktop: 16:9 aspect crop or skeleton block with + icon (with background circle) and 16:9 label */}
            <div className="relative hidden aspect-video overflow-hidden bg-[var(--muted)] sm:block">
              {desktopSlides.length > 0 ? (
                <>
                  {desktopSlides.map((src, i) => (
                    <Image
                      key={`d-${src}-${i}`}
                      src={src}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 70vw, 1024px"
                      className={[
                        "object-contain object-top transition-opacity duration-700 ease-out",
                        i === desktopIndex ? "opacity-100" : "opacity-0",
                      ].join(" ")}
                    />
                  ))}
                  {desktopSlides.length > 1 ? (
                    <SlideDots count={desktopSlides.length} index={desktopIndex} />
                  ) : null}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center select-none">
                  <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-xs">
                    <Plus className="size-7" strokeWidth={2} />
                  </div>
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    Add hero image
                  </span>
                  <span className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                    16:9
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SlideDots({ count, index }: { count: number; index: number }) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur-xs">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 rounded-full transition-all duration-300",
            i === index ? "w-5 bg-white" : "w-1.5 bg-white/50",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function HeroMarquee({
  items,
  divider,
}: {
  items: string[];
  divider: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--brand)] py-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-fg)]">
      <div className="animate-marquee-rtl flex items-center gap-8 whitespace-nowrap">
        {items.concat(items, items, items).map((text, i) => (
          <Fragment key={`${text}-${i}`}>
            <span>{text}</span>
            <span aria-hidden className="opacity-60">
              {divider}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
