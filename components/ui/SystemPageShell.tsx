import { Footer } from "@/components/footer/Footer";

export function SystemPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
          {title}
        </h1>
        <div className="prose prose-sm mt-6 max-w-none text-[var(--muted-foreground)] [&_a]:text-[var(--brand)] [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[var(--foreground)] [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
