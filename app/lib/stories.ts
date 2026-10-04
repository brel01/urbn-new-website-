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
    excerpt: "Our first city is officially open. Here's what that means, and where we're headed next.",
    image: "/images/story-ibadan.webp",
    imageAlt: "Newspaper headline: Developing Nigeria's properties are getting an identity",
    category: "Announcements",
    date: "2026-08-08",
    readMins: 3,
    body: [
      {
        p: "Today, Urbn is officially live in Ibadan. From now on, owners and agents in the city can submit properties for verification, and anyone can check a property's Digital Property Identity (DPI) before they pay a single naira.",
      },
      {
        h: "Why Ibadan first",
        p: "Ibadan is one of Nigeria's largest and fastest-growing cities, with a huge rental market around its universities, markets and new estates. It's also a city where too many people have paid for homes that weren't what they were promised. That makes it the right place to prove that verification can work at street level.",
      },
      {
        h: "What 'live' means",
        p: "Live means the full verification pipeline is running: identity checks, title document checks and in-person inspections by our team. Every verified property gets a permanent DPI and can request a physical plaque with a QR code anyone can scan.",
      },
      {
        h: "What's next",
        p: "Lagos, Abuja and Port Harcourt are next. We're expanding carefully, city by city, because a verification you can't trust is worse than none at all. Join the waitlist and we'll let you know the moment Urbn launches near you.",
      },
    ],
  },
  {
    slug: "behind-every-plaque-a-verified-property",
    title: "Behind Every Plaque, a Verified Property",
    excerpt:
      "A look at what happens before a DPI is issued: KYC, title checks, and a physical visit, every single time.",
    image: "/images/story-plaque.webp",
    imageAlt: "Ever wondered if your property has a digital identity? Urbn gives it one.",
    category: "Product",
    date: "2026-07-21",
    readMins: 4,
    body: [
      {
        p: "A DPI plaque on a gate looks simple: a house number, an address and a QR code. But no plaque goes up until a property has passed every step of Urbn's verification. Here's what happens behind the scenes.",
      },
      { h: "1. Submission", p: "An owner or agent submits the property with its address, ownership information and supporting documents: a Certificate of Occupancy, deed or equivalent." },
      { h: "2. Identity check (KYC)", p: "We confirm that the person submitting is who they say they are, and that they have the right to submit this property." },
      { h: "3. Document verification", p: "We check the title documents against the property and the claimed owner. If something doesn't line up, the process stops here." },
      { h: "4. Physical inspection", p: "Someone from our team visits the property in person, confirming it exists, matches the documents and matches the house number on record." },
      {
        h: "5. DPI issued, plaque requested",
        p: "Only then is the DPI issued. The owner can request a physical plaque for the property and a virtual plaque to share online. From that moment, the record never resets: tenancies, payments and disputes are logged against it permanently.",
      },
    ],
  },
  {
    slug: "latunde-is-missing",
    title: "LaTunde Is Missing",
    excerpt:
      "A young man in his early 20s went quiet online, and people everywhere kept asking: where is Latunde? Is he missing?",
    image: "/images/story-latunde.webp",
    imageAlt: "Campaign poster: LaTunde is missing. Where did Latunde go?",
    category: "Stories",
    date: "2026-07-02",
    readMins: 3,
    body: [
      {
        p: "For weeks, the same question kept appearing in comment sections and group chats: where is Latunde? A young man in his early 20s, usually always online, had suddenly gone quiet. People from all over the world kept asking if he was missing.",
      },
      {
        h: "Where Latunde went",
        p: "Latunde wasn't lost. He was house-hunting. Like thousands of renters, he spent his days chasing listings that turned out to be duplicates, viewing apartments with \"agents\" who didn't represent the owner, and wondering who he could trust with his deposit.",
      },
      {
        h: "The part nobody talks about",
        p: "Countless buyers and renters lose money to fake or duplicate listings every year. One in three property deals in Nigeria involves a documentation dispute. And until now, there has been no shared identity layer for real estate to check any of it against.",
      },
      {
        h: "How the story ends",
        p: "Latunde's story ends the way we want every house hunt to end: he found a home with a DPI, checked it in seconds, booked an inspection, and moved in knowing exactly who owned it. Search verified homes on Urbn and make sure your story ends the same way.",
      },
    ],
  },
];

export const getStory = (slug: string) => STORIES.find((s) => s.slug === slug);
