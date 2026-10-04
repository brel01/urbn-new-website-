export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "dpi",
    title: "DPI basics",
    items: [
      {
        q: "What is a DPI?",
        a: "A DPI (Digital Property Identity) is a permanent, verified record tied to a property itself, not to its owner, agent or listing. Urbn issues it only after identity, title document and physical checks pass. Once issued, it can never be faked, duplicated or reassigned, and anyone can verify it in seconds.",
      },
      {
        q: "Can a DPI be faked?",
        a: "No. Only Urbn issues DPIs, and only after every check passes: identity, title document and physical inspection. No individual agent, owner or third party can create, edit or transfer a DPI outside Urbn's system, and every plaque's QR code resolves to the live record on Urbn.",
      },
      {
        q: "How do I get a DPI for my property?",
        a: "Submit your property in the Urbn app with its address, ownership information and supporting documents (Certificate of Occupancy, deed or equivalent). We run an identity check, verify your documents and visit the property in person. When everything checks out, your DPI is issued and you can request your plaque.",
      },
      {
        q: "What happens to the DPI when a property is sold?",
        a: "Nothing changes. The DPI stays exactly where it is. A DPI is tied to the property, not the people, so when an owner sells, a tenant moves out or an agent is reassigned, only the people associated with the record change. The full history stays on the record.",
      },
      {
        q: "What do the parts of a DPI code mean?",
        a: "Take IBADAN-NORTH-0041-U. \"IBADAN-NORTH\" is the Local Government Area the property is registered in, \"0041\" is its number within that LGA, and \"U\" is a check letter that catches typos. Individual units add a unit code, for example IBADAN-NORTH-0041-U/U01.",
      },
    ],
  },
  {
    id: "verify",
    title: "Verifying a property",
    items: [
      {
        q: "How do I verify a property?",
        a: "Enter the DPI code on the Verify page, or scan the QR code on the property's plaque. You'll see the verified record (verification status, registered address, registration date and ownership status) instantly, with no account needed.",
      },
      {
        q: "Does it cost anything to verify a property?",
        a: "No. Checking a DPI is free for everyone, and it's the one step that protects you before you pay a deposit, sign an agreement or hand over rent.",
      },
      {
        q: "What if a property has no DPI, or the code doesn't match?",
        a: "Don't panic. No match doesn't always mean something is wrong. It usually means the property hasn't been verified by Urbn yet. Check the code for typos, ask whoever is showing you the property why it isn't verified, and don't treat it as verified until it is.",
      },
      {
        q: "What's the difference between a physical and a virtual plaque?",
        a: "They're the same identity in two formats. The physical plaque is mounted on the property, so anyone standing in front of it can scan the QR code. The virtual plaque is a downloadable version you can share on WhatsApp, social media or directly with a prospective buyer or renter.",
      },
    ],
  },
  {
    id: "card",
    title: "Property Card",
    items: [
      {
        q: "What is a Property Card?",
        a: "A Property Card is a personal identity card issued by Urbn that proves your verified relationship to a property, as a resident or an owner. A DPI verifies the property itself; a Property Card verifies you.",
      },
      {
        q: "How do I get a Property Card?",
        a: "Once your tenancy or ownership is logged against a property's DPI, request your card in the Urbn app. Urbn confirms the relationship is accurate, then issues the card, usually within a few days.",
      },
      {
        q: "What's on a Property Card?",
        a: "Your name, your permanent User ID, an issue date and a QR code that pulls up your verified relationships in real time. It isn't tied to one property, so it works no matter how many properties you're connected to.",
      },
    ],
  },
  {
    id: "features",
    title: "Finding & renting",
    items: [
      {
        q: "Do I need to book an inspection before renting?",
        a: "We strongly recommend it. In the Urbn app you can book a physical visit or start with a virtual walkthrough, whichever suits your schedule. Pick a time, the agent or owner confirms, and once it's booked you can track their live location so you know they're on their way.",
      },
      {
        q: "Is the AI search assistant free to use?",
        a: "Yes. Searching on Urbn, including with the AI search assistant, is free. Tell it what you want, like \"2-bedroom in Bodija under ₦800k\", and it does the searching for you. The more specific you are, the better it finds.",
      },
      {
        q: "How do I join a neighborhood community?",
        a: "Open the Community tab in the Urbn app and join the space for your building or area. Once you're in, you can ask questions, share tips and connect with your neighbours.",
      },
      {
        q: "What is U-Beep?",
        a: "U-Beep is the digital doorbell for every Urbn property. Scan the DPI QR code on the plaque to let the right person know you're there (a delivery, a visitor, a service appointment or something urgent) without needing anyone's phone number.",
      },
      {
        q: "Which cities is Urbn available in?",
        a: "Urbn is live in Ibadan, with Lagos, Abuja and Port Harcourt next. We're expanding carefully, city by city, with verification you can trust. Join the waitlist to hear when we launch near you.",
      },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);
export const faqsFor = (...questions: string[]) =>
  questions.map((q) => ALL_FAQS.find((f) => f.q === q)).filter(Boolean) as Faq[];

export const HOME_FAQS = faqsFor(
  "What is a DPI?",
  "How do I verify a property?",
  "Can a DPI be faked?",
  "How do I get a Property Card?",
  "Does it cost anything to verify a property?",
  "Which cities is Urbn available in?",
);
export const DPI_FAQS = faqsFor(
  "Can a DPI be faked?",
  "How do I get a DPI for my property?",
  "What happens to the DPI when a property is sold?",
  "What do the parts of a DPI code mean?",
  "What's the difference between a physical and a virtual plaque?",
  "What is a Property Card?",
);
export const VERIFY_FAQS = faqsFor(
  "How do I verify a property?",
  "What if a property has no DPI, or the code doesn't match?",
  "Does it cost anything to verify a property?",
  "Can a DPI be faked?",
  "What's the difference between a physical and a virtual plaque?",
  "What is a DPI?",
);
// From the Features PRD
export const FEATURE_FAQS = faqsFor(
  "Do I need to book an inspection before renting?",
  "Is the AI search assistant free to use?",
  "How do I join a neighborhood community?",
);
