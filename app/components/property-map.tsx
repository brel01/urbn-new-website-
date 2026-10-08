// A small, still map with one pin for a property record (Leaflet, client-only).
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { useEffect, useRef } from "react";

const TILES = import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function PropertyMap({ lat, lng, label, className }: { lat: number; lng: number; label: string; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: Leaflet.Map | null = null;
    let disposed = false;
    import("leaflet").then((mod) => {
      if (disposed || !el.current) return;
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      map = L.map(el.current, { zoomControl: false, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView([lat, lng], 16);
      L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION, detectRetina: true }).addTo(map);
      L.marker([lat, lng], {
        icon: L.divIcon({ html: '<span class="urbn-pin is-selected"><svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg></span>', className: "", iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: label,
        alt: label,
        keyboard: false,
      }).addTo(map);
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [lat, lng, label]);
  return <div ref={el} role="img" aria-label={`Map showing ${label}`} className={className} />;
}
