// Blog / Stories. Real posts come from Medium (`npm run import:medium`, which
// writes medium-stories.generated.ts). The drafts below only show while no
// Medium posts have been imported.
import { MEDIUM_STORIES } from "./medium-stories.generated";

/**
 * Body blocks. `html` fields carry inline markup only (a, strong, em, code, br),
 * sanitised by the importer, so they're safe to render as HTML.
 */
export type StoryBlock =
  | { type: "h"; text: string }
  | { type: "p"; html: string }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "quote"; html: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "embed"; url: string; title?: string };

export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  /** "contain" for portrait poster covers that must not be cropped. */
  imageFit?: "contain";
  category: string;
  date: string;
  readMins: number;
  body: StoryBlock[];
  /** Original post, for imported stories. */
  sourceUrl?: string;
};

const DRAFT_STORIES: Story[] = [
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
      { type: "p", html: "Urbn is now available in Ibadan. Owners and managers in the city can add their properties to Urbn, and anyone can look up a property's Digital Property Identity (DPI) to view its available record and verification status." },
      { type: "h", text: "What you can do today" }, { type: "p", html: "Browse homes, shops and offices for rent and sale across Ibadan, check a property's record, discover businesses and services nearby, request physical or virtual inspections and message owners or managers in the app. Owners and managers can register a property and follow its verification status in Urbn." },
      { type: "h", text: "Why we're starting in Ibadan" }, { type: "p", html: "We want to build with local knowledge and establish coverage properly before expanding. Starting in one city lets us do that." },
      { type: "h", text: "What's next" }, { type: "p", html: "We'll announce additional locations as coverage becomes available. Sign up for launch updates and we'll email you when Urbn becomes available near you." },
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
      { type: "p", html: "A DPI plaque looks simple: a DPI code, a house number and a QR code. Behind it is a property record and a verification status. Here's how a property gets there." },
      { type: "h", text: "1. Add property details" }, { type: "p", html: "An owner or manager adds the property's address and details in the Urbn app, with the information required for their role." },
      { type: "h", text: "2. Complete required identity checks" }, { type: "p", html: "The person submitting the property confirms their identity with a valid government-issued ID." },
      { type: "h", text: "3. Submit supporting documents" }, { type: "p", html: "Our team reviews the documents submitted for the property. If more information is needed, the applicant receives a request to update their submission." },
      { type: "h", text: "4. Complete the required property checks" }, { type: "p", html: "Urbn carries out the checks required for the property, which can include a visit to confirm its details." },
      { type: "h", text: "5. View the verification status" }, { type: "p", html: "Once approved, the property's DPI and record are available to check, and the owner can see the available plaque options in Urbn. Anyone can scan the plaque or enter the DPI code to view the record and its current status." },
    ],
  },
];

export const STORIES: Story[] = MEDIUM_STORIES.length > 0 ? MEDIUM_STORIES : DRAFT_STORIES;

export const getStory = (slug: string) => STORIES.find((s) => s.slug === slug);

/** Card/thumbnail classes for a story cover: poster covers are shown whole on a tint. */
export const coverFit = (s: Pick<Story, "imageFit">) =>
  s.imageFit === "contain" ? "object-contain bg-blue-50 p-3" : "object-cover";
