"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { EditorTestimonial } from "@/lib/theme-types";

export function TestimonialsSection({
  testimonialsTitle,
  testimonials,
}: {
  testimonialsTitle: string;
  testimonials: EditorTestimonial[];
}) {
  // No fabricated reviews — empty list means the section stays hidden.
  const list = (testimonials ?? []).filter(
    (t) => (t.quote ?? "").trim() || (t.name ?? "").trim(),
  );

  const plugin = useRef(
    AutoScroll({ speed: 1.5, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: list.length > 1, align: "start", containScroll: "trimSnaps" },
    [plugin.current],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (list.length === 0) return null;

  const title = (testimonialsTitle ?? "").trim();

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        {title ? (
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {title}
          </h2>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 gap-2">
          <button
            onClick={scrollPrev}
            aria-label="Previous testimonials"
            className="rounded-full border border-[var(--border)] bg-white p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next testimonials"
            className="rounded-full border border-[var(--border)] bg-white p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab gap-3 pb-1 active:cursor-grabbing">
          {list.map((item) => (
            <div
              key={item.id}
              className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_47%] lg:flex-[0_0_32%]"
            >
              <div className="flex h-full min-h-[220px] flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5">
                <div className="space-y-3">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-[var(--foreground)]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[var(--muted)]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--foreground)]">{item.name}</p>
                    {item.role ? (
                      <p className="text-[11px] text-[var(--muted-foreground)]">{item.role}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
