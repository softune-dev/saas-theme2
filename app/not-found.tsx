import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-[var(--brand)]">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--foreground)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
