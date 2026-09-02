"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Event } from "@/lib/theme-types";

const MAX_EVENTS = 3;

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/shop?event=${encodeURIComponent(event.slug)}`}
      className="group relative flex aspect-[16/9] w-full flex-col justify-end overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      {event.image ? (
        <Image
          src={event.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : null}
      {/* Gradient keeps left-aligned text legible over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative flex flex-col items-start gap-1.5 p-4 text-left sm:p-5">
        <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">
          {event.name}
        </h3>
        {event.description ? (
          <p className="max-w-xs text-xs leading-relaxed text-white/85 line-clamp-1 sm:line-clamp-2">
            {event.description}
          </p>
        ) : null}
        <span className="mt-1.5 inline-flex items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition-opacity group-hover:opacity-90">
          {event.ctaLabel || "Shop now"}
        </span>
      </div>
    </Link>
  );
}

function SkeletonEventCard({ index }: { index: number }) {
  return (
    <div className="relative flex aspect-[16/9] w-full flex-col items-start justify-end gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] select-none sm:p-5">
      <div className="mb-1 flex size-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
        <Plus className="size-4" strokeWidth={2} />
      </div>
      <span className="text-base font-bold tracking-tight text-[var(--muted-foreground)] sm:text-lg">
        Add event {index}
      </span>
      <div className="h-3.5 w-3/4 rounded bg-[var(--muted)]" />
      <div className="mt-1.5 h-8 w-28 rounded-[var(--theme-btn-radius)] bg-[var(--muted)]" />
    </div>
  );
}

/** Up to 3 merchant-featured sale/promo campaigns, right under Hero. Fully
 * curated — an empty/unresolved selectedEventIds always renders the
 * skeleton, never "show every active event" (same rule as
 * CategoryShowcaseSection's own comment for categories). */
export function EventsSection({
  selectedEventIds,
  events,
}: {
  selectedEventIds: string[];
  events: Event[];
}) {
  const selected =
    selectedEventIds?.length > 0
      ? selectedEventIds
          .map((id) => events.find((e) => e.id === id))
          .filter((e): e is Event => Boolean(e))
          .slice(0, MAX_EVENTS)
      : [];

  const isSkeleton = selected.length === 0;

  return (
    <section className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isSkeleton
          ? Array.from({ length: MAX_EVENTS }).map((_, i) => (
              <SkeletonEventCard key={i} index={i + 1} />
            ))
          : selected.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}
