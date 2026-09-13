"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Event } from "@/lib/theme-types";

/** sessionStorage, not localStorage — reappears on a fresh visit tomorrow
 * instead of being dismissed forever the first time anyone closes it, but
 * doesn't re-show on every page navigation within one visit. Keyed by
 * event id so a merchant switching which event is the popup (or editing
 * this one) doesn't get suppressed by an old dismissal. */
function dismissKey(eventId: string): string {
  return `popup-dismissed-${eventId}`;
}

/** The one event (if any) a merchant has flagged as the storefront popup —
 * independent of whether it's also featured in the homepage Events
 * section. Renders nothing when there isn't one. */
export function EventPopupModal({ event }: { event: Event | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!event) return;
    try {
      if (sessionStorage.getItem(dismissKey(event.id))) return;
    } catch {
      /* sessionStorage may be blocked — fall through and just show it */
    }
    // A short delay reads as intentional, not a jump-scare before the page
    // has even rendered.
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [event]);

  function close() {
    setOpen(false);
    if (event) {
      try {
        sessionStorage.setItem(dismissKey(event.id), "1");
      } catch {
        /* nothing to persist if storage is blocked; it'll just show again */
      }
    }
  }

  if (!event) return null;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={event.name}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={[
              "relative z-10 grid w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
              event.imageOnly ? "max-w-md grid-cols-1" : "max-w-xl grid-cols-1 sm:grid-cols-2",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            {event.imageOnly ? (
              // The image itself IS the event — text is already baked into
              // the artwork, so the whole thing is just a clickable banner.
              <Link
                href={`/shop?event=${encodeURIComponent(event.slug)}`}
                onClick={close}
                aria-label={event.name}
                className="relative aspect-square w-full bg-[var(--muted)]"
              >
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 448px"
                    className="object-cover"
                    priority
                  />
                ) : null}
              </Link>
            ) : (
              <>
                <div className="relative aspect-[4/3] w-full bg-[var(--muted)] sm:aspect-auto">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  ) : null}
                </div>

                <div className="flex flex-col justify-center gap-3 p-6 text-center sm:p-8 sm:text-left">
                  {event.discountPercent > 0 ? (
                    <span className="inline-flex w-fit items-center justify-center self-center rounded-full bg-[var(--brand)]/10 px-3 py-1 text-xs font-bold text-[var(--brand)] sm:self-start">
                      {event.discountPercent}% OFF
                    </span>
                  ) : null}
                  <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    {event.name}
                  </h2>
                  {event.description ? (
                    <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {event.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/shop?event=${encodeURIComponent(event.slug)}`}
                    onClick={close}
                    className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90 sm:w-fit"
                  >
                    {event.ctaLabel || "Shop now"}
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
