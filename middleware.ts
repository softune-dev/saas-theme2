import { NextRequest, NextResponse } from "next/server";

/** Cookie so pages navigated to *inside* the preview iframe (which won't carry
 * the ?__site= query param) keep resolving to the same site. */
const SITE_COOKIE = "__preview_site";

/**
 * Dev-only host alias. The dashboard's editor preview loads this app at
 * http://localhost:3050, so the browser's Host header is literally
 * "localhost" — no site is ever published under that name, so
 * getSiteConfig() would 404. That 404 crashes rather than 404s, because it
 * fires from the root layout (app/layout.tsx), where Next.js forbids
 * notFound().
 *
 * Resolution order, most specific first:
 *   1. ?__site=<host>  — the dashboard passes the site currently being edited
 *   2. __preview_site cookie — set from (1), survives in-iframe navigation
 *   3. SITE_HOST env — plain `localhost:3050` visits with no context
 *
 * Deriving the host from the request instead of hardcoding it in .env.local
 * is what makes the preview follow the site you're editing. Production
 * traffic always carries a real Host header and never enters this branch.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return NextResponse.next();

  const host = request.headers.get("host") ?? "";
  const isLoopback = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (!isLoopback) return NextResponse.next();

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
