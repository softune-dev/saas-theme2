"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Award,
  Gem,
  Heart,
  Leaf,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { formatTaka, calculateDiscount } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductReviews } from "@/components/product/ProductReviews";
import { useCart } from "@/components/cart/CartContext";
import { Footer } from "@/components/footer/Footer";

// Stable icon cycle — same order every render (no Math.random).
const FEATURE_ICONS = [
  Package,
  ShieldCheck,
  Heart,
  Truck,
  Leaf,
  Award,
  Sparkles,
  Gem,
];

/**
 * Aurora-parity product detail for Bazaar: gallery, price/compare, sizes,
 * qty, add/buy/WhatsApp, rich description, feature highlights, reviews,
 * related products. Marketplace chrome via CSS variables.
 */
export function ProductDetailClient({
  initialProduct,
  relatedProducts,
  categorySlug = "",
}: {
  initialProduct: Product;
  relatedProducts: Product[];
  /** Resolved from real categories list on the server — not sample-data. */
  categorySlug?: string;
}) {
  const product = initialProduct;
  const { addItem, openDrawer } = useCart();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || "",
  );
  const [quantity, setQuantity] = useState(1);

  const discount =
    product.discountPercent ??
    calculateDiscount(product.price, product.originalPrice);
  const hasCompare =
    !!product.originalPrice && product.originalPrice > product.price;
  const availableSizes = product.sizes?.length ? product.sizes : [];
  const features = product.features ?? [];
  const related = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize || undefined);
    openDrawer();
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize || undefined);
    router.push("/checkout");
  };

  const handleWhatsAppBuy = () => {
    const phoneNumber = "8801700000000";
    const url = typeof window !== "undefined" ? window.location.href : "";
    const sizeLine = selectedSize ? `\nSize: ${selectedSize}` : "";
    const message = `Hello, I'd like to order: *${product.name}*${sizeLine}\nQuantity: ${quantity}\nLink: ${url}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Breadcrumbs */}
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-8 sm:px-6 md:px-8">
        <nav className="text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[var(--brand)]">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/shop" className="hover:text-[var(--brand)]">
            Shop
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={
              categorySlug ? `/shop?category=${categorySlug}` : "/shop"
            }
            className="hover:text-[var(--brand)]"
          >
            {product.categoryName}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--foreground)]">{product.name}</span>
        </nav>
      </div>

      {/* Main: gallery + buy panel */}
      <section className="mx-auto mt-6 grid w-full max-w-[1280px] flex-1 gap-8 px-4 sm:px-6 md:mt-8 md:grid-cols-2 md:gap-12 md:px-8">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]"
          >
            {product.images[activeImage] || product.images[0] ? (
              <Image
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : null}
            {discount > 0 ? (
              <span className="absolute top-3 left-3 rounded-md bg-[var(--brand)] px-2 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            ) : null}
          </motion.div>

          {product.images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={[
                    "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[var(--muted)] sm:size-20",
                    activeImage === idx
                      ? "border-[var(--brand)] opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100",
                  ].join(" ")}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="space-y-6 md:sticky md:top-24 md:self-start"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
                {product.categoryName}
              </p>
              {product.inStock ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  In stock
                  {product.stockCount > 0
                    ? ` · ${product.stockCount} left`
                    : ""}
                </span>
              ) : (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                  Out of stock
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={[
                      "size-3.5",
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-[var(--border)]",
                    ].join(" ")}
                    strokeWidth={1.5}
                  />
                ))}
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-[var(--brand)] sm:text-4xl">
                {formatTaka(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-lg tabular-nums text-[var(--muted-foreground)] line-through">
                  {formatTaka(product.originalPrice!)}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-md bg-[var(--brand)]/10 px-2 py-0.5 text-sm font-bold text-[var(--brand)]">
                  -{discount}%
                </span>
              ) : null}
            </div>
          </div>

          {product.tagline ? (
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
              {product.tagline}
            </p>
          ) : null}

          {availableSizes.length > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                <span>Size</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={[
                      "min-w-11 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                      selectedSize === s
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--brand)]",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center overflow-hidden rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3.5 text-[var(--foreground)] hover:bg-[var(--muted)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" strokeWidth={2} />
                </button>
                <span className="w-9 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3.5 text-[var(--foreground)] hover:bg-[var(--muted)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" strokeWidth={2} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--foreground)] py-3.5 text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
              >
                Add to cart
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Buy now
              </button>
              <button
                type="button"
                onClick={handleWhatsAppBuy}
                className="flex items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-white py-3.5 text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[var(--brand)]"
              >
                <Image
                  src="/assets/whatsapp.svg"
                  alt=""
                  width={18}
                  height={18}
                />
                Order via WhatsApp
              </button>
            </div>
          </div>

          {!product.freeDelivery && product.deliveryCharges.length > 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 p-3.5">
              <p className="text-xs font-semibold text-[var(--foreground)]">
                Delivery charges
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                {product.deliveryCharges.map((dc) => (
                  <li
                    key={dc.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{dc.name}</span>
                    <span className="font-semibold tabular-nums text-[var(--foreground)]">
                      {formatTaka(dc.charge)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : product.freeDelivery ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <Truck className="size-4" />
              Free delivery on this item
            </p>
          ) : null}
        </motion.div>
      </section>

      {/* Feature highlights first, then rich Product details (Aurora order) */}
      {(product.description || product.longDescription || features.length > 0) && (
        <section className="mx-auto w-full max-w-[1280px] space-y-12 px-4 py-12 sm:px-6 md:space-y-14 md:px-8 md:py-16">
          {features.length > 0 ? (
            <div className="grid gap-8 text-left md:grid-cols-3 md:gap-10">
              {features.map((feature, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length] ?? Star;
                return (
                  <div key={i} className="space-y-2.5">
                    <Icon
                      strokeWidth={1.5}
                      className="size-6 text-[var(--brand)]"
                    />
                    <h4 className="text-sm font-bold text-[var(--foreground)]">
                      {feature.title}
                    </h4>
                    {feature.description ? (
                      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {feature.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {product.description || product.longDescription ? (
            <div className="space-y-4 text-left">
              <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Product details
              </h3>
              {product.description?.includes("<") ? (
                <div
                  className="prose prose-sm max-w-3xl text-[var(--muted-foreground)] [&_a]:text-[var(--brand)] [&_a]:underline [&_img]:my-4 [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                  {product.longDescription || product.description}
                </p>
              )}
            </div>
          ) : null}
        </section>
      )}

      <ProductReviews
        averageRating={product.rating}
        totalReviews={product.reviewCount}
      />

      {related.length > 0 ? (
        <section className="mx-auto w-full max-w-[1280px] px-4 pt-4 pb-16 sm:px-6 md:px-8 md:pb-20">
          <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
            You may also like
          </p>
          <h2 className="mt-1 mb-8 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Related products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
}
