import { redirect } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { NoMatch, VerifiedResult } from "~/components/dpi-result";
import { FaqSection } from "~/components/faq";
import { Reveal } from "~/components/motion";
import { CheckBeforeCommit, VerifyHero } from "~/components/verify-sections";
import { ButtonLink } from "~/components/ui";
import { parseDpiIdentifier, SAMPLE_DPI, verifyPath } from "~/lib/dpi";
import { lookupDpi } from "~/lib/marketplace/source.server";
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
  return { sample: await lookupDpi(SAMPLE_DPI) };
}

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Verify a Property in Nigeria | Check a DPI Code",
    description:
      "Enter a DPI code or scan the plaque's QR code to see a property's verified record: status, registered address, registration date and ownership. Free and instant.",
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
  const { sample } = loaderData;
  return (
    <>
      <VerifyHero />
      <section className="container-x py-16 sm:py-24" aria-labelledby="sample-heading">
        <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 id="sample-heading" className="text-3xl sm:text-4xl">What a verified result looks like</h2>
            <p className="lede mt-2">This is the example plaque record, {SAMPLE_DPI}. Try it yourself above.</p>
          </div>
          <ButtonLink to={`/verify/${SAMPLE_DPI}`} variant="outline" size="sm">
            Open sample record
          </ButtonLink>
        </Reveal>
        <Reveal>{sample.status === "verified" && <VerifiedResult record={sample.record} animate={false} />}</Reveal>
        <Reveal className="mt-4">
          <NoMatch />
        </Reveal>
      </section>
      <CheckBeforeCommit />
      <FaqSection faqs={VERIFY_FAQS} />
      <CtaBanner />
    </>
  );
}
