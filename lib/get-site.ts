import { headers } from "next/headers";
import type { PublicSiteConfig, ResolvedPageSeo, Product, SiteEditorSettings } from "./theme-types";
import { defaultSettings, sampleCategories, sampleProducts } from "./sample-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

const DEFAULT_SITE_HOST =
  process.env.NEXT_PUBLIC_SITE_HOST || process.env.SITE_HOST || "bazaar.local";

export async function getSiteHost(): Promise<string> {
  try {
    const headersList = await headers();
    const hostHeader =
      headersList.get("x-forwarded-host") ||
      headersList.get("host") ||
      DEFAULT_SITE_HOST;
    return hostHeader.split(":")[0];
  } catch {
    return DEFAULT_SITE_HOST;
  }
}

/**
 * Demo-first fallback so this template runs standalone without the API.
 * When a real published site is available, that theme object wins.
 */
function createFallbackSiteConfig(host: string): PublicSiteConfig {
  const baseUrl = `https://${host}`;
  const theme = defaultSettings as unknown as Record<string, unknown>;

  const page = (
    slug: string,
    path: string,
    title: string,
    description: string,
  ) => ({
    slug,
    path,
    title,
    seo: {
      title: slug ? `${title} | ${defaultSettings.siteName}` : `${defaultSettings.siteName} — ${defaultSettings.tagline}`,
      description,
      canonical: `${baseUrl}${path === "/" ? "" : path}`,
      noindex: false,
      og_image: defaultSettings.heroImages[0] ?? "",
    },
  });

  return {
    site: {
      id: "fallback-bazaar-site-id",
      name: defaultSettings.siteName,
      template_key: "bazaar",
      framework: "nextjs",
      theme,
      business: {
        name: defaultSettings.siteName,
        type: "Store",
        description: defaultSettings.tagline,
        phone: "+8801700000000",
        email: "hello@bazaar.example",
        address: {
          street: "House 12, Road 5",
          city: "Dhaka",
          region: "Dhaka",
          postal_code: "1209",
          country: "BD",
        },
      },
      faqs: [
        {
          id: "faq-1",
          question: "How long does delivery take?",
          answer:
            "Inside Dhaka typically 1–2 business days; outside Dhaka 2–5 business days depending on your area.",
        },
        {
          id: "faq-2",
          question: "Do you offer cash on delivery?",
          answer: "Yes. COD is available on most products. Select it at checkout.",
        },
        {
          id: "faq-3",
          question: "What is your return policy?",
          answer:
            "Eligible items can be returned within 7 days of delivery if unused and in original packaging.",
        },
      ],
      legal: {
        privacy: {
          title: "Privacy Policy",
          content:
            "We collect only the information needed to fulfill orders (name, phone, address). We do not sell personal data. Payment details are processed securely and never stored on our servers for COD orders.",
          published: true,
        },
        terms: {
          title: "Terms of Service",
          content:
            "By placing an order you agree that product availability and delivery times are estimates. Prices are listed in BDT. Delivery charges follow the area rates configured for each product.",
          published: true,
        },
      },
    },
    nav: defaultSettings.navLinks.map((l) => ({
      title: l.label,
      path: l.path || "/",
    })),
    pages: [
      page("", "/", "Home", defaultSettings.tagline),
      page("shop", "/shop", "Shop", "Browse all products"),
      page("categories", "/categories", "Categories", "Shop by department"),
      page("cart", "/cart", "Cart", "Your shopping cart"),
      page("checkout", "/checkout", "Checkout", "Complete your order"),
      page("about", "/about", "About", "About our marketplace"),
      page("contact", "/contact", "Contact", "Get in touch"),
      page("faq", "/faq", "FAQ", "Common questions"),
      page("privacy", "/privacy", "Privacy", "Privacy policy"),
      page("terms", "/terms", "Terms", "Terms of service"),
    ],
    json_ld: {
      "@context": "https://schema.org",
      "@type": "Store",
      name: defaultSettings.siteName,
      url: baseUrl,
      description: defaultSettings.tagline,
    },
    updated_at: new Date().toISOString(),
  };
}

export async function fetchSiteConfig(
  providedHost?: string,
): Promise<PublicSiteConfig> {
  const host = providedHost || (await getSiteHost());

  try {
    const res = await fetch(`${API_BASE_URL}/public/site/${host}`, {
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: [`site-${host}`] } }),
    });
    if (!res.ok) return createFallbackSiteConfig(host);
    return (await res.json()) as PublicSiteConfig;
  } catch {
    return createFallbackSiteConfig(host);
  }
}

export async function getSiteConfig(providedHost?: string): Promise<PublicSiteConfig> {
  return fetchSiteConfig(providedHost);
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

export function getDemoProducts(): Product[] {
  return sampleProducts;
}

export function getDemoCategories() {
  return sampleCategories;
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
  for (const cat of sampleCategories) {
    entries.push({
      url: `${baseUrl}/shop?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const product of sampleProducts) {
    entries.push({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }
  return entries;
}
