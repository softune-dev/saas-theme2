import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  generateProductJsonLd,
  getSiteConfig,
  getSiteHost,
} from "@/lib/get-site";
import {
  getSiteCategories,
  getSiteProduct,
  getSiteProducts,
} from "@/lib/public-catalog";
import { ProductDetailClient } from "./ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const host = await getSiteHost();
  const product = await getSiteProduct(host, slug);
  if (!product) return { title: "Product not found" };
  const config = await getSiteConfig(host);
  const siteName = config.site.name;
  return {
    title: `${product.name} | ${siteName}`,
    description: product.tagline || product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const host = await getSiteHost();
  const product = await getSiteProduct(host, slug);
  if (!product) notFound();

  const [allProducts, categories] = await Promise.all([
    getSiteProducts(host),
    getSiteCategories(host),
  ]);
  const related = allProducts.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId,
  );
  const categorySlug =
    categories.find((c) => c.id === product.categoryId)?.slug ?? "";
  const jsonLd = generateProductJsonLd(product, host);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        initialProduct={product}
        relatedProducts={related}
        categorySlug={categorySlug}
      />
    </>
  );
}
