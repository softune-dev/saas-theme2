import { NextRequest, NextResponse } from "next/server";

/** Cookie so pages navigated to *inside* the preview iframe (which won't carry
 * the ?__site= query param) keep resolving to the same site. */
const SITE_COOKIE = "__preview_site";

/**
 * Host alias for the dashboard's editor preview iframe, which loads this
 * app at its shared Vercel URL (e.g. saas-theme2.vercel.app) regardless of
 * environment — the browser's real Host header there matches no site, so
 * getSiteConfig() would 404. That 404 crashes rather than 404s, because it
 * fires from the root layout (app/layout.tsx), where Next.js forbids
 * notFound().
 *
 * Resolution order, most specific first:
 *   1. ?__site=<host>  — the dashboard passes the site currently being edited
 *   2. __preview_site cookie — set from (1), survives in-iframe navigation
 *   3. SITE_HOST env — plain visits to the shared URL with no context
 *
 * Deliberately NOT gated to development: real customer traffic never
 * carries a ?__site= param (only the dashboard's iframe does), and the
 * data this ever exposes is a site's already-published, already-public
 * content — same as visiting that site's own real domain directly. This
 * previously only worked against `localhost`, which meant the editor's
 * preview broke entirely once deployed — this is the actual fix for that,
 * not a security loosening.
 */
export function middleware(request: NextRequest) {
  const paramSite = request.nextUrl.searchParams.get("__site");
  const cookieSite = request.cookies.get(SITE_COOKIE)?.value;
  const siteHost = paramSite || cookieSite || process.env.SITE_HOST;
  if (!siteHost) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", siteHost);

  const response = NextResponse.next({ request: { headers } });
  if (paramSite && paramSite !== cookieSite) {
    response.cookies.set(SITE_COOKIE, paramSite, { path: "/", httpOnly: false });
  }
  return response;
}
