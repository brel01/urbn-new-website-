import {
  Church,
  DoorOpen,
  Factory,
  GraduationCap,
  HardHat,
  HeartHandshake,
  Home,
  Landmark,
  type LucideIcon,
  MoreHorizontal,
  Sprout,
  Stethoscope,
  Store,
  Users,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import type { ActivityType, NearbyPlace } from "./types";

/** Same labels, icons and tints as the app's activityTypeMeta, so a type looks identical everywhere. */
export const ACTIVITY_META: Record<ActivityType, { label: string; plural: string; icon: LucideIcon; tint: string; dot: string }> = {
  BUSINESS: { label: "Business", plural: "Businesses", icon: Store, tint: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  RESTAURANT: { label: "Restaurant", plural: "Restaurants", icon: UtensilsCrossed, tint: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  SCHOOL: { label: "School", plural: "Schools", icon: GraduationCap, tint: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  CLINIC: { label: "Clinic", plural: "Clinics", icon: Stethoscope, tint: "bg-red-100 text-red-700", dot: "bg-red-500" },
  RELIGIOUS: { label: "Religious", plural: "Places of Worship", icon: Church, tint: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  COMMUNITY: { label: "Community", plural: "Community", icon: Users, tint: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
  NGO: { label: "NGO", plural: "NGOs", icon: HeartHandshake, tint: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
  GOVERNMENT: { label: "Government", plural: "Government", icon: Landmark, tint: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  WAREHOUSE: { label: "Warehouse", plural: "Warehouses", icon: Warehouse, tint: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  INDUSTRIAL: { label: "Industrial", plural: "Industrial", icon: Factory, tint: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  AGRICULTURAL: { label: "Agricultural", plural: "Agricultural", icon: Sprout, tint: "bg-green-100 text-green-700", dot: "bg-green-500" },
  RESIDENCE: { label: "Residence", plural: "Residences", icon: Home, tint: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  UNDER_CONSTRUCTION: { label: "Under Construction", plural: "Under Construction", icon: HardHat, tint: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  VACANT: { label: "Vacant", plural: "Vacant", icon: DoorOpen, tint: "bg-mist text-neutral-600", dot: "bg-neutral-400" },
  OTHER: { label: "Other", plural: "Other", icon: MoreHorizontal, tint: "bg-mist text-neutral-600", dot: "bg-neutral-400" },
};

/** Shortcut chips (from the feature demo), mapped to real categories. "All" plus a full selector keeps the scope open. */
export const SHORTCUT_TYPES: ActivityType[] = ["BUSINESS", "RESTAURANT", "SCHOOL", "CLINIC", "RELIGIOUS"];

/** Residences and empty/under-construction records aren't public places to discover. */
export const DISCOVERABLE_TYPES = (Object.keys(ACTIVITY_META) as ActivityType[]).filter(
  (t) => t !== "RESIDENCE" && t !== "VACANT" && t !== "UNDER_CONSTRUCTION",
);

/** Public title: the place's name, or an approved label when the record has none. */
export const placeTitle = (p: Pick<NearbyPlace, "name" | "activityType" | "property">) =>
  p.name?.trim() || `${ACTIVITY_META[p.activityType].label}${p.property.area ? ` in ${p.property.area}` : ""}`;

export const placeSubtitle = (p: Pick<NearbyPlace, "activityType" | "businessCategory" | "property">) =>
  [p.businessCategory || ACTIVITY_META[p.activityType].label, p.property.area ?? p.property.city].filter(Boolean).join(" · ");
