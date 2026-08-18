"use client";

import { DynamicIcon, type IconName } from "lucide-react/dynamic";

/** Renders any icon name the dashboard's icon picker could have stored
 * (lucide's full ~2000-icon library, kebab-case, e.g. "shield-check") —
 * dynamically imported per icon, so this costs nothing until one is
 * actually used on a page. See dashboard/lib/icon-options.ts for the
 * picker this must stay compatible with. */
export function FeatureIcon({
  name,
  className,
  strokeWidth,
}: {
  name: string | undefined | null;
  className?: string;
  strokeWidth?: number;
}) {
  if (!name) return null;
  return <DynamicIcon name={name as IconName} className={className} strokeWidth={strokeWidth} />;
}
