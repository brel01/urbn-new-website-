import { data, useMatches } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { NoMatch, VerifiedResult } from "~/components/dpi-result";
import { Reveal } from "~/components/motion";
import { CheckBeforeCommit, VerifyHero } from "~/components/verify-sections";
import { dpiShareLink, type DpiLookupSource, verifyPath } from "~/lib/dpi";
import { formatCompactNaira, listingTypeLabel, type ListingType } from "~/lib/marketplace/types";
import { lookupDpi, usingLiveApi } from "~/lib/marketplace/source.server";
import { placesAtProperty } from "~/lib/nearby/source.server";
import { seo } from "~/lib/seo";
import type { Route } from "./+types/verify-result";

// Serves /verify/:code[/:unit] and the plaque/QR landing URL
// /p/dpi/:code[/:unit] (the https form of urbn://property/dpi/:code/:unit).
export async function loader({ params, request }: Route.LoaderArgs) {
  // Shared links and plaque QRs count as DEEP_LINK; the website's own scanner adds ?via=scan.
  const { pathname, searchParams } = new URL(request.url);
  const source: DpiLookupSource = searchParams.get("via") === "scan" ? "SCAN" : pathname.startsWith("/verify/") ? "SEARCH" : "DEEP_LINK";
  const result = await lookupDpi(decodeURIComponent(params.code), params.unit ? decodeURIComponent(params.unit) : null, source);
  let activities = result.status === "verified" ? await placesAtProperty({ propertyId: result.record.propertyId, dpi: result.code }) : [];
  // On a unit, keep that unit's activities plus property-level ones (labelled as about the property); never other units'.
  if (result.status === "verified" && result.unitCode) activities = activities.filter((a) => !a.unit || a.unit.unitNumber === result.unitCode);
  return data({ ...result, activities, sampleMode: !usingLiveApi }, { status: result.status === "verified" ? 200 : result.error === "INVALID_DPI_FORMAT" ? 400 : 404 });
}

export const meta: Route.MetaFunction = ({ loaderData, params, matches }) => {
  const r = loaderData;
  const code = [params.code, params.unit].filter(Boolean).join("/");
  // The universal-link page is what WhatsApp, iMessage and Instagram preview, so
  // its og:url is the shared https://www.urbn.ng/property/dpi/... link itself.
  const shared = matches.some((m) => m?.id === "dpi-link");
  if (r?.status !== "verified") {
    return seo({
      title: `DPI ${code}`,
      description: "We couldn't find a public Urbn record for this DPI code. Check the code and try again.",
      path: verifyPath(params.code, params.unit),
      noindex: true,
    });
  }
  const rec = r.record;
  const title = rec.unit ? `Unit ${rec.unit.number}, ${rec.name}` : rec.name;
  const place = [rec.city, rec.state].filter(Boolean).join(", ");
  const price = rec.listing ? `${listingTypeLabel(rec.listing.type as ListingType)} · ${formatCompactNaira(rec.listing.price)}${rec.listing.rentPeriod === "Yearly" ? "/yr" : rec.listing.rentPeriod === "Monthly" ? "/mo" : ""}. ` : "";
  return seo({
    title: `${title}: DPI ${code}`,
    description: `${price}Verified property${place ? ` in ${place}` : ""}. View its Urbn record, or U-Beep the people there.`,
    path: shared ? dpiShareLink(params.code, params.unit) : verifyPath(params.code, params.unit),
    image: rec.image ?? undefined,
    imageAlt: title,
    // individual records stay out of search indexes
    noindex: true,
  });
};

export default function VerifyResultPage({ loaderData }: Route.ComponentProps) {
  const fromPlaque = useMatches().some((m) => m.id === "plaque-landing" || m.id === "dpi-link");
  const code = loaderData.unitCode ? `${loaderData.code}/${loaderData.unitCode}` : loaderData.code;
  return (
    <>
      <VerifyHero compact defaultValue={code} />
      <section className="container-x py-12 sm:py-20" aria-live="polite">
        {fromPlaque && (
          <p className="mb-6 text-sm text-neutral-500">This link opens the property record below. Check its details, or U-Beep the people there to let them know you've arrived.</p>
        )}
        <Reveal key={code}>
          {loaderData.status === "verified" ? (
            <VerifiedResult record={loaderData.record} activities={loaderData.activities} sampleMode={loaderData.sampleMode} />
          ) : (
            <NoMatch code={code} error={loaderData.error} />
          )}
        </Reveal>
      </section>
      <CheckBeforeCommit />
      <div className="h-20" />
      <CtaBanner />
    </>
  );
}
