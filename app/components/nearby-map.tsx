// Interactive Nearby map (Leaflet), mirroring the app's map mode: one marker per
// activity at its property's coordinates (white disc, type icon, dark ring when
// selected), "Search this area" after the visitor pans, and the app's
// region→radius rule (half the visible latitude span × 111 km, capped at 25 km).
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { createElement as lucideSvg } from "lucide";
import { Church, DoorOpen, Factory, GraduationCap, HardHat, HeartHandshake, Home, Landmark, MoreHorizontal, Sprout, Stethoscope, Store, Users, UtensilsCrossed, Warehouse } from "lucide";
import { LoaderCircle, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { placeTitle } from "~/lib/nearby/categories";
import { type ActivityType, MAX_RADIUS, type NearbyPlace } from "~/lib/nearby/types";

const ICONS: Record<ActivityType, Parameters<typeof lucideSvg>[0]> = {
  RESIDENCE: Home, BUSINESS: Store, NGO: HeartHandshake, SCHOOL: GraduationCap, CLINIC: Stethoscope, RELIGIOUS: Church,
  GOVERNMENT: Landmark, AGRICULTURAL: Sprout, INDUSTRIAL: Factory, WAREHOUSE: Warehouse, RESTAURANT: UtensilsCrossed,
  COMMUNITY: Users, VACANT: DoorOpen, UNDER_CONSTRUCTION: HardHat, OTHER: MoreHorizontal,
};

const TILES = import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function markerHtml(type: ActivityType, selected: boolean) {
  const svg = lucideSvg(ICONS[type], { width: 16, height: 16, stroke: "#000", "stroke-width": 2 });
  return `<span class="urbn-pin${selected ? " is-selected" : ""}">${svg.outerHTML}</span>`;
}

export type MapArea = { lat: number; lng: number; radius: number };

export function NearbyMap({
  places,
  center,
  selectedId,
  user,
  locating,
  onSelect,
  onSearchArea,
  onLocate,
  className,
}: {
  places: NearbyPlace[];
  center: { lat: number; lng: number };
  selectedId?: string | null;
  user?: { lat: number; lng: number } | null;
  locating?: boolean;
  onSelect: (place: NearbyPlace) => void;
  onSearchArea: (area: MapArea) => void;
  onLocate: () => void;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const markers = useRef<Leaflet.LayerGroup | null>(null);
  const userDot = useRef<Leaflet.CircleMarker | null>(null);
  const programmatic = useRef(false);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);

  // Create the map once, client-side only.
  useEffect(() => {
    let disposed = false;
    import("leaflet").then((mod) => {
      if (disposed || !el.current) return;
      const lf = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      L.current = lf;
      const m = lf.map(el.current, { zoomControl: false, attributionControl: true }).setView([center.lat, center.lng], 14);
      lf.control.zoom({ position: "bottomright" }).addTo(m);
      lf.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION, detectRetina: true }).addTo(m);
      m.on("moveend", () => {
        if (programmatic.current) {
          programmatic.current = false;
          return;
        }
        setMoved(true);
      });
      markers.current = lf.layerGroup().addTo(m);
      map.current = m;
      setReady(true);
    });
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the search centre (new location, area link) without showing "Search this area".
  useEffect(() => {
    if (!ready || !map.current) return;
    programmatic.current = true;
    map.current.flyTo([center.lat, center.lng], Math.max(map.current.getZoom(), 14), { duration: 0.6 });
    setMoved(false);
  }, [ready, center.lat, center.lng]);

  // Each new set of results: frame them (and the search centre) so every place is on screen.
  const resultsKey = places.map((p) => p.id).join(",");
  useEffect(() => {
    const lf = L.current;
    if (!ready || !lf || !map.current) return;
    const pts = places.filter((p) => p.lat != null && p.lng != null).map((p) => lf.latLng(p.lat!, p.lng!));
    if (!pts.length) return;
    programmatic.current = true;
    map.current.flyToBounds(lf.latLngBounds([...pts, lf.latLng(center.lat, center.lng)]), { padding: [48, 48], maxZoom: 16, duration: 0.6 });
    setMoved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, resultsKey]);

  // Markers: one per activity, the selected one ringed in ink.
  useEffect(() => {
    const lf = L.current;
    if (!ready || !lf || !markers.current) return;
    markers.current.clearLayers();
    for (const p of places) {
      if (p.lat == null || p.lng == null) continue;
      const selected = p.id === selectedId;
      lf.marker([p.lat, p.lng], {
        icon: lf.divIcon({ html: markerHtml(p.activityType, selected), className: "", iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: placeTitle(p),
        alt: placeTitle(p),
        keyboard: true,
        zIndexOffset: selected ? 1000 : 0,
      })
        .on("click", () => onSelect(p))
        .addTo(markers.current);
    }
  }, [ready, places, selectedId, onSelect]);

  // Fly to a selected place, like the app (tighter zoom).
  useEffect(() => {
    const p = places.find((x) => x.id === selectedId);
    if (!ready || !map.current || !p || p.lat == null || p.lng == null) return;
    programmatic.current = true;
    map.current.flyTo([p.lat, p.lng], Math.max(map.current.getZoom(), 16), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  // The visitor's own position (only when they chose Use My Location).
  useEffect(() => {
    const lf = L.current;
    if (!ready || !lf || !map.current) return;
    userDot.current?.remove();
    userDot.current = user ? lf.circleMarker([user.lat, user.lng], { radius: 7, color: "#fff", weight: 3, fillColor: "#253DE2", fillOpacity: 1 }).addTo(map.current) : null;
  }, [ready, user?.lat, user?.lng]);

  const searchThisArea = () => {
    if (!map.current) return;
    const b = map.current.getBounds();
    const c = map.current.getCenter();
    const km = Math.min(Math.max(((b.getNorth() - b.getSouth()) / 2) * 111, 0.5), MAX_RADIUS);
    onSearchArea({ lat: c.lat, lng: c.lng, radius: Math.round(km * 10) / 10 });
    setMoved(false);
  };

  return (
    <div className={`relative isolate overflow-hidden bg-[#eef0ec] ${className ?? ""}`}>
      <div ref={el} className="absolute inset-0 z-0" role="application" aria-label="Map of nearby places" />
      {moved && (
        <button
          type="button"
          onClick={searchThisArea}
          className="absolute top-3 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
        >
          Search this area
        </button>
      )}
      <button
        type="button"
        onClick={onLocate}
        aria-label="Use My Location"
        className="absolute top-3 right-3 z-[500] grid size-11 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5"
      >
        {locating ? <LoaderCircle className="size-5 animate-spin" /> : <Navigation className="size-5" />}
      </button>
    </div>
  );
}
