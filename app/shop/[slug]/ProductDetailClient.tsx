"use client";

import { useEffect, useState } from "react";
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
  ShoppingBag,
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
 * Marketplace PDP: gallery + buy panel, features, details, related.
 */
export function ProductDetailClient({
  initialProduct,
  relatedProducts,
  categorySlug = "",
}: {
  initialProduct: Product;
  relatedProducts: Product[];
  categorySlug?: string;
}) {
  const product = initialProduct;
  const { addItem, openDrawer } = useCart();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]?.name,
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
  const showRating = product.reviewCount > 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize || undefined, selectedColor);
    openDrawer();
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize || undefined, selectedColor, {
      openDrawer: false,
    });
    router.push("/checkout");
  };

  const handleWhatsAppBuy = () => {
    const phoneNumber = "8801700000000";
    const url = typeof window !== "undefined" ? window.location.href : "";
    const sizeLine = selectedSize ? `\nSize: ${selectedSize}` : "";
    const colorLine = selectedColor ? `\nColor: ${selectedColor}` : "";
    const message = `Hello, I'd like to order: *${product.name}*${sizeLine}${colorLine}\nQuantity: ${quantity}\nLink: ${url}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-[1280px] px-3 pt-5 sm:px-4 sm:pt-6">
        <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[var(--brand)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--brand)]">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={categorySlug ? `/shop?category=${categorySlug}` : "/shop"}
            className="hover:text-[var(--brand)]"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 font-medium text-[var(--foreground)]">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="mx-auto mt-5 grid w-full max-w-[1280px] flex-1 gap-6 px-3 sm:px-4 md:mt-7 md:grid-cols-2 md:gap-10 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-white"
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
              <span className="absolute left-3 top-3 rounded-md bg-[var(--brand)] px-2.5 py-1 text-xs font-bold text-[var(--brand-fg)] shadow-sm">
                -{discount}%
              </span>
            ) : null}
          </motion.div>

          {product.images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={[
                    "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white sm:size-[4.5rem]",
                    activeImage === idx
                      ? "border-[var(--brand)]"
                      : "border-[var(--border)] opacity-80 hover:opacity-100",
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

        {/* Buy panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="space-y-5 md:sticky md:top-24 md:self-start"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {product.categoryName}
              </p>
              {product.inStock ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  In stock
                  {product.stockCount > 0 ? ` · ${product.stockCount}` : ""}
                </span>
              ) : (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-100">
                  Out of stock
                </span>
              )}
              {product.badge ? (
                <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--brand)]">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {product.name}
            </h1>

            {showRating ? (
              <div className="flex items-center gap-2">
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
            ) : null}

            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-[var(--foreground)]">
                {formatTaka(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-base tabular-nums text-[var(--muted-foreground)] line-through">
                  {formatTaka(product.originalPrice!)}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-md bg-[var(--brand)]/10 px-2 py-0.5 text-sm font-bold text-[var(--brand)]">
                  Save {discount}%
                </span>
              ) : null}
            </div>

            {product.tagline ? (
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                {product.tagline}
              </p>
            ) : null}
          </div>

          {product.colors && product.colors.length > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                <span>{product.colorLabel || "Color"}</span>
                {selectedColor ? (
                  <span className="normal-case tracking-normal text-[var(--foreground)]">
                    {selectedColor}
                  </span>
                ) : null}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    aria-label={c.name}
                    title={c.name}
                    className={[
                      "size-9 shrink-0 rounded-full border transition-all",
                      selectedColor === c.name
                        ? "ring-2 ring-[var(--brand)] ring-offset-2"
                        : "border-[var(--border)] hover:ring-2 hover:ring-[var(--border)] hover:ring-offset-2",
                    ].join(" ")}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {availableSizes.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {product.sizeLabel || "Size"}
                {selectedSize ? (
                  <span className="ml-2 normal-case tracking-normal text-[var(--foreground)]">
                    {selectedSize}
                  </span>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={[
                      "min-w-11 rounded-[var(--theme-btn-radius)] border px-3 py-2.5 text-sm font-semibold transition-colors",
                      selectedSize === s
                        ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]"
                        : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--brand)]",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center overflow-hidden rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--background)]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-[var(--foreground)] transition-colors hover:bg-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" strokeWidth={2} />
                </button>
                <span className="w-9 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 text-[var(--foreground)] transition-colors hover:bg-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" strokeWidth={2} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="size-4" strokeWidth={2} />
                Add to cart
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex min-h-11 w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-sm font-bold text-[var(--brand-fg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy now
            </button>

            <button
              type="button"
              onClick={handleWhatsAppBuy}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[#25D366]/50 hover:bg-[#25D366]/5"
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

          {!product.freeDelivery && product.deliveryCharges.length > 0 ? (
            <div className="rounded-xl bg-[var(--muted)]/50 p-3.5">
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
                    <span className="font-bold tabular-nums text-[var(--foreground)]">
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

      {(product.description ||
        product.longDescription ||
        features.length > 0) && (
        <section className="mx-auto w-full max-w-[1280px] space-y-10 px-3 py-10 sm:px-4 md:space-y-12 md:py-14">
          {features.length > 0 ? (
            <div className="grid gap-8 text-left sm:grid-cols-3 sm:gap-10">
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
              <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
                Product details
              </h3>
              {product.description?.includes("<") ? (
                <div
                  className="prose prose-sm mt-4 max-w-3xl text-[var(--muted-foreground)] [&_a]:text-[var(--brand)] [&_a]:underline [&_img]:my-4 [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                  {product.longDescription || product.description}
                </p>
              )}
            </div>
          ) : null}
        </section>
      )}

      {showRating ? (
        <ProductReviews
          averageRating={product.rating}
          totalReviews={product.reviewCount}
        />
      ) : null}

      {related.length > 0 ? (
        <section className="mx-auto w-full max-w-[1280px] px-3 pb-14 pt-2 sm:px-4 md:pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            You may also like
          </p>
          <h2 className="mt-1 mb-6 text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
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
