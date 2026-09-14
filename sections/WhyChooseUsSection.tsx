"use client";

import { Plus } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function WhyChooseUsSection() {
  const { settings } = useTheme();
  const points = [
    { title: settings.why1Title, body: settings.why1 },
    { title: settings.why2Title, body: settings.why2 },
    { title: settings.why3Title, body: settings.why3 },
  ].filter((p) => p.title || p.body);
  const hasImage = Boolean(settings.whyImage);

  // Note: Section visibility toggle would require an on/off mechanism in the editor schema, which currently manages sections via array inclusion/reordering.
  return (
    <section className="mx-auto max-w-[1280px] px-3 py-8 sm:px-4 sm:py-12">
      <div className="grid items-center gap-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white lg:grid-cols-2">
        {/* Image side always shows the real upload the moment it exists,
            independent of whether the points below are filled in yet. No
            forced aspect ratio/crop on the real image — it renders at its
            own natural proportions instead of being cropped to fit a box. */}
        <div className="relative bg-[var(--muted)]">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.whyImage} alt="" className="block h-auto w-full" />
          ) : (
            <div className="flex aspect-[4/3] h-full w-full flex-col items-center justify-center p-6 text-center select-none lg:aspect-auto lg:min-h-[320px]">
              {/* Mobile: centered larger + icon without background circle */}
              <div className="flex flex-col items-center justify-center sm:hidden">
                <Plus className="mb-2 size-9 text-[var(--foreground)]" strokeWidth={2} />
                <span className="text-base font-bold text-[var(--foreground)]">
                  Add why choose us image
                </span>
              </div>

              {/* Desktop: white circle with + icon */}
              <div className="hidden flex-col items-center justify-center sm:flex">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-xs">
                  <Plus className="size-7" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  Add why choose us image
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {settings.whyTitle || "Why shop with us"}
          </h2>

          {points.length > 0 ? (
            <ul className="mt-6 space-y-5">
              {points.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Add your store&apos;s story, craft details, guarantees, or reasons customers can trust your brand.
              </p>
              <ul className="mt-6 space-y-5 select-none">
                {[1, 2, 3].map((num) => (
                  <li key={num} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--muted-foreground)]">
                      {num}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 bg-[var(--muted)] rounded" />
                      <div className="h-3.5 w-full max-w-sm bg-[var(--muted)]/70 rounded" />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
