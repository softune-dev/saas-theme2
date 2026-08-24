import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { buildMetadata, getPageSeo, getSiteConfig, getSiteHost } from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("terms", host);
  return buildMetadata(seo);
}

export default async function TermsPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const legal = config.site.legal?.terms;

  return (
    <SystemPageShell title={legal?.title || "Terms of Service"}>
      <p>{legal?.content || "Terms of service content will appear here."}</p>
    </SystemPageShell>
  );
}
