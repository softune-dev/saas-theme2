"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Search,
  X,
} from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { useCart } from "@/components/cart/CartContext";
import { useTheme } from "@/lib/theme-context";
import { FeatureIcon } from "@/lib/icon-map";
import type { NavLink, ProductCategory } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";

/**
 * Marketplace header (reference pattern):
 *  1. Top: logo · search · wishlist · account · cart total
 *  2. One nav row: brand "All Categories" dropdown + editor navLinks inline
 * Active link: brand color + sliding underline (layoutId, not remounted).
 */

/** Match path + optional query so /shop and /shop?filter=featured don't both win. */
function isNavActive(
  pathname: string,
  search: string,
  path?: string,
): boolean {
  if (!path) return false;
  let pathBase = "/";
  let linkParams: URLSearchParams;
  try {
    const u = new URL(path, "http://local");
    pathBase = u.pathname || "/";
    linkParams = u.searchParams;
  } catch {
    const [base, q] = path.split("?");
    pathBase = base || "/";
    linkParams = new URLSearchParams(q ?? "");
  }

  if (pathBase === "/") return pathname === "/";
  if (pathname !== pathBase) return false;

  const current = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const keys = [...linkParams.keys()];
  if (keys.length > 0) {
    return keys.every((k) => current.get(k) === linkParams.get(k));
  }
  // Bare path (e.g. /shop) — only active when current URL has no query.
  return !search || search === "?";
}

/** Always show Home first even if the merchant cleared it from navLinks. */
function withHomeLink(links: NavLink[]): NavLink[] {
  const rest = links.filter((l) => {
    const p = (l.path || "/").split("?")[0] || "/";
    return p !== "/";
  });
  return [{ id: "nav-home", label: "Home", path: "/" }, ...rest];
}

function NavLinksBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";
  const items = useMemo(() => withHomeLink(links), [links]);

  return (
    <div className="relative flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto pl-2">
      {items.map((link) => {
        const active = isNavActive(pathname, search, link.path);
        return (
          <Link
            key={link.id}
            href={link.path || "/"}
            className={[
              "relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-bold transition-colors",
              active
                ? "text-[var(--brand)]"
                : "text-[var(--foreground)] hover:text-[var(--brand)]",
            ].join(" ")}
          >
            {link.label}
            {active ? (
              <motion.span
                layoutId="bazaar-nav-underline"
                className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[var(--brand)]"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                  mass: 0.6,
                }}
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function Header({
  categories = [],
}: {
  /** Real site categories from lib/public-catalog — not sample-data. */
  categories?: ProductCategory[];
}) {
  const { settings } = useTheme();
  const { itemCount, subtotal, openDrawer } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setMobileOpen(false);
  };

  // Close category flyout on outside click / Escape
  useEffect(() => {
    if (!catsOpen) return;
    function onPointer(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCatsOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [catsOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white">
      {/* Top bar: logo · search (desktop) · actions */}
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg text-[var(--foreground)] lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        <SiteLogo className="shrink-0" />

        {/* Desktop Search Bar */}
        <form
          onSubmit={onSearch}
          className="mx-auto hidden min-w-0 max-w-xl flex-1 sm:flex"
        >
          <div className="flex w-full overflow-hidden rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--muted)] focus-within:border-[var(--brand)]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="inline-flex items-center justify-center bg-[var(--brand)] px-3.5 text-white"
            >
              <Search className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Wishlist / Love Icon (Visual only) */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--brand)]"
            aria-label="Wishlist"
          >
            <Heart className="size-6.5 sm:size-7" strokeWidth={1.5} />
          </button>

          {/* Account Icon (uses public/assets/user.svg) */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--brand)]"
            aria-label="Account"
          >
            <span
              aria-hidden
              className="block size-6.5 bg-[var(--foreground)] transition-colors sm:size-7"
              style={{
                WebkitMaskImage: "url(/assets/user.svg)",
                maskImage: "url(/assets/user.svg)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex h-11 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-3 text-[var(--brand-fg)] sm:h-12 sm:gap-2.5 sm:px-3.5"
            aria-label={`Cart, ${itemCount} items`}
          >
            <span className="relative inline-flex shrink-0">
              <span
                aria-hidden
                className="block size-6 bg-[var(--brand-fg)] sm:size-7"
                style={{
                  WebkitMaskImage: "url(/assets/cart.svg)",
                  maskImage: "url(/assets/cart.svg)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold leading-none text-[var(--brand)]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </span>
            <span className="hidden text-sm font-bold tabular-nums tracking-tight sm:inline">
              {formatTaka(subtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row (Under top bar on mobile screens ONLY) */}
      <div className="border-t border-[var(--border)] bg-white px-3 py-2 sm:hidden">
        <form onSubmit={onSearch} className="flex min-w-0 flex-1">
          <div className="flex w-full overflow-hidden rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--muted)] focus-within:border-[var(--brand)]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="inline-flex items-center justify-center bg-[var(--brand)] px-3 text-white"
            >
              <Search className="size-3.5" strokeWidth={2.25} />
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Nav row: "All Categories" dropdown + inline page links */}
      <div className="hidden border-t border-[var(--border)] bg-white sm:block">
        <div className="mx-auto flex max-w-[1280px] items-stretch gap-2 px-3 sm:px-4">
          <div className="relative shrink-0 py-1.5" ref={catsRef}>
            <button
              type="button"
              onClick={() => setCatsOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-medium tracking-normal text-[var(--brand-fg)] transition-opacity hover:opacity-90"
              aria-expanded={catsOpen}
              aria-haspopup="true"
            >
              <Menu className="size-4 shrink-0" />
              <span>All Categories</span>
              <ChevronDown
                className={[
                  "size-4 shrink-0 transition-transform duration-200",
                  catsOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <AnimatePresence>
              {catsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-xl"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/shop?category=${encodeURIComponent(c.slug)}`}
                        onClick={() => setCatsOpen(false)}
                        className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--brand)]"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <FeatureIcon
                            name={c.icon || "package"}
                            className="size-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--brand)]"
                            strokeWidth={1.5}
                          />
                          <span className="truncate">{c.name}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[var(--brand)]" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-[var(--muted-foreground)]">
                      No categories yet
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Suspense
            fallback={
              <div className="h-9 min-w-0 flex-1 animate-pulse bg-[var(--muted)] rounded-lg" />
            }
          >
            <NavLinksBar links={settings.navLinks} />
          </Suspense>
        </div>
      </div>

      {/* Mobile drawer backdrop + sidebar menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-white p-5 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <SiteLogo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={onSearch} className="mt-4">
                <div className="flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products…"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[var(--brand)] px-3 text-white"
                  >
                    <Search className="size-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <nav className="space-y-1">
                    {withHomeLink(settings.navLinks).map((link) => (
                      <Link
                        key={link.id}
                        href={link.path || "/"}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Categories
                  </p>
                  <nav className="mt-2 space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                      >
                        <span className="flex items-center gap-2.5">
                          <FeatureIcon
                            name={cat.icon || "package"}
                            className="size-4 text-[var(--muted-foreground)]"
                          />
                          <span>{cat.name}</span>
                        </span>
                        <ChevronRight className="size-4 text-[var(--muted-foreground)]" />
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  <span
                    aria-hidden
                    className="block size-5 bg-[var(--foreground)]"
                    style={{
                      WebkitMaskImage: "url(/assets/user.svg)",
                      maskImage: "url(/assets/user.svg)",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                  <span>Sign In / Register</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
