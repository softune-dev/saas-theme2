import { Suspense } from "react";
import type { Metadata } from "next";
import { getPageSeo, getSiteHost } from "@/lib/get-site";
import { getSiteCategories, getSiteEvents, getSiteProducts } from "@/lib/public-catalog";
import { ShopPageClient } from "./ShopPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("shop", host);
  return { title: seo.title, description: seo.description };
}

export default async function ShopPage() {
  const host = await getSiteHost();
  const [categories, products, events] = await Promise.all([
    getSiteCategories(host),
    getSiteProducts(host),
    getSiteEvents(host),
  ]);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-16 text-sm text-[var(--muted-foreground)]">
          Loading shop…
        </div>
      }
    >
      <ShopPageClient categories={categories} products={products} events={events} />
    </Suspense>
  );
}
