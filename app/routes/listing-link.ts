import { data, redirect } from "react-router";
import { getListing } from "~/lib/marketplace/source.server";
import { listingPath } from "~/lib/marketplace/types";
import type { Route } from "./+types/listing-link";

// /listing/:id is the universal link the app's Share Listing uses
// (buildListingUniversalLink). With the app installed the OS opens the app;
// otherwise the visitor, and link-preview crawlers, land on the listing page.
export async function loader({ params }: Route.LoaderArgs) {
  const listing = await getListing(params.id);
  if (!listing) throw data("Listing Unavailable", { status: 404 });
  throw redirect(listingPath(listing), 301);
}
