"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { EditorTestimonial } from "@/lib/theme-types";

export function TestimonialsSection({
  testimonialsMode,
  testimonialsTitle,
  testimonials,
}: {
  testimonialsMode?: "cards" | "images";
  testimonialsTitle: string;
  testimonials: EditorTestimonial[];
}) {
  const isImages = testimonialsMode === "images";
  // No fabricated reviews — empty list means the section stays hidden.
  const list = (testimonials ?? []).filter((t) =>
    isImages ? (t.image ?? "").trim() : (t.quote ?? "").trim() || (t.name ?? "").trim(),
  );

  const isSkeleton = list.length === 0;

  const plugin = useRef(
    AutoScroll({ speed: 1.5, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: list.length > 1, align: "start", containScroll: "trimSnaps" },
    isSkeleton ? [] : [plugin.current],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const title = (testimonialsTitle ?? "").trim() || (isSkeleton ? "What Customers Say" : "");

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
          {isSkeleton
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_47%] lg:flex-[0_0_32%]"
                >
                  <div className="flex h-full min-h-[220px] flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 select-none">
                    <div className="space-y-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star key={sIdx} className="size-3.5 fill-slate-200 text-slate-200" />
                        ))}
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="h-3.5 w-full bg-[var(--muted)] rounded" />
                        <div className="h-3.5 w-5/6 bg-[var(--muted)] rounded" />
                        <div className="h-3.5 w-2/3 bg-[var(--muted)] rounded" />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="size-9 shrink-0 rounded-full bg-[var(--muted)]" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-[var(--muted)] rounded" />
                        <div className="h-2.5 w-14 bg-[var(--muted)] rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : list.map((item) =>
                isImages ? (
                  <div
                    key={item.id}
                    className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_38%] lg:flex-[0_0_26%]"
                  >
                    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                      <Image
                        src={item.image}
                        alt={item.name || "Customer screenshot"}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                ) : (
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
                ),
              )}
        </div>
      </div>
    </section>
  );
}
