import type { Metadata } from "next";
import { buildMetadata, getPageSeo, getSiteHost, getSiteConfig } from "@/lib/get-site";
import { CheckoutPageClient } from "./CheckoutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("checkout", host);
  return buildMetadata(seo);
}

export default async function CheckoutPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const theme = config.site.theme ?? {};

  const siteName = (theme.siteName as string) || config.site.name;
  const logoUrl =
    theme.logoType === "image" && theme.logoImage
      ? (theme.logoImage as string)
      : (config.site.business?.logo_url ?? null);

  return (
    <CheckoutPageClient
      host={host}
      siteName={siteName}
      logoUrl={logoUrl}
      paymentMethods={config.site.payment_methods ?? []}
    />
  );
}
