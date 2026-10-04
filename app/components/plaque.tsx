import { clsx } from "clsx";
import { MapPin } from "lucide-react";
import { SAMPLE_DPI } from "~/lib/dpi";
import { Logo, LogoSymbol, SYMBOL_PATH } from "./logo";

/** Deterministic QR-like matrix (decorative, seeded by the code). */
function QrArt({ seed, className }: { seed: string; className?: string }) {
  const n = 21;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      if (x > 7 && x < 13 && y > 7 && y < 13) continue; // logo hole
      if (rand() > 0.52) cells.push([x, y]);
    }
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width={7} height={7} fill="#000" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#000" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={className} aria-hidden shapeRendering="crispEdges">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#000" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
      <path transform="translate(8.7 8.5) scale(0.0034)" d={SYMBOL_PATH} fill="#000" fillRule="evenodd" />
    </svg>
  );
}

export type PlaqueData = {
  code: string;
  houseNo: string;
  houseRef: string;
  address: string[];
};

export const SAMPLE_PLAQUE: PlaqueData = {
  code: SAMPLE_DPI,
  houseNo: "41A",
  houseRef: "ADY-041-41A",
  address: ["Adeyemo Street,", "Off Allen Avenue,", "Bodija, Ibadan,", "Oyo State."],
};

/**
 * The DPI plaque, rebuilt in HTML so it stays crisp at every size and can be
 * annotated/animated. Mirrors the plaque artwork from the DPI page design.
 * Uses container query units so it scales fluidly with its wrapper.
 */
export function Plaque({ data = SAMPLE_PLAQUE, className }: { data?: PlaqueData; className?: string }) {
  return (
    <div className={clsx("@container", className)}>
      <div
        className="relative aspect-[1.52] w-full overflow-hidden rounded-[1.6cqw] bg-[#0b0b0c] text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
        role="img"
        aria-label={`Urbn DPI plaque. DPI code ${data.code}, house number ${data.houseNo}, ${data.address.join(" ")}`}
      >
        {/* top bar */}
        <div className="flex items-start justify-between px-[5cqw] pt-[4.5cqw] pb-[2.5cqw]">
          <div>
            <Logo className="w-[14cqw] text-white" />
            <p className="mt-[0.8cqw] text-[1.9cqw] font-semibold tracking-wide uppercase">Digital Property Identity</p>
          </div>
          <div className="text-right">
            <p className="text-[1.7cqw] font-semibold uppercase">DPI Code</p>
            <p className="mt-[0.8cqw] rounded-[0.8cqw] bg-white px-[1.6cqw] py-[0.6cqw] font-display text-[2.6cqw] text-ink">
              {data.code}
            </p>
          </div>
        </div>
        <div className="mx-[5cqw] h-px bg-white/30" />
        {/* body */}
        <div className="grid grid-cols-[1fr_1.05fr_1fr] px-[5cqw]">
          <div className="border-r border-white/30 py-[3cqw] pr-[3cqw]">
            <p className="text-[1.9cqw] font-semibold uppercase">House No.</p>
            <div className="mt-[2.4cqw] grid place-items-center rounded-[0.6cqw] bg-white px-[2cqw] py-[1.8cqw] text-ink">
              <span className="font-display text-[8.5cqw] leading-none">{data.houseNo}</span>
              <span className="mt-[0.6cqw] text-[1.5cqw] font-semibold">{data.houseRef}</span>
            </div>
          </div>
          <div className="flex gap-[1.4cqw] border-r border-white/30 px-[3cqw] py-[5cqw]">
            <MapPin className="mt-[0.3cqw] size-[3cqw] shrink-0" aria-hidden />
            <p className="text-[2.3cqw] leading-[1.35] font-semibold">
              {data.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
          </div>
          <div className="flex flex-col items-center py-[3cqw] pl-[3cqw]">
            <p className="text-[1.9cqw] font-semibold uppercase">U - Beep</p>
            <QrArt seed={data.code} className="mt-[1.6cqw] w-[15cqw]" />
            <p className="mt-[1.4cqw] text-[1.7cqw] font-semibold uppercase">Scan to verify</p>
          </div>
        </div>
        {/* bottom bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/30 px-[5cqw] py-[2.2cqw]">
          <div className="flex items-center gap-[1.6cqw]">
            <LogoSymbol className="w-[4.2cqw] text-white" />
            <div>
              <p className="text-[1.8cqw] font-bold uppercase">Verified by Urbn</p>
              <p className="max-w-[34cqw] text-[1.15cqw] leading-tight text-white/70">
                This property has been verified by Urbn. Property details have been verified and recorded on its
                Digital Property Identity (DPI).
              </p>
            </div>
          </div>
          <span className="rounded-[0.6cqw] bg-white px-[2cqw] py-[0.9cqw] text-[1.6cqw] font-semibold text-ink">
            Download Urbn app
          </span>
        </div>
      </div>
    </div>
  );
}
