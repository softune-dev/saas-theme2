"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme-context";

export function WhyChooseUsSection() {
  const { settings } = useTheme();
  const points = [
    { title: settings.why1Title, body: settings.why1 },
    { title: settings.why2Title, body: settings.why2 },
    { title: settings.why3Title, body: settings.why3 },
  ].filter((p) => p.title || p.body);

  if (points.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-8 sm:px-4 sm:py-12">
      <div className="grid items-center gap-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white lg:grid-cols-2">
        <div className="relative aspect-[4/3] bg-[var(--muted)] lg:aspect-auto lg:min-h-[320px]">
          {settings.whyImage ? (
            <Image
              src={settings.whyImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null}
        </div>
        <div className="p-5 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {settings.whyTitle || "Why shop with us"}
          </h2>
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
        </div>
      </div>
    </section>
  );
}
