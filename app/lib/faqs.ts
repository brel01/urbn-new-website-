export type Faq = { q: string; a: string; link?: { label: string; to: string } };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "dpi",
    title: "Property Identity",
    items: [
      {
        q: "What Is a DPI?",
        a: "A Digital Property Identity (DPI) links a property to its record on Urbn. That record can include property details, verification status, spaces and the activities that take place there, from homes to shops, schools and clinics.",
      },
      {
        q: "How Do I Check That a DPI Is Genuine?",
        a: "Open Urbn's official website or app and look up the code. Compare the property details and current status. A copied code or plaque alone does not establish that a transaction is legitimate.",
      },
      {
        q: "How Do I Register My Property?",
        a: "Add your property in the Urbn app, submit the required details and documents, and follow the verification updates shown there.",
      },
      {
        q: "What Happens When a Property Changes Hands?",
        a: "The property identity remains linked to the property. Ownership and related records must be updated through Urbn's required process.",
      },
      {
        q: "What Do the Parts of a DPI Code Mean?",
        a: "Take IBADAN-NORTH-0041-U. \"IBADAN-NORTH\" is the area code for the Local Government Area the property is registered in, \"0041\" is the property number within that area, and \"U\" is a check character that helps catch typing errors. Individual units can add a unit code, for example IBADAN-NORTH-0041-U/U01. A valid format is not the same as a verified record.",
      },
    ],
  },
  {
    id: "verify",
    title: "Checking a Property",
    items: [
      {
        q: "How Do I Check a Property Record?",
        a: "Enter its DPI code on Urbn's Verify page or scan its plaque. Review the available details and current verification status.",
      },
      {
        q: "Does It Cost to Check a DPI?",
        a: "Checking an available DPI record is free. Property onboarding and plaque charges, where applicable, are shown separately.",
      },
      {
        q: "What If There Is No Matching DPI?",
        a: "Check the code and ask the owner or manager for the current property record. A missing result does not prove fraud or legitimacy. Review the available documents before committing.",
      },
      {
        q: "What's the Difference Between Physical and Digital Plaques?",
        a: "A physical plaque is displayed at the property. A digital plaque is shared electronically. Both link to the same Urbn property record.",
      },
    ],
  },
  {
    id: "card",
    title: "Property Card",
    items: [
      {
        q: "What Is a Property Card?",
        a: "A Property Card shows the relationship to a property recorded on your Urbn account, as a resident or an owner.",
      },
      {
        q: "How Do I Request a Property Card?",
        a: "Request it in the Urbn app once your tenancy or ownership is recorded against the property. The app shows whether you're eligible and any charges before you request one.",
      },
    ],
  },
  {
    id: "features",
    title: "Finding & Discovering",
    items: [
      {
        q: "Should I Inspect Before Renting?",
        a: "Arrange a physical or virtual inspection and ask about details that matter to you. When booking through Urbn, check that the owner or manager has confirmed your request.",
      },
      {
        q: "Is AI Search Free?",
        a: "AI Search is available at no charge within the daily limit shown on your account. When the limit is reached, use filters or wait until the displayed reset time.",
      },
      {
        q: "How Do I Join a Community?",
        a: "Open the Community tab in the Urbn app to see the property or area communities available to your account, then join the one you need.",
      },
      {
        q: "What Is Nearby?",
        a: "Nearby shows the businesses, schools, clinics, restaurants and other places recorded at properties around you, nearest first. Use your location, search by name, filter by type and sort by Nearest, Newest or A–Z. Open a place for its details, contact options and directions. On the map, move around and tap Search this area. Nearby is on this website and in the Urbn app.",
        link: { label: "Explore Nearby", to: "/nearby" },
      },
      {
        q: "What Is U-Beep?",
        a: "U-Beep lets a visitor scan a property's DPI QR code and send an alert to eligible contacts. Notification delivery depends on internet access and device settings.",
      },
      {
        q: "Where Is Urbn Available?",
        a: "Urbn is starting in Ibadan, Oyo State. Check the app for currently supported areas and sign up for new-city updates.",
      },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);
export const faqsFor = (...questions: string[]) =>
  questions.map((q) => ALL_FAQS.find((f) => f.q === q)).filter(Boolean) as Faq[];

export const HOME_FAQS = faqsFor(
  "What Is a DPI?",
  "How Do I Check a Property Record?",
  "How Do I Check That a DPI Is Genuine?",
  "How Do I Register My Property?",
  "Does It Cost to Check a DPI?",
  "Where Is Urbn Available?",
);
export const DPI_FAQS = faqsFor(
  "How Do I Check That a DPI Is Genuine?",
  "How Do I Register My Property?",
  "What Happens When a Property Changes Hands?",
  "What Do the Parts of a DPI Code Mean?",
  "What's the Difference Between Physical and Digital Plaques?",
  "What Is a Property Card?",
);
export const VERIFY_FAQS = faqsFor(
  "How Do I Check a Property Record?",
  "What If There Is No Matching DPI?",
  "Does It Cost to Check a DPI?",
  "How Do I Check That a DPI Is Genuine?",
  "What's the Difference Between Physical and Digital Plaques?",
  "What Is a DPI?",
);
// From the Features PRD
export const FEATURE_FAQS = faqsFor(
  "Should I Inspect Before Renting?",
  "Is AI Search Free?",
  "What Is Nearby?",
  "How Do I Join a Community?",
  "What Is U-Beep?",
);
