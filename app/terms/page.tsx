import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { fetchSiteConfig, getSiteHost } from "@/lib/get-site";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const host = await getSiteHost();
  const config = await fetchSiteConfig(host);
  const legal = config.site.legal?.terms;

  return (
    <SystemPageShell title={legal?.title || "Terms of Service"}>
      <p>{legal?.content || "Terms of service content will appear here."}</p>
    </SystemPageShell>
  );
}
