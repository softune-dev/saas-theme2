"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { SiteLogo } from "@/components/brand/SiteLogo";

export function Footer() {
  const { settings } = useTheme();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
        <div className="flex flex-col items-center space-y-3 sm:col-span-2 sm:items-start lg:col-span-1">
          <SiteLogo />
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
            {settings.footerDescription || settings.tagline}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/payment.png"
            alt="Accepted payment methods"
            className="mt-2 h-auto w-full max-w-[280px] object-contain object-center sm:max-w-[320px] sm:object-left"
          />
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            {settings.footerShopLabel || "Shop"}
          </h3>
          <ul className="mt-3 space-y-2">
            {settings.footerShopLinks.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.path || "/shop"}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            {settings.footerCompanyLabel || "Company"}
          </h3>
          <ul className="mt-3 space-y-2">
            {settings.footerCompanyLinks.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.path || "/"}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Help
          </h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/faq" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]">
                Contact support
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--brand)]">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
      </div>
    </footer>
  );
}
