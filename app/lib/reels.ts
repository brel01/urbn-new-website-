// Property Reels: listings with a video, shown as a vertical feed (the app's Reels
// tab, urbn-mobile src/app/(app)/reels.tsx). Watching and sharing work on the web;
// liking, saving, commenting and the rest continue in the app.
import { type ListingCard, type Paged, slugify } from "./marketplace/types";

export type Reel = ListingCard;

export const reelVideo = (l: Pick<ListingCard, "listingVideoUrl" | "propertyVideoUrl">) => l.listingVideoUrl ?? l.propertyVideoUrl;

export const reelPoster = (l: Pick<ListingCard, "listingVideoPosterUrl" | "propertyVideoPosterUrl" | "thumbnailUrl">) =>
  l.listingVideoPosterUrl ?? l.propertyVideoPosterUrl ?? l.thumbnailUrl;

export const reelPath = (l: Pick<ListingCard, "id" | "propertyTitle" | "propertyCity">) =>
  `/reels/${encodeURIComponent(l.id)}/${slugify(`${l.propertyTitle} ${l.propertyCity}`)}`;

/** Opens this listing in the Urbn app (expo-router route /listing/[id], scheme `urbn`). */
export const appListingLink = (id: string) => `urbn://listing/${encodeURIComponent(id)}`;

export type ReelsPage = Paged<Reel> & { source: "live" | "sample" };

/** Same shape as the app's Comment (urbn-mobile src/types/comment.types.ts). Names are first name + initial. */
export type ReelComment = {
  id: string;
  text: string | null;
  isDeleted: boolean;
  createdAt: string;
  user: { id: string; firstName: string; lastInitial: string; profileImageUrl: string | null } | null;
  replyCount: number;
};

export type ReelComments = { data: ReelComment[]; nextCursor: string | null; source: "live" | "sample"; unavailable?: boolean };
