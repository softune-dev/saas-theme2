"use client";

import { SectionRenderer } from "@/sections/SectionRenderer";
import type { Event, Product, ProductCategory } from "@/lib/theme-types";

type HomePageClientProps = {
  categories: ProductCategory[];
  products: Product[];
  events: Event[];
};

/** Client shell so SectionRenderer can read theme settings while still
 * receiving server-fetched catalog props (no per-section client fetch). */
export function HomePageClient({ categories, products, events }: HomePageClientProps) {
  return <SectionRenderer categories={categories} products={products} events={events} />;
}
