import { redirect } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { NoMatch, VerifiedResult } from "~/components/dpi-result";
import { FaqSection } from "~/components/faq";
import { Reveal } from "~/components/motion";
import { CheckBeforeCommit, VerifyHero } from "~/components/verify-sections";
import { ButtonLink } from "~/components/ui";
import { UBeepExplainer } from "~/components/verify-sections";
import { parseDpiIdentifier, SAMPLE_DPI, verifyPath } from "~/lib/dpi";
import { lookupDpi, usingLiveApi } from "~/lib/marketplace/source.server";
import { VERIFY_FAQS } from "~/lib/faqs";
import { breadcrumbs, faqJsonLd, seo } from "~/lib/seo";
import type { Route } from "./+types/verify";

// No-JS fallback: the search form submits GET /verify?code=…
export async function loader({ request }: Route.LoaderArgs) {
  const code = new URL(request.url).searchParams.get("code");
  if (code) {
    const parsed = parseDpiIdentifier(code);
    throw redirect(parsed ? verifyPath(parsed.dpiCode, parsed.unitCode) : `/verify/${encodeURIComponent(code.trim())}`);
  }
  return { sample: await lookupDpi(SAMPLE_DPI), sampleMode: !usingLiveApi };
}

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Check a Property's DPI | Urbn",
    description:
      "Check a DPI code on Urbn to view the available property record and current verification status.",
    path: "/verify",
    jsonLd: [
      faqJsonLd(VERIFY_FAQS),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Verify a Property", path: "/verify" },
      ]),
    ],
  });

export default function Verify({ loaderData }: Route.ComponentProps) {
  const { sample, sampleMode } = loaderData;
  return (
    <>
      <VerifyHero />
      <section className="container-x py-16 sm:py-24" aria-labelledby="sample-heading">
        <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 id="sample-heading" className="text-3xl sm:text-4xl">See a Sample Record</h2>
            <p className="lede mt-2">Explore an example of a property record. This sample is for illustration.</p>
          </div>
          <ButtonLink to={`/verify/${SAMPLE_DPI}`} variant="outline" size="sm">
            View Sample Record
          </ButtonLink>
        </Reveal>
        <Reveal>{sample.status === "verified" && <VerifiedResult record={sample.record} animate={false} sampleMode={sampleMode} searchAgainButton={false} />}</Reveal>
        <Reveal className="mt-4">
          <NoMatch />
        </Reveal>
      </section>
      <UBeepExplainer />
      <CheckBeforeCommit />
      <FaqSection faqs={VERIFY_FAQS} />
      <CtaBanner />
    </>
  );
}
