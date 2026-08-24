import type { Metadata } from "next";
import { buildMetadata, getPageSeo, getSiteHost } from "@/lib/get-site";
import { CartPageClient } from "./CartPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("cart", host);
  return buildMetadata(seo);
}

export default function CartPage() {
  return <CartPageClient />;
}
