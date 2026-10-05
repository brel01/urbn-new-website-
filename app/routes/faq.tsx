import { clsx } from "clsx";
import { useState } from "react";
import { CtaBanner } from "~/components/cta-banner";
import { FaqList } from "~/components/faq";
import { Reveal, WordsReveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { ALL_FAQS, FAQ_GROUPS } from "~/lib/faqs";
import { breadcrumbs, faqJsonLd, seo } from "~/lib/seo";
import type { Route } from "./+types/faq";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Urbn FAQs | Property Identity, Inspections & Getting Started",
    description:
      "Find answers about DPI, property records, inspections, U-Beep and using Urbn.",
    path: "/faq",
    jsonLd: [
      faqJsonLd(ALL_FAQS),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "FAQs", path: "/faq" },
      ]),
    ],
  });

export default function FaqPage() {
  const [group, setGroup] = useState(FAQ_GROUPS[0].id);
  const current = FAQ_GROUPS.find((g) => g.id === group)!;
  return (
    <>
      <section className="container-x pt-16 pb-24 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <WordsReveal text="Frequently Asked Questions" className="text-5xl leading-[1] sm:text-7xl" />
          <p className="lede mt-5">Find answers about property records, verification and using Urbn.</p>
        </div>
        <div role="tablist" aria-label="FAQ topics" className="no-scrollbar -mx-4 mt-12 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
          {FAQ_GROUPS.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={group === g.id}
              onClick={() => setGroup(g.id)}
              className={clsx(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition",
                group === g.id ? "bg-ink text-white" : "bg-mist text-neutral-700 hover:bg-fog",
              )}
            >
              {g.title}
            </button>
          ))}
        </div>
        <Reveal key={group} className="mx-auto mt-10 max-w-3xl">
          <FaqList faqs={current.items} columns={1} />
        </Reveal>
        {/* All answers stay in the HTML for search engines and no-JS readers */}
        <div className="sr-only">
          {FAQ_GROUPS.filter((g) => g.id !== group).map((g) => (
            <section key={g.id}>
              <h2>{g.title}</h2>
              {g.items.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          ))}
        </div>
        <div className="mx-auto mt-16 max-w-3xl rounded-card bg-mist p-8 text-center">
          <h2 className="text-2xl">Still Have a Question?</h2>
          <p className="mt-2 text-neutral-600">Send the Urbn team a message.</p>
          <ButtonLink to="/contact" variant="dark" className="mt-5">Contact Us</ButtonLink>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
