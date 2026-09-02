"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Plus, X } from "lucide-react";
import type { Event, Product, ProductCategory } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";
import { Footer } from "@/components/footer/Footer";

const PRICE_RANGES = [
  "All",
  "Under ৳1,000",
  "৳1,000 - ৳3,000",
  "Over ৳3,000",
] as const;

const SORT_OPTIONS = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
  "Newest",
] as const;

type ShopPageClientProps = {
  categories: ProductCategory[];
  products: Product[];
  events: Event[];
};

/**
 * Aurora-style shop shell for Bazaar: full-width category banner, sticky
 * left filter rail (category / price / sort), product grid. Demo catalog
 * for now — same layout contract as Aurora's ShopPageClient.
 */
export function ShopPageClient({
  categories: allCategories,
  products: allProducts,
  events,
}: ShopPageClientProps) {
  const searchParams = useSearchParams();

  const categoryNames = useMemo(
    () => ["All", ...allCategories.map((c) => c.name)],
    [allCategories],
  );

  // URL may use slug (?category=electronics) or name — resolve to display name.
  const categoryFromUrl = useMemo(() => {
    const raw = searchParams.get("category");
    if (!raw) return "All";
    const bySlug = allCategories.find(
      (c) => c.slug.toLowerCase() === raw.toLowerCase(),
    );
    if (bySlug) return bySlug.name;
    return (
      categoryNames.find((c) => c.toLowerCase() === raw.toLowerCase()) ?? "All"
    );
  }, [searchParams, allCategories, categoryNames]);

  const filterFromUrl = searchParams.get("filter") || "";
  const sortFromUrl = searchParams.get("sort") || "";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  // Same graceful fallback as category — resolves to null (no filter) when
  // the slug doesn't match any real event.
  const eventFromUrl = useMemo(() => {
    const raw = searchParams.get("event");
    if (!raw) return null;
    return events.find((e) => e.slug.toLowerCase() === raw.toLowerCase()) ?? null;
  }, [searchParams, events]);

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(eventFromUrl);
  const [selectedPrice, setSelectedPrice] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>(() => {
    if (sortFromUrl === "new") return "Newest";
    if (sortFromUrl === "price-asc") return "Price: Low to High";
    if (sortFromUrl === "price-desc") return "Price: High to Low";
    if (filterFromUrl === "featured") return "Featured";
    return "Featured";
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setSelectedEvent(eventFromUrl);
  }, [eventFromUrl]);

  useEffect(() => {
    if (sortFromUrl === "new") setSelectedSort("Newest");
    else if (sortFromUrl === "price-asc") setSelectedSort("Price: Low to High");
    else if (sortFromUrl === "price-desc") setSelectedSort("Price: High to Low");
    else if (filterFromUrl === "featured") setSelectedSort("Featured");
  }, [sortFromUrl, filterFromUrl]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }
    // Event filter — a product's id must be in the event's own productIds,
    // not a name/slug match like category (a product has no eventSlug).
    if (selectedEvent) {
      result = result.filter((p) => selectedEvent.productIds.includes(p.id));
    }
    if (filterFromUrl === "featured") {
      result = result.filter((p) => p.featured);
    }
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (selectedPrice === "Under ৳1,000") {
      result = result.filter((p) => p.price < 1000);
    } else if (selectedPrice === "৳1,000 - ৳3,000") {
      result = result.filter((p) => p.price >= 1000 && p.price <= 3000);
    } else if (selectedPrice === "Over ৳3,000") {
      result = result.filter((p) => p.price > 3000);
    }

    if (selectedSort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "Highest Rated") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "Newest") {
      result.reverse();
    } else if (selectedSort === "Featured") {
      result.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }

    return result;
  }, [
    allProducts,
    selectedCategory,
    selectedEvent,
    selectedPrice,
    selectedSort,
    filterFromUrl,
    q,
  ]);

  const displayTitle = selectedEvent
    ? selectedEvent.name
    : filterFromUrl === "featured"
      ? "Best Sellers"
      : sortFromUrl === "new" || selectedSort === "Newest"
        ? "New Arrivals"
        : q
          ? `Results for “${q}”`
          : selectedCategory === "All"
            ? "All Products"
            : selectedCategory;

  // Category banner from catalog; "All" falls back to first available
  // banner. An active event's own image takes precedence over both.
  const firstBanner = allCategories.find((c) => c.banner)?.banner || "";
  const currentBanner = selectedEvent?.image
    ? selectedEvent.image
    : selectedCategory === "All"
      ? firstBanner
      : allCategories.find((c) => c.name === selectedCategory)?.banner ||
        firstBanner;

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedPrice("All");
    setSelectedSort("Featured");
  };

  const filtersDirty =
    selectedCategory !== "All" ||
    selectedPrice !== "All" ||
    selectedSort !== "Featured";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Category banner */}
      <div className="relative flex h-[22vh] w-full items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--foreground)] md:h-[28vh]">
        {currentBanner ? (
          <Image
            src={currentBanner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80 transition-all duration-700"
          />
        ) : (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--foreground)] shadow-xs border border-[var(--border)] backdrop-blur-xs">
            <Plus className="size-3.5" strokeWidth={2} />
            <span>Add category image</span>
          </div>
        )}
        <div className="absolute inset-0 z-0 bg-black/45" />
        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-white">
          <motion.h1
            key={displayTitle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl"
          >
            {displayTitle}
          </motion.h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-12">
        {/* Mobile filter toggle */}
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3 md:hidden">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            {filteredProducts.length} result
            {filteredProducts.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--foreground)]"
          >
            {showMobileFilters ? (
              <X className="size-4" />
            ) : (
              <Filter className="size-4" />
            )}
            Filters
          </button>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:gap-12 lg:gap-16">
          {/* Left filter rail */}
          <aside
            className={`w-full shrink-0 md:w-56 lg:w-60 ${
              showMobileFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="sticky top-28 space-y-8">
              <FilterGroup title="Category">
                <ul className="space-y-2.5">
                  {categoryNames.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(c);
                          setShowMobileFilters(false);
                        }}
                        className={[
                          "block w-full text-left text-sm transition-colors",
                          selectedCategory === c
                            ? "font-bold text-[var(--brand)]"
                            : "font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                        ].join(" ")}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </FilterGroup>

              <FilterGroup title="Price">
                <ul className="space-y-2.5">
                  {PRICE_RANGES.map((p) => (
                    <li key={p}>
                      <RadioRow
                        name="price"
                        label={p}
                        checked={selectedPrice === p}
                        onChange={() => setSelectedPrice(p)}
                      />
                    </li>
                  ))}
                </ul>
              </FilterGroup>

              <FilterGroup title="Sort by">
                <ul className="space-y-2.5">
                  {SORT_OPTIONS.map((s) => (
                    <li key={s}>
                      <RadioRow
                        name="sort"
                        label={s}
                        checked={selectedSort === s}
                        onChange={() => setSelectedSort(s)}
                      />
                    </li>
                  ))}
                </ul>
              </FilterGroup>

              {filtersDirty ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 hidden items-center justify-between border-b border-[var(--border)] pb-3 md:flex">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"} found
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.28 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No products match your current filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-[var(--brand)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function RadioRow({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5">
      <span
        className={[
          "flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked
            ? "border-[var(--brand)] bg-[var(--brand)]"
            : "border-[var(--border)] group-hover:border-[var(--muted-foreground)]",
        ].join(" ")}
      >
        {checked ? (
          <span className="size-1.5 rounded-full bg-white" />
        ) : null}
      </span>
      <span
        className={[
          "text-sm transition-colors",
          checked
            ? "font-semibold text-[var(--foreground)]"
            : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]",
        ].join(" ")}
      >
        {label}
      </span>
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}
