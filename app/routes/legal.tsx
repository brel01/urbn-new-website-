import { useMatches } from "react-router";
import { seo } from "~/lib/seo";
import { SITE } from "~/lib/site";
import type { Route } from "./+types/legal";
import { PageSky } from "~/components/city-scene";

// DRAFT legal copy: must be reviewed by counsel before launch.
const DOCS = {
  terms: {
    path: "/terms",
    title: "Terms of Service",
    updated: "2026-08-01",
    sections: [
      { h: "1. About these terms", p: `These Terms of Service govern your use of the ${SITE.name} website and app (the "Service"). By using the Service you agree to these terms.` },
      { h: "2. What a DPI is, and isn't", p: "A Digital Property Identity (DPI) records that a property passed Urbn's verification checks at the time of issuance. It is not a land title, a survey, or a substitute for professional legal advice on a transaction." },
      { h: "3. Your account", p: "You're responsible for the information you submit, including identity and property documents, and for keeping your login details secure. Submitting false information or documents will result in removal from the Service." },
      { h: "4. Listings and inspections", p: "Owners, agents and property managers are responsible for the accuracy of their listings. Check the property record before paying, and for transactions arranged through Urbn, use the payment instructions shown in the app." },
      { h: "5. Acceptable use", p: "Don't misuse the Service: no scraping, impersonation, fraudulent listings, or attempts to interfere with the integrity of DPI records." },
      { h: "6. Liability", p: "To the extent permitted by Nigerian law, Urbn is not liable for losses arising from transactions between users. Nothing in these terms limits liability that cannot be limited by law." },
      { h: "7. Changes and contact", p: `We may update these terms and will post the latest version here. Questions? Email ${SITE.email}.` },
    ],
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy",
    updated: "2026-08-01",
    sections: [
      { h: "1. Who we are", p: `${SITE.legalName} ("Urbn") operates the Service and is the data controller for personal data processed through it, in line with the Nigeria Data Protection Act 2023.` },
      { h: "2. What we collect", p: "Account details (name, email, phone), identity verification data you provide for KYC, property and ownership documents, inspection bookings, messages sent in-app, and basic usage data such as device and log information." },
      { h: "3. Why we use it", p: "To verify identities and properties, issue and maintain DPI records, operate listings, inspections, chat and U-Beep, keep the Service secure, and, with your consent, send product updates." },
      { h: "4. What's public", p: "A DPI lookup shows a property's verification status, registered address, registration date and ownership status. It never shows owners' or residents' personal contact details." },
      { h: "5. Sharing", p: "We share data with service providers who help us run Urbn (such as hosting and identity verification partners) under contract, and with authorities where required by law. We do not sell personal data." },
      { h: "6. Your rights", p: `You can request access to, correction of, or deletion of your personal data, and withdraw consent to marketing at any time, by emailing ${SITE.email}.` },
      { h: "7. Retention & security", p: "Property records are retained for the life of the DPI by design. Personal data is retained only as long as needed for the purposes above or as required by law, and is protected with industry-standard security." },
    ],
  },
} as const;

const fromId = (id: string) => DOCS[(id as keyof typeof DOCS) in DOCS ? (id as keyof typeof DOCS) : "terms"];

export const meta: Route.MetaFunction = ({ matches }) => {
  const doc = fromId(matches[matches.length - 1]?.id ?? "terms");
  return seo({ title: doc.title, description: `${SITE.name} ${doc.title}.`, path: doc.path });
};

export default function Legal() {
  const matches = useMatches();
  const doc = fromId(matches[matches.length - 1].id);
  return (
    <>
      <PageSky />
    <article className="container-x py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-5xl sm:text-6xl">{doc.title}</h1>
        <p className="mt-6 rounded-xl bg-warning/10 p-4 text-sm text-ink">
          Draft pending approval. Urbn's approved {doc.title} will replace this text.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Last updated {new Date(doc.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="mt-12 space-y-8 text-[16px] leading-relaxed text-neutral-700">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl text-ink">{s.h}</h2>
              <p className="mt-2">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
    </>
  );
}
