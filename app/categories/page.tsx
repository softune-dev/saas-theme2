import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPageSeo, getSiteHost } from "@/lib/get-site";
import { getSiteCategories } from "@/lib/public-catalog";
import { FeatureIcon } from "@/lib/icon-map";
import { Footer } from "@/components/footer/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("categories", host);
  return { title: seo.title, description: seo.description };
}

export default async function CategoriesPage() {
  const host = await getSiteHost();
  const categories = await getSiteCategories(host);

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          All categories
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Browse every department
        </p>
        {categories.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--muted-foreground)]">
            No categories yet.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap justify-center gap-3 pt-3 sm:gap-3.5 sm:pt-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={[
                  "group flex h-44 w-36 flex-col overflow-hidden rounded-xl bg-white",
                  "transition-[transform,background-color,box-shadow] duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:bg-[var(--background)]",
                  // Thin light primary edge; solid brand on hover
                  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_22%,transparent)]",
                  "hover:shadow-[inset_0_0_0_1px_var(--brand)]",
                ].join(" ")}
              >
                <div className="relative flex min-h-0 flex-1 items-center justify-center">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="144px"
                    />
                  ) : (
                    <FeatureIcon
                      name={cat.icon || "package"}
                      className="size-10 text-[var(--brand)]"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <p className="shrink-0 truncate px-2 pb-2.5 pt-0.5 text-center text-sm font-semibold tracking-tight text-[var(--foreground)]">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
