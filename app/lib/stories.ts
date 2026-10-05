// Blog / Stories. Copy is draft and should be reviewed by the URBN team
// before launch (see README → "Content to confirm").

export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: "Stories" | "Product" | "Announcements";
  date: string;
  readMins: number;
  body: { h?: string; p: string }[];
};

export const STORIES: Story[] = [
  {
    slug: "urbn-is-live-in-ibadan",
    title: "Urbn Is Live in Ibadan",
    excerpt: "Explore what you can do with Urbn in our first city, from property records to listings and inspections.",
    image: "/images/story-ibadan.webp",
    imageAlt: "Newspaper headline: Developing Nigeria's properties are getting an identity",
    category: "Announcements",
    date: "2026-08-08",
    readMins: 2,
    body: [
      {
        p: "Urbn is now available in Ibadan. Owners and managers in the city can add their properties to Urbn, and anyone can look up a property's Digital Property Identity (DPI) to view its available record and verification status.",
      },
      {
        h: "What you can do today",
        p: "Browse homes, shops and offices for rent and sale across Ibadan, check a property's record, discover businesses and services nearby, request physical or virtual inspections and message owners or managers in the app. Owners and managers can register a property and follow its verification status in Urbn.",
      },
      {
        h: "Why we're starting in Ibadan",
        p: "We want to build with local knowledge and establish coverage properly before expanding. Starting in one city lets us do that.",
      },
      {
        h: "What's next",
        p: "We'll announce additional locations as coverage becomes available. Sign up for launch updates and we'll email you when Urbn becomes available near you.",
      },
    ],
  },
  {
    slug: "how-urbn-reviews-a-property",
    title: "How Urbn Reviews a Property",
    excerpt: "A closer look at the information and checks behind a property's verification status.",
    image: "/images/story-plaque.webp",
    imageAlt: "Urbn campaign poster showing a property with a DPI plaque",
    category: "Product",
    date: "2026-07-21",
    readMins: 3,
    body: [
      {
        p: "A DPI plaque looks simple: a DPI code, a house number and a QR code. Behind it is a property record and a verification status. Here's how a property gets there.",
      },
      { h: "1. Add property details", p: "An owner or manager adds the property's address and details in the Urbn app, with the information required for their role." },
      { h: "2. Complete required identity checks", p: "The person submitting the property confirms their identity with a valid government-issued ID." },
      { h: "3. Submit supporting documents", p: "Our team reviews the documents submitted for the property. If more information is needed, the applicant receives a request to update their submission." },
      { h: "4. Complete the required property checks", p: "Urbn carries out the checks required for the property, which can include a visit to confirm its details." },
      {
        h: "5. View the verification status",
        p: "Once approved, the property's DPI and record are available to check, and the owner can see the available plaque options in Urbn. Anyone can scan the plaque or enter the DPI code to view the record and its current status.",
      },
    ],
  },
];

export const getStory = (slug: string) => STORIES.find((s) => s.slug === slug);
