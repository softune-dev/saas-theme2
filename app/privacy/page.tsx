import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { buildMetadata, getPageSeo, getSiteConfig, getSiteHost } from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("privacy", host);
  return buildMetadata(seo);
}

export default async function PrivacyPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const legal = config.site.legal?.privacy;

  return (
    <SystemPageShell title={legal?.title || "Privacy Policy"}>
      <p>{legal?.content || "Privacy policy content will appear here."}</p>
    </SystemPageShell>
  );
}
