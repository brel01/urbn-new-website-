// Labelled SAMPLE places, shown until URBN_API_URL connects live public
// activity data. Every record carries `sample: true` and the UI says so.
// Names are illustrative; they don't describe real businesses.
import { makeDpi } from "../dpi";
import type { NearbyPlace, NearbyPlaceExtras } from "./types";

export type SampleProperty = {
  id: string;
  dpi: string;
  name: string;
  address: string;
  area: string;
  lga: string;
  lat: number;
  lng: number;
  registeredOn: string;
  units?: string[];
};

const prop = (id: string, name: string, address: string, area: string, lga: string, seq: number, lat: number, lng: number, units?: string[]): SampleProperty => ({
  id,
  dpi: makeDpi(lga, seq),
  name,
  address,
  area,
  lga,
  lat,
  lng,
  registeredOn: "2026-06-15",
  units,
});

export const SAMPLE_PROPERTIES: SampleProperty[] = [
  prop("sp-bodija-plaza", "Kolapo Ishola Plaza", "14 Kolapo Ishola Road, Bodija", "Bodija", "Ibadan North", 120, 7.4338, 3.9131, ["U01", "U02"]),
  prop("sp-brightfield", "Brightfield School Premises", "3 Awolowo Avenue, Bodija", "Bodija", "Ibadan North", 121, 7.4299, 3.9092),
  prop("sp-bodija-clinic", "Bodija Health Centre Building", "22 Oluyole Close, Bodija", "Bodija", "Ibadan North", 122, 7.4271, 3.9158),
  prop("sp-akobo-mart", "Akobo Shopping Court", "1 Olorunsogo Road, Akobo", "Akobo", "Lagelu", 210, 7.4352, 3.9623),
  prop("sp-akobo-hall", "Akobo Community Centre", "Community Road, Akobo", "Akobo", "Lagelu", 211, 7.4315, 3.9668),
  prop("sp-akobo-chapel", "Akobo Chapel Grounds", "8 Ojoo-Akobo Road, Akobo", "Akobo", "Lagelu", 212, 7.4288, 3.9601),
  prop("sp-jericho-eye", "Jericho Medical House", "5 Jericho GRA Road, Jericho", "Jericho", "Ibadan North-West", 310, 7.4024, 3.8721),
  prop("sp-jericho-hub", "Jericho Business Suites", "11 Iyaganku Road, Jericho", "Jericho", "Ibadan North-West", 311, 7.3992, 3.8684, ["U01", "U02", "U03"]),
  prop("sp-oluyole-wh", "Oluyole Industrial Yard", "Plot 7, Oluyole Industrial Estate", "Oluyole", "Ibadan South-West", 410, 7.3561, 3.8742),
  prop("sp-ringroad-grill", "Ring Road Food Court", "40 Ring Road, Oluyole", "Oluyole", "Ibadan South-West", 411, 7.3637, 3.8826),
  prop("sp-oluyole-college", "Oluyole College Campus", "2 Old Lagos Road, Oluyole", "Oluyole", "Ibadan South-West", 412, 7.3602, 3.8768),
  prop("sp-samonda-print", "Samonda Shops", "17 Samonda Road, Samonda", "Samonda", "Akinyele", 510, 7.4391, 3.8948),
  prop("sp-samonda-mosque", "Samonda Mosque Grounds", "Mosque Street, Samonda", "Samonda", "Akinyele", 511, 7.4362, 3.8912),
  prop("sp-samonda-ngo", "Samonda Skills House", "6 Polytechnic Road, Samonda", "Samonda", "Akinyele", 512, 7.4403, 3.8919),
];

const byId = Object.fromEntries(SAMPLE_PROPERTIES.map((p) => [p.id, p]));

const place = (
  id: string,
  propertyId: string,
  activityType: NearbyPlace["activityType"],
  name: string,
  businessCategory: string | null,
  description: string,
  unit?: string,
): NearbyPlace => {
  const p = byId[propertyId];
  return {
    id,
    activityType,
    name,
    description,
    businessCategory,
    imageUrl: null,
    contactPhone: null,
    socialLinks: null,
    property: { id: p.id, dpi: p.dpi, address: p.address, city: "Ibadan", area: p.area },
    unit: unit ? { id: `${p.id}-${unit}`, unitNumber: unit } : null,
    lat: p.lat,
    lng: p.lng,
    sample: true,
  };
};

export const SAMPLE_PLACES: NearbyPlace[] = [
  place("sa-001", "sp-bodija-plaza", "BUSINESS", "Kolapo Pharmacy", "Pharmacy", "A neighbourhood pharmacy on the ground floor of the plaza, recorded against unit U01.", "U01"),
  place("sa-002", "sp-bodija-plaza", "RESTAURANT", "Bodija Corner Kitchen", "Local dishes", "Amala, ewedu and daily specials, recorded against unit U02 of the same plaza.", "U02"),
  place("sa-003", "sp-brightfield", "SCHOOL", "Brightfield Nursery & Primary School", null, "A nursery and primary school recorded at this property."),
  place("sa-004", "sp-bodija-clinic", "CLINIC", "Bodija Family Clinic", null, "A general outpatient clinic recorded at this property."),
  place("sa-005", "sp-akobo-mart", "BUSINESS", "Akobo Fresh Mart", "Supermarket", "Groceries and household items."),
  place("sa-006", "sp-akobo-hall", "COMMUNITY", "Akobo Community Hall", null, "A community hall used for residents' meetings and events."),
  place("sa-007", "sp-akobo-chapel", "RELIGIOUS", "Grace Chapel Akobo", null, "A place of worship recorded at this property."),
  place("sa-008", "sp-jericho-eye", "CLINIC", "Jericho Eye Care", "Eye clinic", "Eye tests and consultations."),
  place("sa-009", "sp-jericho-hub", "BUSINESS", "Jericho Co-working Hub", "Co-working space", "Shared desks and meeting rooms on the second floor, recorded against unit U02.", "U02"),
  place("sa-010", "sp-jericho-hub", "NGO", "Read Ibadan Initiative", null, "A literacy programme with an office in unit U03.", "U03"),
  place("sa-011", "sp-oluyole-wh", "WAREHOUSE", "Oluyole Logistics Depot", "Storage & distribution", "A storage and distribution warehouse in the industrial estate."),
  place("sa-012", "sp-ringroad-grill", "RESTAURANT", "Ring Road Grill", "Grill & suya", "Grills, suya and drinks."),
  place("sa-013", "sp-oluyole-college", "SCHOOL", "Oluyole Model College", "Secondary school", "A secondary school recorded at this property."),
  place("sa-014", "sp-samonda-print", "BUSINESS", "Samonda Print & Copy", "Printing", "Printing, binding and photocopying near the Polytechnic."),
  place("sa-015", "sp-samonda-mosque", "RELIGIOUS", "Samonda Central Mosque", null, "A place of worship recorded at this property."),
  place("sa-016", "sp-samonda-ngo", "NGO", "Youth Skills Foundation", null, "Digital and vocational skills classes for young people."),
];

// Sample contact details show which channels a place can list (phone, WhatsApp,
// socials, website). They are placeholders: the UI renders them without links,
// so nobody is sent to a real number or account.
const SAMPLE_CONTACT: NearbyPlace["socialLinks"] = {
  whatsapp: "https://wa.me/2340000000000",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/",
  website: "https://example.com/",
};
for (const p of SAMPLE_PLACES) {
  if (["sa-001", "sa-002", "sa-004", "sa-005", "sa-008", "sa-009", "sa-012", "sa-014"].includes(p.id)) {
    p.contactPhone = "+234 000 000 0000";
    p.socialLinks = p.activityType === "CLINIC" ? { whatsapp: SAMPLE_CONTACT.whatsapp } : SAMPLE_CONTACT;
  }
}

const extras = (e: Partial<NearbyPlaceExtras>): NearbyPlaceExtras => ({
  schoolLevel: null,
  cropTypes: [],
  livestockTypes: [],
  facilityUse: null,
  createdAt: "2026-06-15T00:00:00.000Z",
  ...e,
});

/** Detail-only fields for sample places (school level, facility use, crops, livestock, date recorded). */
export const SAMPLE_EXTRAS: Record<string, NearbyPlaceExtras> = Object.fromEntries(
  SAMPLE_PLACES.map((p) => [
    p.id,
    extras(
      p.id === "sa-003" ? { schoolLevel: "Nursery & Primary" }
      : p.id === "sa-013" ? { schoolLevel: "Secondary" }
      : p.id === "sa-011" ? { facilityUse: "Storage & distribution" }
      : {},
    ),
  ]),
);
