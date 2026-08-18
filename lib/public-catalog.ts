/**
 * Real categories/products for a published site — GET /public/site/{host}
 * /categories and /products (app/api/public.py). Same host + caching
 * pattern as fetchSiteConfig in get-site.ts.
 *
 * WHY AN ADAPTER: the backend's public shape (see _public_category /
 * _public_product in app/api/public.py) is deliberately minimal — only real
 * columns, no invented fields. Bazaar's Product/ProductCategory types
 * (theme-types.ts) were built against sample-data.ts's richer mock shape
 * and are used throughout ProductCard/ProductDetailClient/cart/etc.
 * Adapting real data INTO that existing shape means those components keep
 * working unchanged — only the sections that fetch/select products need to
 * change at all.
 */
import { Product, ProductCategory } from "./theme-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  icon: string;
  itemCount: number;
};

type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  categoryId: string | null;
  categoryName: string | null;
  inStock: boolean;
  stockCount: number;
  attributes: Record<string, unknown>;
  features: { title: string; description: string }[];
  freeDelivery: boolean;
  deliveryCharges: { name: string; charge: number }[];
};

function adaptCategory(c: PublicCategory): ProductCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    // No fallback stock photo — empty string is a real "no image set yet"
    // state. Callers that render <Image> must guard for "".
    image: c.image,
    banner: c.banner,
    icon: c.icon,
    itemCount: c.itemCount,
    featured: true,
  };
}

/** description comes back as rich HTML from the dashboard's TipTap editor
 * — fine to render via dangerouslySetInnerHTML on the product page, but
 * wrong anywhere that expects a short plain-text excerpt. */
function stripHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/** First variant type's values become `sizes` — the closest existing field
 * to "the attribute a shopper picks before adding to bag." */
function adaptProduct(p: PublicProduct): Product {
  const variants = p.attributes?.variants as
    | { type: string; values: { value: string }[] }[]
    | undefined;
  const sizes = variants?.[0]?.values.map((v) => v.value) ?? [];
  const discountPercent =
    p.compareAtPrice && p.compareAtPrice > p.price
      ? Math.round((1 - p.price / p.compareAtPrice) * 100)
      : undefined;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.shortDescription || stripHtml(p.description),
    description: p.description,
    longDescription: stripHtml(p.description, 500),
    features: p.features ?? [],
    price: p.price,
    originalPrice: p.compareAtPrice ?? undefined,
    discountPercent,
    images: p.images,
    categoryId: p.categoryId ?? "",
    categoryName: p.categoryName ?? "",
    // Real reviews aren't built yet — 0/0 is honest ("no reviews").
    rating: 0,
    reviewCount: 0,
    inStock: p.inStock,
    stockCount: p.stockCount,
    featured: true,
    freeDelivery: p.freeDelivery,
    deliveryCharges: p.deliveryCharges ?? [],
    sizes,
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Every active category for this site. Empty array (not sample data) when
 * the site genuinely has none yet, or the request fails. */
export async function getSiteCategories(host: string): Promise<ProductCategory[]> {
  const data = await fetchJson<PublicCategory[]>(`/public/site/${host}/categories`);
  return (data ?? []).map(adaptCategory);
}

/** Up to 100 active products for this site (public endpoint max page size). */
export async function getSiteProducts(host: string): Promise<Product[]> {
  const data = await fetchJson<{ items: PublicProduct[] }>(
    `/public/site/${host}/products?limit=100`,
  );
  return (data?.items ?? []).map(adaptProduct);
}

/** One product by slug. Null when missing so the page can 404 honestly. */
export async function getSiteProduct(
  host: string,
  slug: string,
): Promise<Product | null> {
  const data = await fetchJson<PublicProduct>(
    `/public/site/${host}/products/${slug}`,
  );
  return data ? adaptProduct(data) : null;
}
