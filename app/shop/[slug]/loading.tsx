/** Instant skeleton while the product/related-products fetch resolves —
 * without this, navigating from a product card to its detail page showed a
 * blank white page for the full fetch duration instead of any feedback. */
export default function Loading() {
  return (
    <section className="mx-auto mt-6 grid w-full max-w-[1280px] flex-1 animate-pulse gap-8 px-4 sm:px-6 md:mt-8 md:grid-cols-2 md:gap-12 md:px-8">
      <div className="aspect-square w-full rounded-xl bg-[var(--muted)]" />
      <div className="flex flex-col gap-4 pt-2">
        <div className="h-4 w-24 rounded bg-[var(--muted)]" />
        <div className="h-7 w-3/4 rounded bg-[var(--muted)]" />
        <div className="h-5 w-32 rounded bg-[var(--muted)]" />
        <div className="mt-2 h-4 w-full rounded bg-[var(--muted)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--muted)]" />
        <div className="mt-4 h-12 w-full rounded-[var(--theme-btn-radius)] bg-[var(--muted)]" />
      </div>
    </section>
  );
}
