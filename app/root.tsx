import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { TabBar } from "./components/mobile";
import { ButtonLink } from "./components/ui";
import { organizationJsonLd, websiteJsonLd } from "./lib/seo";
import { SITE } from "./lib/site";

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: "/fonts/creato-bold.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
  { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={SITE.themeColor} />
        <meta name="format-detection" content="telephone=no" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <Header />
        <main id="main">
          <Outlet />
        </main>
        <Footer />
        <TabBar />
      </MotionConfig>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const listingGone = notFound && error.data === "Listing Unavailable";
  const heading = listingGone ? "Listing Unavailable" : notFound ? "Page Not Found" : "Something Went Wrong";
  let details = listingGone
    ? "This listing may have expired or been removed."
    : notFound
      ? "This page may have moved or the link may be incorrect."
      : "Something went wrong on our side. Try again in a moment.";
  let stack: string | undefined;
  if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main id="main" className="container-x grid min-h-[70vh] place-items-center py-24 text-center">
        <title>{`${heading} | Urbn`}</title>
        <meta name="robots" content="noindex" />
        <div>
          <p className="font-display text-[7rem] leading-none text-urbn sm:text-[10rem]">{notFound ? "404" : "Oops"}</p>
          <h1 className="mt-4 text-3xl sm:text-4xl">{heading}</h1>
          <p className="lede mx-auto mt-4 max-w-md">{details}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!listingGone && (
              <ButtonLink to="/" variant="dark">
                Go Home
              </ButtonLink>
            )}
            <ButtonLink to="/listings" variant={listingGone ? "dark" : "outline"}>
              Browse Listings
            </ButtonLink>
          </div>
          {stack && <pre className="mt-10 max-w-3xl overflow-x-auto rounded-xl bg-mist p-4 text-left text-xs">{stack}</pre>}
        </div>
      </main>
      <Footer />
    </MotionConfig>
  );
}
