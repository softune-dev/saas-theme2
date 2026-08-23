import type { Metadata } from "next";
import {
  Archivo_Black,
  Big_Shoulders,
  Bodoni_Moda,
  Cormorant,
  DM_Sans,
  DM_Serif_Display,
  Figtree,
  Fraunces,
  Instrument_Serif,
  Inter,
  Karla,
  Libre_Baskerville,
  Manrope,
  Newsreader,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Prata,
  Sora,
  Space_Grotesk,
  Spectral,
  Urbanist,
  Work_Sans,
} from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/header/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PreviewRouteBeacon } from "@/components/dev/PreviewRouteBeacon";
import { fetchSiteConfig, getPageSeo, getSiteHost, resolveTheme } from "@/lib/get-site";
import { getSiteCategories } from "@/lib/public-catalog";
import { SiteUnavailable } from "@/components/ui/SiteUnavailable";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
  preload: false,
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  display: "swap",
  preload: false,
});
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif-display",
  display: "swap",
  preload: false,
});
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spectral",
  display: "swap",
  preload: false,
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});
const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
  preload: false,
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni-moda",
  display: "swap",
  preload: false,
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: false,
});
const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
  preload: false,
});
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
  display: "swap",
  preload: false,
});
const bigShouldersDisplay = Big_Shoulders({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-big-shoulders-display",
  display: "swap",
  preload: false,
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  preload: false,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
  preload: false,
});
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
  preload: false,
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
  preload: false,
});

const fontVariables = [
  fraunces.variable,
  playfair.variable,
  cormorant.variable,
  inter.variable,
  manrope.variable,
  workSans.variable,
  libreBaskerville.variable,
  dmSerifDisplay.variable,
  spectral.variable,
  outfit.variable,
  karla.variable,
  sora.variable,
  bodoniModa.variable,
  newsreader.variable,
  instrumentSerif.variable,
  prata.variable,
  archivoBlack.variable,
  bigShouldersDisplay.variable,
  plusJakartaSans.variable,
  spaceGrotesk.variable,
  urbanist.variable,
  figtree.variable,
  dmSans.variable,
  nunitoSans.variable,
].join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  // Same constraint as the layout itself: a notFound() thrown from metadata
  // generation for the root layout crashes rather than 404s.
  const config = await fetchSiteConfig(host);
  if (!config) return { title: "Site unavailable" };
  const theme = resolveTheme(config);
  const siteName = config.site.name || theme.siteName;

  // Root layout metadata is the site-wide default every page inherits
  // (favicon, OG image, indexing) unless a specific page overrides it — so
  // this must read the merchant's real SEO settings, not invent a generic
  // title/description from scratch. getPageSeo("") already merges page SEO
  // over site SEO over business description (see _resolve_seo on the
  // backend) — previously none of og_title/og_description/og_image/favicon/
  // noindex ever reached here, so Settings → SEO silently did nothing.
  const seo = await getPageSeo("", host);

  return {
    metadataBase: new URL(`https://${host}`),
    title: {
      default: seo.title,
      template: `%s | ${siteName}`,
    },
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: { canonical: seo.canonical },
    icons: seo.favicon ? { icon: seo.favicon } : undefined,
    openGraph: {
      type: "website",
      locale: "en_BD",
      siteName,
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
    robots: seo.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const host = await getSiteHost();
  // notFound() is illegal here, so resolve the config without it and render
  // a real explanation when there's nothing to show.
  const config = await fetchSiteConfig(host);

  if (!config) {
    return (
      <html lang="en" className={fontVariables}>
        <body className="min-h-screen antialiased">
          <SiteUnavailable host={host} />
        </body>
      </html>
    );
  }

  const theme = resolveTheme(config);
  // Header dropdown + mobile drawer need the same real categories as the
  // homepage rail — fetched once per request here, not from sample-data.
  const categories = await getSiteCategories(host);

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased bg-[var(--background)] text-[var(--foreground)]">
        <Suspense fallback={null}>
          <PreviewRouteBeacon />
        </Suspense>
        <ThemeProvider initialSettings={theme}>
          <ToastProvider>
            <CartProvider>
              <Header categories={categories} />
              <main className="flex-1">{children}</main>
              <CartDrawer />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
