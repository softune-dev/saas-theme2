"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";

export function SiteLogo({ className = "" }: { className?: string }) {
  const { settings } = useTheme();
  const name = settings.siteName || "Store";

  if (settings.logoType === "image" && settings.logoImage) {
    return (
      <Link href="/" className={`relative block h-8 w-28 shrink-0 ${className}`}>
        <Image
          src={settings.logoImage}
          alt={name}
          fill
          className="object-contain object-left"
          sizes="112px"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`font-display text-lg font-semibold tracking-tight text-[var(--foreground)] ${className}`}
    >
      {name}
    </Link>
  );
}
