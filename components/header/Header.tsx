"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  User,
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
 *  1. Top: logo · search · account · cart total
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
      {/* Top bar: logo · search · actions */}
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

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Link
            href="/contact"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex"
            aria-label="Account / support"
          >
            <User className="size-4" />
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            // Mobile: icon-only circle; sm+: pill with total (unchanged)
            className="relative inline-flex size-10 items-center justify-center rounded-full bg-[var(--brand)] text-white sm:size-auto sm:gap-2 sm:rounded-[var(--theme-btn-radius)] sm:px-3 sm:py-2"
            aria-label={`Cart, ${itemCount} items`}
          >
            <span className="relative">
              <ShoppingCart className="size-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--brand)]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </span>
            <span className="hidden text-xs font-semibold tabular-nums sm:inline">
              {formatTaka(subtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <form
        onSubmit={onSearch}
        className="border-t border-[var(--border)] px-3 py-2 sm:hidden"
      >
        <div className="flex overflow-hidden rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--muted)]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-[var(--brand)] px-3 text-white"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      {/* Single desktop nav row: All Categories dropdown + page links */}
      <nav
        aria-label="Main"
        className="hidden border-t border-[var(--border)] bg-[var(--muted)] lg:block"
      >
        <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-3 py-1.5 sm:px-4">
          <div ref={catsRef} className="relative shrink-0">
            <button
              type="button"
              aria-expanded={catsOpen}
              aria-haspopup="menu"
              onClick={() => setCatsOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-3.5 py-2.5 text-sm font-bold text-white"
            >
              <Menu className="size-4" strokeWidth={2.5} />
              All Categories
              <ChevronDown
                className={`size-4 transition-transform ${catsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {catsOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-1.5 max-h-[min(70vh,28rem)] w-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-white py-1.5 shadow-xl"
              >
                <Link
                  href="/categories"
                  role="menuitem"
                  onClick={() => setCatsOpen(false)}
                  className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--muted)]"
                >
                  View all departments
                  <ChevronRight className="size-3.5" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    role="menuitem"
                    onClick={() => setCatsOpen(false)}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--brand)]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FeatureIcon
                        name={cat.icon || "package"}
                        className="size-4 shrink-0 text-[var(--muted-foreground)]"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <Suspense fallback={<div className="min-w-0 flex-1 pl-2" />}>
            <NavLinksBar links={settings.navLinks} />
          </Suspense>
        </div>
      </nav>

      {/* Mobile drawer — slide in from the left (not instant) */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.85 }}
              className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <SiteLogo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-[var(--muted-foreground)]"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Menu
                </p>
                <Suspense fallback={null}>
                  <MobileNavLinks
                    links={settings.navLinks}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </Suspense>
                <p className="mt-4 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    <FeatureIcon
                      name={cat.icon || "package"}
                      className="size-4 shrink-0 text-[var(--foreground)]"
                      strokeWidth={1.75}
                    />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MobileNavLinks({
  links,
  onNavigate,
}: {
  links: NavLink[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";
  const items = useMemo(() => withHomeLink(links), [links]);

  return (
    <>
      {items.map((link) => {
        const active = isNavActive(pathname, search, link.path);
        return (
          <Link
            key={link.id}
            href={link.path || "/"}
            onClick={onNavigate}
            className={[
              "block rounded-lg px-3 py-2.5 text-sm font-medium",
              active
                ? "bg-[var(--brand)]/10 font-semibold text-[var(--brand)]"
                : "text-[var(--foreground)] hover:bg-[var(--muted)]",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
