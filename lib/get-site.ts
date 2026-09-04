import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
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

  // The real visitor IP (set by middleware.ts from the INBOUND request,
  // before it's threaded here) — forwarded explicitly as X-Original-Client-IP
  // on this OUTBOUND call, since this fetch() is a brand-new connection
  // from this app's own server and carries none of the original request's
  // networking context otherwise. Without this, app/main.py's ip_block
  // middleware never sees a blocked visitor's real IP for any
  // server-rendered page — only client-side calls (checkout) would
  // actually be blocked. NOT X-Forwarded-For: confirmed empirically that
  // the backend's own reverse proxy (Caddy) overwrites that header with
  // whatever it sees as the immediate connection peer (this server's own
  // outbound IP, not the original visitor's) — a custom header name passes
  // through untouched.
  const clientIp = (await headers()).get("x-real-client-ip");

  // redirect() throws a special NEXT_REDIRECT sentinel Next.js's own
  // runtime relies on — it must propagate past this function untouched, so
  // the network try/catch below only ever wraps the fetch itself, never a
  // redirect() call, or our own catch would silently swallow it and break
  // the redirect entirely.
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/public/site/${host}`, {
      headers: clientIp ? { "X-Original-Client-IP": clientIp } : undefined,
      // A build-time static-generation call to a slow or unreachable
      // backend must fail fast, not hang — Vercel gives each page 60s
      // before retrying (3x) and failing the whole build, and an
      // AbortSignal-less fetch has no ceiling of its own to stop that.
      signal: AbortSignal.timeout(10_000),
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: [`site-${host}`] } }),
    });
  } catch {
    return null;
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => null);
    if (body?.detail?.code === "ip_blocked") {
      // redirect() works from anywhere — including the root layout,
      // unlike notFound() (see getSiteConfig's own comment below on that
      // restriction) — so this one check covers every page and the
      // layout in one place.
      redirect("/blocked");
    }
  }

  if (!res.ok) return null;
  return (await res.json()) as PublicSiteConfig;
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

/** Turns a resolved page SEO block into real Next.js Metadata — every page
 * used to hand-write its own `{ title: "..." }`, which meant a static
 * label with no site name suffix (About/FAQ/Terms/...) or, worse, no
 * metadata at all (Contact), silently inheriting whatever the root layout
 * happened to render for a completely different page. Real merchant-entered
 * values (Site Settings → SEO) flow through automatically once a page uses
 * this instead. */
export function buildMetadata(seo: ResolvedPageSeo): Metadata {
  return {
    // { absolute } opts out of any title.template a parent layout sets —
    // seo.title already has the merchant's title_suffix appended
    // server-side (app/api/public.py's _resolve_seo), so without this a
    // template would double-suffix it.
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      url: seo.canonical,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.noindex,
    },
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
