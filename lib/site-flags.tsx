"use client";

import { createContext, useContext, type ReactNode } from "react";

const BadgeContext = createContext<boolean>(false);

/** Config's top-level `badge`, resolved once server-side in the root layout
 * so the Footer (rendered by many pages) can read it without a prop each. */
export function SiteFlagsProvider({ badge, children }: { badge: boolean; children: ReactNode }) {
  return <BadgeContext.Provider value={badge}>{children}</BadgeContext.Provider>;
}

export function useBadge(): boolean {
  return useContext(BadgeContext);
}
