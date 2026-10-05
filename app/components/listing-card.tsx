import { clsx } from "clsx";
import { Bookmark, Building2, Eye, Heart, Home, MessageCircle, Play, Star, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import {
  type ListingCard as Card,
  formatCount,
  formatPrice,
  formatTextCase,
  listedByLabel,
  listingPath,
  listingTypeLabel,
  roomCount,
} from "~/lib/marketplace/types";

/** Web twin of the app's MarketplaceListingCard. */
export function ListingCard({ listing, priority = false, className }: { listing: Card; priority?: boolean; className?: string }) {
  const [saved, setSaved] = useState(false);
  const image = listing.listingVideoPosterUrl ?? listing.propertyVideoPosterUrl ?? listing.thumbnailUrl;
  const hasVideo = !!(listing.listingVideoUrl ?? listing.propertyVideoUrl);
  const beds = roomCount(listing, "Bedroom");
  const baths = roomCount(listing, "Bathroom");
  const chips = [
    listing.structureType ?? (listing.isMainUnit ? "Whole Property" : "Unit"),
    beds != null && `${beds} bed`,
    baths != null && `${baths} bath`,
    listing.unitCount != null && `${listing.unitCount} unit${listing.unitCount !== 1 ? "s" : ""}`,
    listing.propertyBuildingType &&
      !(listing.structureType ?? "").toLowerCase().includes(formatTextCase(listing.propertyBuildingType).toLowerCase()) &&
      formatTextCase(listing.propertyBuildingType),
    listing.squareFootage && `${listing.squareFootage} sqm`,
    listing.furnishingStatus && formatTextCase(listing.furnishingStatus),
    listing.inventoryCount ? `Inventory: ${listing.inventoryCount} items` : null,
  ].filter(Boolean) as string[];

  return (
    <article
      className={clsx(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.04] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="relative h-52 overflow-hidden bg-mist">
        {image ? (
          <img
            src={image}
            alt={`${listing.propertyTitle} in ${listing.propertyCity}`}
            loading={priority ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-neutral-300">
            <Home className="size-10" strokeWidth={1.5} />
          </div>
        )}
        {hasVideo && (
          <span className="absolute bottom-3 left-3 grid size-8 place-items-center rounded-full bg-black/55" aria-label="Video Tour">
            <Play className="size-3.5 fill-white text-white" />
          </span>
        )}
        {listing.isFeatured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-urbn px-3 py-1 text-[10px] font-bold text-white">
            <Star className="size-2.5 fill-white" /> Featured
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-black px-3 py-1 text-[10px] font-bold text-white">
          {listingTypeLabel(listing.listingType)}
        </span>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={saved ? `Unsave ${listing.propertyTitle}` : `Save ${listing.propertyTitle}`}
          className="absolute right-3 bottom-3 z-10 grid size-8 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
        >
          <motion.span animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <Bookmark className={clsx("size-4", saved && "fill-white")} />
          </motion.span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xl font-bold tracking-tight">{formatPrice(listing.price, listing.rentPeriod)}</p>
        <h3 className="truncate text-sm font-semibold">
          <Link to={listingPath(listing)} className="after:absolute after:inset-0">
            {listing.propertyTitle}
          </Link>
        </h3>
        <p className="truncate text-xs text-neutral-500">
          {[listing.propertyAddress.split(",").slice(-1)[0]?.trim(), listing.propertyCity, listing.propertyState]
            .filter((v, i, a) => v && a.indexOf(v) === i)
            .join(" · ")}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {chips.slice(0, 5).map((c) => (
            <li key={c} className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-neutral-500">
              {c}
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 truncate text-xs text-neutral-500">
          {listing.agent ? <Building2 className="size-3" /> : <User className="size-3" />}
          {listedByLabel(listing)}
          <span className="ml-auto inline-flex items-center gap-1 font-medium text-success">
            <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor" aria-hidden>
              <path d="M10 1.5 3 4.5v5c0 4.2 2.9 8.1 7 9 4.1-.9 7-4.8 7-9v-5l-7-3Zm-1.2 12.1-3.1-3.1 1.2-1.2 1.9 1.9 4.6-4.6 1.2 1.2-5.8 5.8Z" />
            </svg>
            Verified
          </span>
        </p>
        <div className="mt-auto flex items-center gap-4 border-t border-neutral-200 pt-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1" title="Views"><Eye className="size-3" /> {formatCount(listing.views)}</span>
          <span className="inline-flex items-center gap-1" title="Likes"><Heart className="size-3" /> {listing.likeCount}</span>
          <span className="inline-flex items-center gap-1" title="Saves"><Bookmark className="size-3" /> {formatCount(listing.saveCount + (saved ? 1 : 0))}</span>
          {listing.commentCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Comments"><MessageCircle className="size-3" /> {formatCount(listing.commentCount)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
