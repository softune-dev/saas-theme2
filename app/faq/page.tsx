import type { Metadata } from "next";
import { SystemPageShell } from "@/components/ui/SystemPageShell";
import { getSiteConfig, getSiteHost } from "@/lib/get-site";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const faqs = config.site.faqs ?? [];

  return (
    <SystemPageShell title="Frequently asked questions">
      <div className="not-prose space-y-3">
        {faqs.map((f) => (
          <details
            key={f.id}
            className="group rounded-xl border border-[var(--border)] bg-white px-4 py-3"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:content-none">
              {f.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </SystemPageShell>
  );
}
