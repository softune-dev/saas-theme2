"use client";

import { useTheme } from "@/lib/theme-context";
import type { Product, ProductCategory } from "@/lib/theme-types";
import { Footer } from "@/components/footer/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CategoriesSection } from "./CategoriesSection";
import { FeatureProductsSection } from "./FeatureProductsSection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";

/**
 * Renders home sections in the order from SiteEditorSettings.sections.
 * Intentionally skips testimonials / bannerCta / productShowcase for this
 * catalog-first marketplace skin (still accepted in the type for editor parity).
 *
 * Trust badges (`features`) are forced immediately after the first `hero`
 * even if a draft was seeded with the dashboard's generic section order
 * (where features sits near the footer).
 */
function withFeaturesAfterHero(
  sections: { id: string; type: string }[],
) {
  const features = sections.filter((s) => s.type === "features");
  if (features.length === 0) return sections;
  const without = sections.filter((s) => s.type !== "features");
  const heroIdx = without.findIndex((s) => s.type === "hero");
  if (heroIdx === -1) return sections;
  return [
    ...without.slice(0, heroIdx + 1),
    ...features,
    ...without.slice(heroIdx + 1),
  ];
}

type SectionRendererProps = {
  /** Real backend catalog for this site — see lib/public-catalog.ts. */
  categories: ProductCategory[];
  products: Product[];
};

export function SectionRenderer({
  categories,
  products,
}: SectionRendererProps) {
  const { settings } = useTheme();
  let footerRendered = false;
  let heroRendered = false;
  const sections = withFeaturesAfterHero(settings.sections);

  return (
    <>
      {sections.map((sec) => {
        switch (sec.type) {
          // Only "hero" owns the marketplace hero (category rail + promo).
          // "banner" is a separate editor type in Aurora; mapping it here
          // duplicated the full hero whenever both were in sections.
          case "hero": {
            if (heroRendered) return null;
            heroRendered = true;
            return (
              <HeroSection key={sec.id} categories={categories} />
            );
          }
          case "features":
            return <FeaturesSection key={sec.id} />;
          case "categories":
            return (
              <CategoriesSection key={sec.id} categories={categories} />
            );
          // categoryShowcase is a different editor section — don't re-use the
          // same grid as "categories" or it doubles the category tiles too.
          case "categoryShowcase":
            return null;
          case "featureProducts":
            return (
              <FeatureProductsSection key={sec.id} products={products} />
            );
          case "whyChooseUs":
            return <WhyChooseUsSection key={sec.id} />;
          case "footer":
            footerRendered = true;
            return <Footer key={sec.id} />;
          // Explicit no-ops — product-catalog-first skin
          case "banner":
          case "testimonials":
          case "bannerCta":
          case "productShowcase":
            return null;
          default:
            return null;
        }
      })}
      {/* Always show chrome footer if theme didn't include a footer section */}
      {!footerRendered ? <Footer key="footer-fallback" /> : null}
    </>
  );
}
