import { data, useMatches } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { NoMatch, VerifiedResult } from "~/components/dpi-result";
import { Reveal } from "~/components/motion";
import { CheckBeforeCommit, VerifyHero } from "~/components/verify-sections";
import { verifyPath } from "~/lib/dpi";
import { lookupDpi } from "~/lib/marketplace/source.server";
import { placesAtProperty } from "~/lib/nearby/source.server";
import { seo } from "~/lib/seo";
import type { Route } from "./+types/verify-result";

// Serves /verify/:code[/:unit] and the plaque/QR landing URL
// /p/dpi/:code[/:unit] (the https form of urbn://property/dpi/:code/:unit).
export async function loader({ params }: Route.LoaderArgs) {
  const result = await lookupDpi(decodeURIComponent(params.code), params.unit ? decodeURIComponent(params.unit) : null);
  let activities = result.status === "verified" ? await placesAtProperty({ propertyId: result.record.propertyId, dpi: result.code }) : [];
  // On a unit, keep that unit's activities plus property-level ones (labelled as about the property); never other units'.
  if (result.status === "verified" && result.unitCode) activities = activities.filter((a) => !a.unit || a.unit.unitNumber === result.unitCode);
  return data({ ...result, activities }, { status: result.status === "verified" ? 200 : result.error === "INVALID_DPI_FORMAT" ? 400 : 404 });
}

export const meta: Route.MetaFunction = ({ loaderData, params }) => {
  const r = loaderData;
  const code = [params.code, params.unit].filter(Boolean).join("/");
  return seo({
    title: r?.status === "verified" ? `${r.record.name}: DPI ${code}` : `DPI ${code}`,
    description:
      r?.status === "verified"
        ? `View the Urbn record and current verification status for ${r.record.name} in ${r.record.city || r.record.state}.`
        : "We couldn't find a public Urbn record for this DPI code. Check the code and try again.",
    path: verifyPath(params.code, params.unit),
    // individual records stay out of search indexes
    noindex: true,
  });
};

export default function VerifyResultPage({ loaderData }: Route.ComponentProps) {
  const fromPlaque = useMatches().some((m) => m.id === "plaque-landing");
  const code = loaderData.unitCode ? `${loaderData.code}/${loaderData.unitCode}` : loaderData.code;
  return (
    <>
      <VerifyHero compact defaultValue={code} />
      <section className="container-x py-12 sm:py-20" aria-live="polite">
        {fromPlaque && (
          <p className="mb-6 text-sm text-neutral-500">This QR code links to the property record below. Check its details and current status.</p>
        )}
        <Reveal key={code}>
          {loaderData.status === "verified" ? (
            <VerifiedResult record={loaderData.record} activities={loaderData.activities} />
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
