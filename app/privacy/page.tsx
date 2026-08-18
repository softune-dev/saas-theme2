import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { fetchSiteConfig, getSiteHost } from "@/lib/get-site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const host = await getSiteHost();
  const config = await fetchSiteConfig(host);
  const legal = config.site.legal?.privacy;

  return (
    <SystemPageShell title={legal?.title || "Privacy Policy"}>
      <p>{legal?.content || "Privacy policy content will appear here."}</p>
    </SystemPageShell>
  );
}
