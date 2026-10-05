export type Place = {
  slug: string;
  name: string;
  kind: "city" | "area";
  city: string;
  state: string;
  /** LGA name as stored by the Urbn API (nigeria-geo data) */
  lga: string | null;
  aliases: string[];
  live: boolean;
  blurb: string;
};

// Ibadan is live; the rest are on the roadmap ("Ibadan, with Lagos,
// Abuja, and Port Harcourt next").
export const PLACES: Place[] = [
  {
    slug: "ibadan",
    name: "Ibadan",
    kind: "city",
    city: "Ibadan",
    state: "Oyo",
    lga: null,
    aliases: ["ibadan", "oyo"],
    live: true,
    blurb:
      "Urbn's first city. Browse homes across Ibadan and check each property's current Urbn record.",
  },
  {
    slug: "bodija",
    name: "Bodija",
    kind: "area",
    city: "Ibadan",
    state: "Oyo",
    lga: "Ibadan North",
    aliases: ["new bodija", "old bodija"],
    live: true,
    blurb: "Quiet, central and close to the University of Ibadan and Bodija Market.",
  },
  {
    slug: "akobo",
    name: "Akobo",
    kind: "area",
    city: "Ibadan",
    state: "Oyo",
    lga: "Lagelu",
    aliases: ["kolapo ishola", "odejayi"],
    live: true,
    blurb: "Newer estates, family-sized homes and quick access to the Lagos–Ibadan corridor.",
  },
  {
    slug: "jericho",
    name: "Jericho",
    kind: "area",
    city: "Ibadan",
    state: "Oyo",
    lga: "Ibadan North-West",
    aliases: ["jericho gra", "dugbe"],
    live: true,
    blurb: "Established, green and well-serviced. Jericho is popular with professionals and families alike.",
  },
  {
    slug: "oluyole",
    name: "Oluyole",
    kind: "area",
    city: "Ibadan",
    state: "Oyo",
    lga: "Ibadan South-West",
    aliases: ["oluyole estate", "ring road", "challenge"],
    live: true,
    blurb: "Oluyole Estate pairs wide streets with good-value apartments and duplexes.",
  },
  {
    slug: "samonda",
    name: "Samonda",
    kind: "area",
    city: "Ibadan",
    state: "Oyo",
    lga: "Akinyele",
    aliases: ["aerodrome", "sango", "ui", "agbowo", "poly"],
    live: true,
    blurb: "Minutes from UI and The Polytechnic, Ibadan, Samonda is a favourite with students and young professionals.",
  },
  { slug: "lagos", name: "Lagos", kind: "city", city: "Lagos", state: "Lagos", lga: null, aliases: ["lagos"], live: false, blurb: "Urbn isn't available in Lagos yet." },
  { slug: "lekki", name: "Lekki", kind: "area", city: "Lagos", state: "Lagos", lga: "Eti-Osa", aliases: ["lekki phase 1", "ajah", "victoria island", "vi"], live: false, blurb: "Urbn isn't available in Lekki yet." },
  { slug: "yaba", name: "Yaba", kind: "area", city: "Lagos", state: "Lagos", lga: "Lagos Mainland", aliases: ["surulere"], live: false, blurb: "Urbn isn't available in Yaba yet." },
  { slug: "ikeja", name: "Ikeja", kind: "area", city: "Lagos", state: "Lagos", lga: "Ikeja", aliases: ["gra ikeja", "allen avenue"], live: false, blurb: "Urbn isn't available in Ikeja yet." },
  { slug: "abuja", name: "Abuja", kind: "city", city: "Abuja", state: "FCT", lga: null, aliases: ["abuja", "maitama", "wuse", "garki"], live: false, blurb: "Urbn isn't available in Abuja yet." },
  { slug: "port-harcourt", name: "Port Harcourt", kind: "city", city: "Port Harcourt", state: "Rivers", lga: null, aliases: ["port harcourt", "ph"], live: false, blurb: "Urbn isn't available in Port Harcourt yet." },
];

export const getPlace = (slug: string) => PLACES.find((p) => p.slug === slug);
export const LIVE_AREAS = PLACES.filter((p) => p.kind === "area" && p.live);

/** Ibadan LGAs (Oyo State) offered in the area filter, as named by the API. */
export const IBADAN_LGAS = [
  "Akinyele",
  "Egbeda",
  "Ibadan North",
  "Ibadan North-East",
  "Ibadan North-West",
  "Ibadan South-East",
  "Ibadan South-West",
  "Ido",
  "Lagelu",
  "Oluyole",
  "Ona Ara",
];
