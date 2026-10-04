import { data, useMatches } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { NoMatch, VerifiedResult } from "~/components/dpi-result";
import { Reveal } from "~/components/motion";
import { CheckBeforeCommit, VerifyHero } from "~/components/verify-sections";
import { verifyPath } from "~/lib/dpi";
import { lookupDpi } from "~/lib/marketplace/source.server";
import { seo } from "~/lib/seo";
import type { Route } from "./+types/verify-result";

// Serves /verify/:code[/:unit] and the plaque/QR landing URL
// /p/dpi/:code[/:unit] (the https form of urbn://property/dpi/:code/:unit).
export async function loader({ params }: Route.LoaderArgs) {
  const result = await lookupDpi(decodeURIComponent(params.code), params.unit ? decodeURIComponent(params.unit) : null);
  return data(result, { status: result.status === "verified" ? 200 : result.error === "INVALID_DPI_FORMAT" ? 400 : 404 });
}

export const meta: Route.MetaFunction = ({ loaderData, params }) => {
  const r = loaderData;
  const code = [params.code, params.unit].filter(Boolean).join("/");
  return seo({
    title: r?.status === "verified" ? `${r.record.name}: Verified DPI ${code}` : `DPI ${code}`,
    description:
      r?.status === "verified"
        ? `${r.record.name} in ${r.record.city || r.record.state} is a verified Urbn property. Check its DPI record before you pay anything.`
        : "We couldn't find a verified Urbn record for this DPI code. Here's what to do next.",
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
          <p className="mb-6 text-sm text-neutral-500">You scanned an Urbn plaque. Here is the live record for this property.</p>
        )}
        <Reveal key={code}>
          {loaderData.status === "verified" ? (
            <VerifiedResult record={loaderData.record} />
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
