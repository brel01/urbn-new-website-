// The homepage hero scene, drawn in Urbn's visual language (Visual Identity Guide):
// black line art on white, square corners and one heavy stroke weight, like the
// house outline in Urbn's own posts. Urbn Blue is reserved for Urbn itself: the
// home being identified, its plaque, the Nearby pins, the selection box, and the
// Urbn fleet (a delivery drone, a courier van and a courier bike) that shows
// where the platform is heading.
//
// Story: a selection box picks out a home and its DPI comes back Verified, Nearby
// pins mark the places around it, an Urbn drone lowers a parcel to its door, and
// Urbn couriers pass on the road. Motion is CSS only (app.css, `.city-*`), pauses
// off screen and is off for reduced motion; each element's resting state is its
// finished look, so the still scene tells the same story.
import { clsx } from "clsx";
import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SYMBOL_PATH, WORDMARK } from "./logo";

const W = 1600;
const H = 600;
const INK = "#000";
const BLUE = "#253DE2";
const SUCCESS = "#12B76A";

/** Shared look for line-drawn shapes: white fill so nearer shapes hide farther lines. */
const LINE = {
  fill: "#fff",
  stroke: INK,
  strokeWidth: 5,
  strokeLinejoin: "miter",
  strokeLinecap: "square",
} as const;
const THIN = {
  fill: "none",
  stroke: INK,
  strokeWidth: 2.5,
  strokeLinecap: "square",
} as const;

// --- Ibadan's rooftops: rows of small gabled houses along the hills (deterministic) ---
const hill = (x: number) =>
  350 - 20 * Math.sin(x / 170) - 10 * Math.sin(x / 71 + 1.3);
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
type Roof = { x: number; y: number; w: number; wall: number; roof: number };
const ROOF_ROWS: Roof[][] = [0, 1, 2].map((row) => {
  const out: Roof[] = [];
  for (let x = 236 + row * 11; x < 1330; ) {
    const w = 20 + rand() * 16;
    out.push({
      x,
      y: hill(x) + row * 20,
      w,
      wall: 7 + rand() * 5,
      roof: 7 + rand() * 7,
    });
    x += w * (0.72 + rand() * 0.3);
  }
  return out;
});

/** The Urbn "u" symbol, placed with its top-left at (x, y) and the given height. */
function Symbol({
  x,
  y,
  h,
  fill = "#fff",
}: {
  x: number;
  y: number;
  h: number;
  fill?: string;
}) {
  const s = h / 1172;
  return (
    <path
      d={SYMBOL_PATH}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={fill}
      fillRule="evenodd"
    />
  );
}

/** The "urbn" wordmark, placed with its top-left at (x, y) and the given width. */
function Wordmark({
  x,
  y,
  w,
  fill = "#fff",
}: {
  x: number;
  y: number;
  w: number;
  fill?: string;
}) {
  const s = w / 1607;
  return (
    <path
      d={WORDMARK}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={fill}
      fillRule="evenodd"
    />
  );
}

// --- landmarks ---------------------------------------------------------------------
function CocoaHouse() {
  return (
    <g>
      <line x1={173} y1={66} x2={173} y2={24} stroke={INK} strokeWidth={4} />
      <circle cx={173} cy={22} r={5} fill={BLUE} className="city-blink" />
      <rect x={124} y={66} width={98} height={24} {...LINE} />
      <rect x={110} y={90} width={126} height={410} {...LINE} />
      {Array.from({ length: 19 }, (_, i) => (
        <line
          key={i}
          x1={110}
          x2={236}
          y1={112 + i * 20}
          y2={112 + i * 20}
          {...THIN}
        />
      ))}
      <line x1={150} y1={90} x2={150} y2={500} {...THIN} />
      <line x1={196} y1={90} x2={196} y2={500} {...THIN} />
    </g>
  );
}

function MapoHall() {
  return (
    <g>
      <path d="M1240 500 Q1300 410 1440 404 Q1560 402 1620 446" {...LINE} />
      <rect x={1316} y={398} width={238} height={12} {...LINE} />
      <rect x={1328} y={386} width={214} height={12} {...LINE} />
      <rect x={1338} y={268} width={194} height={118} {...LINE} />
      {[1362, 1394, 1426, 1458, 1490, 1514].map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={270}
          y2={386}
          stroke={INK}
          strokeWidth={8}
        />
      ))}
      <rect x={1326} y={250} width={218} height={18} {...LINE} />
      <path d="M1320 252 L1435 198 L1550 252Z" {...LINE} />
      <circle cx={1435} cy={232} r={7} {...LINE} strokeWidth={3} />
    </g>
  );
}

// --- the street (baseline y = 500) ----------------------------------------------------
function Tree({ x, r = 20 }: { x: number; r?: number }) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={500}
        y2={500 - r * 1.6}
        stroke={INK}
        strokeWidth={4}
      />
      <circle
        cx={x}
        cy={500 - r * 1.6 - r + 4}
        r={r}
        {...LINE}
        strokeWidth={4}
      />
    </g>
  );
}

function Street() {
  return (
    <g>
      {/* power lines */}
      <line x1={524} x2={524} y1={356} y2={500} stroke={INK} strokeWidth={4} />
      <line x1={512} x2={536} y1={362} y2={362} stroke={INK} strokeWidth={4} />
      <line x1={984} x2={984} y1={356} y2={500} stroke={INK} strokeWidth={4} />
      <line x1={972} x2={996} y1={362} y2={362} stroke={INK} strokeWidth={4} />
      <path
        d="M248 376 Q390 400 512 362 Q750 398 972 362 Q1140 394 1310 368"
        {...THIN}
        strokeWidth={1.5}
      />

      {/* buka */}
      <line x1={301} x2={301} y1={424} y2={460} stroke={INK} strokeWidth={4} />
      <path d="M252 424 Q301 386 350 424Z" {...LINE} />
      <rect x={270} y={460} width={80} height={40} {...LINE} />
      <line x1={270} x2={350} y1={474} y2={474} {...THIN} />

      {/* pharmacy */}
      <rect x={366} y={392} width={146} height={108} {...LINE} />
      <rect x={382} y={404} width={114} height={24} {...LINE} strokeWidth={3} />
      <path d="M435 409 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" fill={INK} />
      <path
        d={`M366 436 ${Array.from({ length: 8 }, (_, i) => `q9.1 12 18.25 0`).join(" ")}`}
        {...THIN}
        strokeWidth={3}
      />
      <rect x={384} y={456} width={28} height={44} fill={INK} />
      <rect x={428} y={456} width={68} height={30} {...LINE} strokeWidth={3} />

      {/* bungalow */}
      <rect x={822} y={436} width={140} height={64} {...LINE} />
      <path d="M806 438 L846 398 H938 L978 438Z" {...LINE} />
      <rect x={838} y={452} width={26} height={22} fill={INK} />
      <rect x={920} y={452} width={26} height={22} fill={INK} />
      <rect x={880} y={450} width={24} height={50} fill={INK} />

      {/* clinic */}
      <rect x={996} y={384} width={126} height={116} {...LINE} />
      <rect x={1040} y={394} width={38} height={24} {...LINE} strokeWidth={3} />
      <path d="M1055 398 h8 v5 h5 v8 h-5 v5 h-8 v-5 h-5 v-8 h5z" fill={INK} />
      <rect x={1010} y={430} width={24} height={22} fill={INK} />
      <rect x={1086} y={430} width={24} height={22} fill={INK} />
      <rect x={1046} y={456} width={28} height={44} fill={INK} />

      {/* school */}
      <rect x={1142} y={386} width={166} height={114} {...LINE} />
      <line
        x1={1136}
        x2={1314}
        y1={386}
        y2={386}
        stroke={INK}
        strokeWidth={9}
      />
      {[1158, 1194, 1230, 1266].map((x) => (
        <g key={x}>
          <rect x={x} y={402} width={24} height={20} fill={INK} />
          <rect x={x} y={436} width={24} height={20} fill={INK} />
        </g>
      ))}
      <rect x={1216} y={466} width={28} height={34} fill={INK} />
      <line
        x1={1132}
        x2={1132}
        y1={500}
        y2={330}
        stroke={INK}
        strokeWidth={4}
      />
      <rect
        x={1134}
        y={332}
        width={36}
        height={22}
        {...LINE}
        strokeWidth={3}
        className="city-flag"
      />

      <Tree x={250} />
      <Tree x={530} r={16} />
      <Tree x={800} r={15} />
      <Tree x={1580} r={22} />
      <Tree x={60} r={22} />
    </g>
  );
}

/** The home being identified: Urbn's house mark, drawn in Urbn Blue. */
function Home() {
  return (
    <g>
      <path
        d="M556 500 V414 L666 336 L716 372 V350 H742 V391 L776 414 V500"
        {...LINE}
        stroke={BLUE}
        strokeWidth={8}
      />
      <rect x={578} y={424} width={42} height={30} fill={INK} />
      <rect x={706} y={424} width={42} height={30} fill={INK} />
      <rect x={650} y={444} width={32} height={56} fill={INK} />
      {/* the Urbn plaque */}
      <g transform="translate(590 466)">
        <g className="city-pop" style={{ animationDelay: "0.9s" }}>
          <rect width={46} height={24} fill={INK} />
          <Symbol x={6} y={5} h={14} />
          <rect x={22} y={6} width={18} height={3} fill="#fff" />
          <rect x={22} y={12} width={14} height={2.5} fill="#8A90A0" />
          <rect x={22} y={17} width={18} height={2.5} fill={BLUE} />
        </g>
      </g>
    </g>
  );
}

/**
 * Urbn's selection-box motif (from its posts): a blue box with square handles and a
 * cursor picks out the home, its DPI appears in a blue label and comes back Verified.
 */
function Selection() {
  const [x0, y0, x1, y1] = [536, 322, 796, 512];
  const handles = [
    [x0, y0],
    [(x0 + x1) / 2, y0],
    [x1, y0],
    [x0, (y0 + y1) / 2],
    [x1, (y0 + y1) / 2],
    [x0, y1],
    [(x0 + x1) / 2, y1],
    [x1, y1],
  ];
  return (
    <g>
      <rect
        x={x0}
        y={y0}
        width={x1 - x0}
        height={y1 - y0}
        fill="none"
        stroke={BLUE}
        strokeWidth={2.5}
        className="city-select"
        pathLength={1}
      />
      <g className="city-handles">
        {handles.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 5}
            y={y - 5}
            width={10}
            height={10}
            fill="#fff"
            stroke={BLUE}
            strokeWidth={2.5}
          />
        ))}
      </g>
      {/* label and Verified: right of the box on desktop, left of it on phones (app.css) */}
      <g className="city-callout">
        <g className="city-label">
          <rect x={806} y={350} width={204} height={30} fill={BLUE} />
          <text
            x={818}
            y={370}
            fontFamily="Inter Variable, ui-sans-serif, system-ui, sans-serif"
            fontSize={14}
            fontWeight={600}
            fill="#fff"
          >
            IBADAN-NORTH-0041-U
          </text>
        </g>
        <g className="city-verified">
          <rect
            x={806}
            y={386}
            width={112}
            height={30}
            rx={15}
            fill="#fff"
            stroke={INK}
            strokeWidth={2.5}
          />
          <circle cx={826} cy={401} r={9} fill={SUCCESS} />
          <path
            d="M821.5 401 l3 3 l6 -6.5"
            stroke="#fff"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x={842}
            y={406}
            fontFamily="Inter Variable, ui-sans-serif, system-ui, sans-serif"
            fontSize={14}
            fontWeight={600}
            fill={INK}
          >
            Verified
          </text>
        </g>
      </g>
      <g transform="translate(790 506)">
        <g className="city-cursor">
          <path
            d="M0 0 L0 26 L7 19 L12 30 L17 28 L12 17 L22 17Z"
            fill={INK}
            stroke="#fff"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  );
}

/** A Nearby pin in Urbn Blue with a white category glyph; rises in, then floats. */
function Pin({
  x,
  y,
  glyph,
  delay,
}: {
  x: number;
  y: number;
  glyph: "shop" | "cross" | "cap" | "bowl";
  delay: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className="city-pin"
        style={{ animationDelay: `${delay}s, ${delay + 0.9}s` }}
      >
        <path
          d="M0 0 C-4 -9 -16 -16 -16 -29 A16 16 0 1 1 16 -29 C16 -16 4 -9 0 0Z"
          fill={BLUE}
        />
        <g fill="#fff" stroke="#fff">
          {glyph === "shop" && (
            <path
              d="M-7 -33 h14 l-2 -5 h-10z M-6 -32 h12 v8 h-12z"
              strokeWidth={0}
            />
          )}
          {glyph === "cross" && (
            <path
              d="M-2.5 -37 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 v-5 h5z"
              strokeWidth={0}
            />
          )}
          {glyph === "cap" && (
            <path
              d="M0 -37 L10 -32 L0 -27 L-10 -32Z M-5.5 -30 v4.5 c3.5 2 7.5 2 11 0 v-4.5 l-5.5 3z"
              strokeWidth={0}
            />
          )}
          {glyph === "bowl" && (
            <path d="M-8 -31 h16 a8 7 0 0 1 -16 0z" strokeWidth={0} />
          )}
        </g>
      </g>
    </g>
  );
}

// --- the Urbn fleet -----------------------------------------------------------------
function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={INK} />
      <g className="city-wheel">
        <circle cx={cx} cy={cy} r={r * 0.42} fill="#fff" />
        <rect
          x={cx - 1}
          y={cy - r * 0.4}
          width={2}
          height={r * 0.8}
          fill={INK}
        />
      </g>
    </g>
  );
}

/** Urbn courier van, facing right; origin is the road under its rear bumper. */
function Van() {
  return (
    <g>
      <rect x={0} y={-74} width={110} height={60} fill={BLUE} />
      <Wordmark x={16} y={-58} w={78} />
      <path d="M110 -14 V-56 H134 L156 -34 V-14Z" fill={BLUE} />
      <path d="M116 -50 H131 L146 -35 H116Z" fill={INK} />
      <rect x={-2} y={-16} width={160} height={6} fill={INK} />
      <rect
        x={152}
        y={-30}
        width={6}
        height={6}
        fill="#fff"
        stroke={INK}
        strokeWidth={2}
      />
      <Wheel cx={30} cy={-8} r={12} />
      <Wheel cx={128} cy={-8} r={12} />
    </g>
  );
}

/** Urbn courier bike, facing left; origin is the road under its front wheel. */
function Bike() {
  return (
    <g>
      {/* top box */}
      <rect x={58} y={-66} width={32} height={28} fill={BLUE} />
      <Symbol x={67} y={-60} h={16} />
      {/* rider */}
      <path d="M38 -40 L46 -68 Q50 -74 58 -70 L56 -44Z" fill={INK} />
      <circle cx={46} cy={-80} r={9} fill={BLUE} />
      <rect x={34} y={-84} width={8} height={5} fill={INK} />
      <path
        d="M44 -66 L28 -54 L22 -56"
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="square"
        fill="none"
      />
      {/* frame */}
      <path
        d="M12 -12 L22 -46 H30 M22 -46 L40 -30 H70 L64 -12 M40 -30 L48 -12"
        stroke={INK}
        strokeWidth={5}
        fill="none"
        strokeLinejoin="miter"
      />
      <rect x={34} y={-40} width={30} height={10} fill={INK} />
      <Wheel cx={12} cy={-12} r={12} />
      <Wheel cx={68} cy={-12} r={12} />
    </g>
  );
}

/** Urbn delivery drone; origin is its hover point above the home. */
function Drone() {
  return (
    <g>
      {/* tether, lowered and raised with the parcel */}
      <line
        x1={0}
        x2={0}
        y1={12}
        y2={122}
        stroke={INK}
        strokeWidth={1.5}
        className="city-tether"
      />
      {/* arms and rotors */}
      <path
        d="M-46 -10 H46 M-30 -10 L-20 0 M30 -10 L20 0"
        stroke={INK}
        strokeWidth={4}
        fill="none"
      />
      {[-46, 46].map((x) => (
        <g key={x}>
          <rect x={x - 2} y={-18} width={4} height={8} fill={INK} />
          <rect
            x={x - 20}
            y={-21}
            width={40}
            height={4}
            fill={INK}
            className="city-rotor"
          />
        </g>
      ))}
      {/* body */}
      <rect x={-30} y={-6} width={60} height={20} rx={4} fill={BLUE} />
      <Wordmark x={-16} y={-1} w={32} />
      <path d="M-20 14 L-26 22 M20 14 L26 22" stroke={INK} strokeWidth={3} />
    </g>
  );
}

/** The parcel the drone delivers: an Urbn-blue box, origin at its top centre. */
function Parcel() {
  return (
    <g>
      <rect x={-17} y={0} width={34} height={28} fill={BLUE} />
      <rect x={-3} y={0} width={6} height={28} fill="#fff" opacity={0.85} />
      <rect x={-17} y={0} width={34} height={5} fill={INK} opacity={0.25} />
    </g>
  );
}

// --- the scene -------------------------------------------------------------------

export function CityScene({
  className,
  far,
  mid,
}: {
  className?: string;
  far?: MotionValue<number>;
  mid?: MotionValue<number>;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [paused, setPaused] = useState(false);

  // Pause every loop while the hero is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={clsx("city-scene", className)}
      data-paused={paused || undefined}
      role="img"
      aria-label="Line drawing of an Ibadan street: Cocoa House and Mapo Hall above rows of rooftops, and a road lined with a food stall, a pharmacy, a home, a bungalow, a clinic and a school. A blue selection box picks out the home and its DPI shows Verified, blue Nearby pins mark the places around it, an Urbn drone lowers a parcel to its door, and an Urbn courier van and bike pass on the road."
    >
      {/* far layer: rooftops and landmarks */}
      <motion.g style={far ? { y: far } : undefined}>
        {ROOF_ROWS.map((row, i) => (
          <g
            key={i}
            fill="#fff"
            stroke={INK}
            strokeWidth={2.5}
            strokeLinejoin="miter"
          >
            {row.map((r, j) => (
              <path
                key={j}
                d={`M${r.x.toFixed(1)} ${(r.y + r.wall).toFixed(1)} V${r.y.toFixed(1)} L${(r.x + r.w / 2).toFixed(1)} ${(r.y - r.roof).toFixed(1)} L${(r.x + r.w).toFixed(1)} ${r.y.toFixed(1)} V${(r.y + r.wall).toFixed(1)}`}
              />
            ))}
          </g>
        ))}
        <CocoaHouse />
        <MapoHall />
      </motion.g>

      {/* mid layer: the street, the home and the Urbn layer on top of it */}
      <motion.g style={mid ? { y: mid } : undefined}>
        <Street />
        <Home />
        <Pin x={310} y={414} glyph="bowl" delay={1.4} />
        <Pin x={450} y={384} glyph="shop" delay={1.6} />
        <Pin x={1059} y={376} glyph="cross" delay={1.8} />
        <Pin x={1226} y={378} glyph="cap" delay={2} />
        <Selection />
        <g transform="translate(666 356)">
          <g className="city-parcel">
            <Parcel />
          </g>
        </g>
        <g transform="translate(666 234)">
          <g className="city-drone">
            <g className="city-hover">
              <Drone />
            </g>
          </g>
        </g>
      </motion.g>

      {/* road */}
      <line x1={0} x2={W} y1={500} y2={500} stroke={INK} strokeWidth={5} />
      <line x1={0} x2={W} y1={512} y2={512} stroke={INK} strokeWidth={3} />
      <line
        x1={0}
        x2={W}
        y1={550}
        y2={550}
        stroke={INK}
        strokeWidth={3}
        strokeDasharray="28 22"
      />
      <line x1={0} x2={W} y1={592} y2={592} stroke={INK} strokeWidth={5} />
      <g transform="translate(1210 544)">
        <g className="city-bike">
          <Bike />
        </g>
      </g>
      <g transform="translate(150 586)">
        <g className="city-van">
          <Van />
        </g>
      </g>
    </svg>
  );
}
