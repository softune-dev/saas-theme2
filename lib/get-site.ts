import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { PublicSiteConfig, ResolvedPageSeo, Product, SiteEditorSettings } from "./theme-types";
import { defaultSettings } from "./sample-data";
import { getSiteCategories, getSiteProducts } from "./public-catalog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

const DEFAULT_SITE_HOST =
  process.env.NEXT_PUBLIC_SITE_HOST || process.env.SITE_HOST || "bazaar.local";

// x-preview-site-host (set by middleware.ts from ?__site=/the preview
// cookie) wins over everything — it's how the dashboard's editor iframe
// previews a specific site on the shared Vercel deployment. Checked before
// x-forwarded-host on purpose: Vercel's edge resets x-forwarded-host to the
// real request host after middleware runs, so it can never carry the
// override there — only a non-reserved custom header can.
export async function getSiteHost(): Promise<string> {
  try {
    const headersList = await headers();
    const hostHeader =
      headersList.get("x-preview-site-host") ||
      headersList.get("x-forwarded-host") ||
      headersList.get("host") ||
      DEFAULT_SITE_HOST;
    return hostHeader.split(":")[0];
  } catch {
    return DEFAULT_SITE_HOST;
  }
}

/**
 * Fetch the published site configuration from the backend API
 * (/public/site/{host}).
 *
 * No fake-data fallback here on purpose. A site that genuinely doesn't
 * exist or isn't published is a 404 on the backend too (see
 * _find_published_site in app/api/public.py) — rendering fabricated
 * business content instead would mean a broken/misconfigured deployment
 * silently shows a fictional store instead of failing loudly.
 */
export async function fetchSiteConfig(
  providedHost?: string,
): Promise<PublicSiteConfig | null> {
  const host = providedHost || (await getSiteHost());

  try {
    const res = await fetch(`${API_BASE_URL}/public/site/${host}`, {
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: [`site-${host}`] } }),
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicSiteConfig;
  } catch {
    return null;
  }
}

/** Same fetch, but calls notFound() instead of returning null — see
 * layout.tsx for the one place that needs the raw nullable version
 * (notFound() is illegal in the root layout). */
export async function getSiteConfig(providedHost?: string): Promise<PublicSiteConfig> {
  const config = await fetchSiteConfig(providedHost);
  if (!config) notFound();
  return config;
}

export function resolveTheme(config: PublicSiteConfig): SiteEditorSettings {
  const remote = config.site.theme as Partial<SiteEditorSettings> | undefined;
  if (!remote || Object.keys(remote).length === 0) return defaultSettings;
  // Merge so demo-only fields still exist when the API returns a partial theme.
  // Prefer this template's marketplace section order when the remote blob
  // didn't ship a sections array (common for partial color-only themes).
  const merged: SiteEditorSettings = {
    ...defaultSettings,
    ...remote,
    sections: remote.sections?.length
      ? remote.sections
      : defaultSettings.sections,
  };
  return merged;
}

export async function getPageSeo(
  slug: string,
  providedHost?: string,
): Promise<ResolvedPageSeo> {
  const host = providedHost || (await getSiteHost());
  const config = await getSiteConfig(host);
  const normalized = slug.replace(/^\//, "").replace(/\/$/, "");
  const page = config.pages.find((p) => {
    const s = p.slug.replace(/^\//, "").replace(/\/$/, "");
    return s === normalized;
  });
  if (page?.seo) return page.seo;

  const siteName = config.site.name || defaultSettings.siteName;
  const baseUrl = `https://${host}`;
  return {
    title: `${normalized || "Home"} | ${siteName}`,
    description: config.site.business?.description || defaultSettings.tagline,
    canonical: `${baseUrl}/${normalized}`.replace(/\/$/, "") || `${baseUrl}/`,
    noindex: false,
  };
}

export function generateProductJsonLd(product: Product, host: string) {
  const baseUrl = `https://${host}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: defaultSettings.siteName },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/shop/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export async function getSiteSitemap(providedHost?: string) {
  const host = providedHost || (await getSiteHost());
  const baseUrl = `https://${host}`;
  const config = await getSiteConfig(host);
  const entries: {
    url: string;
    lastModified: Date;
    changeFrequency: "daily" | "weekly";
    priority: number;
  }[] = [];

  for (const page of config.pages) {
    if (!page.seo.noindex) {
      entries.push({
        url: page.seo.canonical,
        lastModified: new Date(),
        changeFrequency: page.path === "/" ? "daily" : "weekly",
        priority: page.path === "/" ? 1 : 0.8,
      });
    }
  }
  // Real categories/products, not sample data — a sitemap submitted to
  // Google with fake product URLs is worse than one that's merely
  // incomplete.
  const [categories, products] = await Promise.all([
    getSiteCategories(host),
    getSiteProducts(host),
  ]);
  for (const cat of categories) {
    entries.push({
      url: `${baseUrl}/shop?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const product of products) {
    entries.push({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }
  return entries;
}
