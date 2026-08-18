import type { MetadataRoute } from "next";
import { getSiteSitemap } from "@/lib/get-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSiteSitemap();
}
