import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { defaultSettings } from "@/lib/sample-data";
import { buildMetadata, getPageSeo, getSiteHost } from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("about", host);
  return buildMetadata(seo);
}

export default function AboutPage() {
  return (
    <SystemPageShell title={`About ${defaultSettings.siteName}`}>
      <p>
        {defaultSettings.siteName} is a multi-category marketplace template —
        built for merchants who sell electronics, fashion, home goods, and
        everything in between. The layout follows a familiar general-ecommerce
        pattern: strong catalog browsing, clear delivery pricing, and a lean
        checkout.
      </p>
      <h2>Our focus</h2>
      <p>
        Product discovery first. Categories, search, and best-seller grids do
        the heavy lifting so shoppers can find what they need without wading
        through brand storytelling.
      </p>
      <h2>Delivery across Bangladesh</h2>
      <p>
        Area-based delivery charges (Inside Dhaka / Outside Dhaka and more)
        are configured per product and calculated honestly at checkout.
      </p>
    </SystemPageShell>
  );
}
