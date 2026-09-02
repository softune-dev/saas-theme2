"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { FeatureIcon } from "@/lib/icon-map";

/**
 * Trust / feature strip under the hero — theme feature1–3 only.
 * No card chrome/background; sits light under the hero.
 */
export function FeaturesSection() {
  const { settings } = useTheme();

  const filtered = [
    {
      title: settings.feature1Title?.trim(),
      body: settings.feature1?.trim(),
      iconName: settings.feature1IconKind === "icon" ? (settings.feature1Icon || "grid-3x3") : undefined,
      image: settings.feature1IconKind === "image" ? settings.feature1Image : undefined,
    },
    {
      title: settings.feature2Title?.trim(),
      body: settings.feature2?.trim(),
      iconName: settings.feature2IconKind === "icon" ? (settings.feature2Icon || "tag") : undefined,
      image: settings.feature2IconKind === "image" ? settings.feature2Image : undefined,
    },
    {
      title: settings.feature3Title?.trim(),
      body: settings.feature3?.trim(),
      iconName: settings.feature3IconKind === "icon" ? (settings.feature3Icon || "truck") : undefined,
      image: settings.feature3IconKind === "image" ? settings.feature3Image : undefined,
    },
  ].filter((item) => item.title || item.body);

  const items: Array<{
    title?: string;
    body?: string;
    iconName?: string;
    image?: string;
  }> =
    filtered.length > 0
      ? filtered
      : [
          {
            title: "Nationwide Delivery",
            body: "Fast and reliable shipping to your doorstep across Bangladesh.",
            iconName: "truck",
            image: undefined,
          },
          {
            title: "Secure Payment",
            body: "Cash on delivery, bKash, Nagad, and secure card payment.",
            iconName: "shield-check",
            image: undefined,
          },
          {
            title: "Guaranteed Quality",
            body: "100% authentic curated products with easy customer support.",
            iconName: "badge-check",
            image: undefined,
          },
        ];

  const colClass =
    items.length === 1
      ? "grid-cols-1"
      : items.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";

  return (
    // Hidden on small screens — trust strip is desktop/tablet chrome only.
    <section className="mx-auto hidden max-w-[1280px] px-3 py-4 sm:block sm:px-4">
      <div className={`grid gap-3 sm:gap-4 ${colClass}`}>
        {items.map((item, i) => (
          <div
            key={`${item.title ?? ""}-${i}`}
            className="flex flex-row items-center justify-start gap-3 p-1"
          >
            {item.image ? (
              <span className="relative size-8 shrink-0 overflow-hidden sm:size-9">
                <Image src={item.image} alt="" fill className="object-contain" />
              </span>
            ) : (
              <FeatureIcon
                name={item.iconName ?? "grid-3x3"}
                className="size-7 shrink-0 text-[var(--brand)] sm:size-8"
                strokeWidth={1.5}
              />
            )}
            <div className="min-w-0 text-left">
              {item.title ? (
                <p className="text-left text-sm font-semibold text-[var(--foreground)]">
                  {item.title}
                </p>
              ) : null}
              {item.body ? (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {item.body}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
