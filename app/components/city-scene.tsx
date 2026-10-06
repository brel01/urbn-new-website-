// The homepage hero scene, drawn in Urbn's visual language (Visual Identity Guide):
// black line art on white, square corners and one heavy stroke weight, like the
// house outline in Urbn's own posts. Urbn Blue marks Urbn: the onboarded home,
// its plaque, the selection box, and the Urbn fleet. Grey is only for depth (the
// rooftops and towers behind the street) and the clouds.
//
// Story: what happens around a property once it's onboarded. A visitor scans the
// home's DPI plaque and its record comes back Verified, an Urbn drone delivers a
// parcel to its door, black Nearby pins mark the places around it, and the street
// carries on: cars (some Urbn, some not), a courier bike, a bus stop screen, smart
// streetlights and solar roofs. Near future, not science fiction.
// Motion is CSS only (app.css, `.city-*`), pauses off screen and is off for
// reduced motion; each element's resting state is its finished look.
import { clsx } from "clsx";
import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SYMBOL_PATH, WORDMARK } from "./logo";

const W = 1600;
const H = 640;
const INK = "#000";
const BLUE = "#253DE2";
const SUCCESS = "#12B76A";
const GREY = "#A9AEB8";
const CLOUD = "#ECEEF1";

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

/** Mid-rise blocks behind the street, in grey for depth, with solar roofs and balcony plants. */
function Tower({
  x,
  top,
  w,
  cols,
}: {
  x: number;
  top: number;
  w: number;
  cols: number;
}) {
  const cw = (w - 16) / cols;
  const rows = Math.floor((392 - top - 16) / 20);
  return (
    <g stroke={GREY} strokeWidth={3} fill="#fff">
      <rect x={x} y={top} width={w} height={500 - top} />
      {/* solar panels */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${x + 10 + i * (w / 3.2)} ${top - 2} l6 -10 h${w / 4.2} l-6 10z`}
          strokeWidth={2.5}
        />
      ))}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const lit = (r * 7 + c * 3) % 5 === 0;
          return (
            <rect
              key={`${r}-${c}`}
              x={x + 8 + c * cw + 2}
              y={top + 12 + r * 20}
              width={cw - 4}
              height={10}
              fill={lit ? "#E3E6EB" : "#fff"}
              strokeWidth={2}
            />
          );
        }),
      )}
      {/* a few balcony plants */}
      {[1, 3]
        .filter((r) => r < rows)
        .map((r) => (
          <circle
            key={r}
            cx={x + w - 10}
            cy={top + 10 + r * 20}
            r={5}
            strokeWidth={2}
          />
        ))}
    </g>
  );
}

/** A standing person, facing right; origin is between the feet. */
function Person({
  x,
  y,
  flip,
  bag,
}: {
  x: number;
  y: number;
  flip?: boolean;
  bag?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M-4 0 L-2 -20 M5 0 L2 -20" stroke={INK} strokeWidth={5} />
      <rect x={-8} y={-46} width={16} height={28} rx={4} fill={INK} />
      <circle cx={0} cy={-54} r={7} fill={INK} />
      <path d="M-5 -38 L-12 -22" stroke={INK} strokeWidth={4} />
      {bag && (
        <rect
          x={-18}
          y={-24}
          width={12}
          height={14}
          fill="#fff"
          stroke={INK}
          strokeWidth={2.5}
        />
      )}
    </g>
  );
}

/** Smart streetlight with a small solar panel; origin at its foot. */
function StreetLight({ x }: { x: number }) {
  return (
    <g>
      <line x1={x} x2={x} y1={500} y2={388} stroke={INK} strokeWidth={4} />
      <path d={`M${x} 390 H${x + 22}`} stroke={INK} strokeWidth={4} />
      <rect x={x + 14} y={388} width={20} height={7} fill={INK} />
      <path
        d={`M${x - 14} 384 l4 -8 h20 l-4 8z`}
        fill="#fff"
        stroke={INK}
        strokeWidth={2.5}
      />
    </g>
  );
}

/** Bus stop with a digital screen running an Urbn ad, and someone waiting. */
function BusStop() {
  return (
    <g>
      <line
        x1={1452}
        x2={1452}
        y1={440}
        y2={500}
        stroke={INK}
        strokeWidth={4}
      />
      <line
        x1={1546}
        x2={1546}
        y1={440}
        y2={500}
        stroke={INK}
        strokeWidth={4}
      />
      <rect x={1444} y={432} width={110} height={8} fill={INK} />
      <rect
        x={1456}
        y={444}
        width={40}
        height={40}
        fill="#fff"
        stroke={GREY}
        strokeWidth={2.5}
      />
      <rect x={1502} y={446} width={40} height={42} fill={BLUE} />
      <Symbol x={1514} y={455} h={18} />
      <rect x={1510} y={478} width={24} height={3} fill="#fff" />
      <line
        x1={1456}
        x2={1500}
        y1={482}
        y2={482}
        stroke={INK}
        strokeWidth={4}
      />
      {/* seated passenger */}
      <circle cx={1478} cy={456} r={6} fill={INK} />
      <rect x={1471} y={463} width={14} height={20} rx={3} fill={INK} />
      <path
        d="M1484 482 H1494 V500"
        stroke={INK}
        strokeWidth={4.5}
        fill="none"
      />
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

      {/* solar panels on the bungalow and the school */}
      {[852, 896].map((x) => (
        <path key={x} d={`M${x} 410 l8 -10 h30 l-8 10z`} fill={INK} />
      ))}
      {[1160, 1206, 1252].map((x) => (
        <path
          key={x}
          d={`M${x} 380 l6 -9 h34 l-6 9z`}
          fill="#fff"
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}

      <Tree x={60} r={22} />
      <Tree x={528} r={16} />
      <Tree x={800} r={15} />
      <Tree x={1366} r={18} />
      <StreetLight x={252} />
      <StreetLight x={1586} />
      <BusStop />
      <Person x={462} y={506} flip bag />
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
      {/* the Urbn plaque, right of the door */}
      <g transform="translate(694 462)">
        <g className="city-pop" style={{ animationDelay: "0.9s" }}>
          <rect width={46} height={24} fill={INK} />
          <Symbol x={6} y={5} h={14} />
          <rect x={22} y={6} width={18} height={3} fill="#fff" />
          <rect x={22} y={12} width={14} height={2.5} fill="#8A90A0" />
          <rect x={22} y={17} width={18} height={2.5} fill={BLUE} />
        </g>
      </g>
      {/* a visitor scanning the plaque with their phone */}
      <g transform="translate(606 508)">
        <path
          d="M24 -45 L88 -46 L88 -22Z"
          fill={BLUE}
          opacity={0.16}
          className="city-beam"
        />
        <path d="M-4 0 L-2 -20 M5 0 L2 -20" stroke={INK} strokeWidth={5} />
        <rect x={-8} y={-46} width={16} height={28} rx={4} fill={INK} />
        <circle cx={0} cy={-54} r={7} fill={INK} />
        <path
          d="M4 -38 L16 -36 L20 -44"
          stroke={INK}
          strokeWidth={4}
          fill="none"
        />
        <rect
          x={18}
          y={-52}
          width={7}
          height={12}
          rx={1.5}
          fill="#fff"
          stroke={INK}
          strokeWidth={2}
        />
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
        <g className="city-delivered">
          <rect
            x={806}
            y={422}
            width={124}
            height={30}
            rx={15}
            fill="#fff"
            stroke={INK}
            strokeWidth={2.5}
          />
          <rect x={818} y={430} width={14} height={14} fill={BLUE} />
          <rect x={823.5} y={430} width={3} height={14} fill="#fff" />
          <text
            x={840}
            y={442}
            fontFamily="Inter Variable, ui-sans-serif, system-ui, sans-serif"
            fontSize={14}
            fontWeight={600}
            fill={INK}
          >
            Delivered
          </text>
        </g>
      </g>
    </g>
  );
}

/** A Nearby pin in black with a white category glyph; rises in, then floats. */
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
          fill={INK}
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

/** Urbn courier van, facing right; origin is the road under its rear wheel. */
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
      <Wheel cx={30} cy={-12} r={12} />
      <Wheel cx={128} cy={-12} r={12} />
    </g>
  );
}

/** A car, facing right (or left with `flip`); origin is the road under its rear (front
 *  when flipped). Black or Urbn Blue, with or without Urbn branding; the logo always
 *  reads the right way round. */
function Car({
  kind,
  color,
  logo,
  flip,
}: {
  kind: "sedan" | "suv" | "hatch";
  color: string;
  logo?: "wordmark" | "symbol";
  flip?: boolean;
}) {
  const shape = {
    suv: {
      body: "M0 -12 V-46 Q0 -52 8 -52 H82 L102 -32 H118 Q124 -30 124 -24 V-12Z",
      glass: "M8 -46 H40 V-34 H8Z M46 -46 H78 L92 -34 H46Z",
      light: [118, -28],
      wheels: [26, 100, 11],
      mark: { x: 30, y: -29, w: 44 },
    },
    hatch: {
      body: "M0 -12 V-26 Q2 -42 26 -44 H64 Q84 -42 98 -28 Q104 -26 104 -20 V-12Z",
      glass: "M12 -30 Q14 -40 26 -40 H44 V-30Z M50 -40 H64 Q76 -38 86 -30 H50Z",
      light: [98, -24],
      wheels: [22, 82, 10],
      mark: { x: 54, y: -27, w: 11 },
    },
    sedan: {
      body: "M2 -12 V-24 Q4 -30 14 -31 L32 -33 L46 -46 H84 L100 -33 Q116 -31 118 -24 V-12Z",
      glass: "M50 -42 H64 V-34 H40Z M68 -42 H82 L94 -34 H68Z",
      light: [113, -28],
      wheels: [26, 96, 10],
      mark: { x: 42, y: -28, w: 38 },
    },
  }[kind];
  const [w1, w2, r] = shape.wheels;
  const m = shape.mark;
  const mx = flip ? -(m.x + m.w) : m.x;
  return (
    <g>
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <path d={shape.body} fill={color} />
        <path d={shape.glass} fill="#fff" />
        <rect
          x={shape.light[0]}
          y={shape.light[1]}
          width={5}
          height={4}
          fill="#fff"
        />
        <Wheel cx={w1} cy={-r} r={r} />
        <Wheel cx={w2} cy={-r} r={r} />
      </g>
      {logo === "wordmark" && <Wordmark x={mx} y={m.y} w={m.w} />}
      {logo === "symbol" && <Symbol x={mx} y={m.y} h={m.w * (1172 / 1054)} />}
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
      <circle cx={46} cy={-80} r={9} fill={INK} />
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

// --- sky ----------------------------------------------------------------------------
function Cloud({
  x,
  y,
  s,
  slow,
}: {
  x: number;
  y: number;
  s: number;
  slow?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className={slow ? "city-cloud city-cloud-slow" : "city-cloud"}
        d="M0 0 H150 A26 26 0 0 0 128 -36 A34 34 0 0 0 68 -52 A30 30 0 0 0 18 -30 A20 20 0 0 0 0 0Z"
        fill={CLOUD}
      />
    </g>
  );
}

/** Soft grey clouds drifting behind the hero text and scene. */
export function SkyClouds({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 560"
      preserveAspectRatio="xMidYMin slice"
      className={clsx("city-scene", className)}
      aria-hidden
    >
      <Cloud x={60} y={150} s={1.1} />
      <Cloud x={420} y={90} s={0.7} slow />
      <Cloud x={760} y={50} s={0.55} />
      <Cloud x={1150} y={120} s={1.2} slow />
      <Cloud x={1420} y={250} s={0.8} />
      <Cloud x={230} y={360} s={0.6} slow />
      <Cloud x={1290} y={420} s={0.65} />
    </svg>
  );
}

// --- the scene -------------------------------------------------------------------

/** The road: two equal lanes split by a centred dashed line. Every vehicle's wheels
 *  sit the same distance above its lane's lower edge, so both lanes read at the same
 *  perspective. Lanes are taller than the tallest near-lane vehicle (the van, ~53
 *  units at 72%), so vehicles passing in opposite lanes never overlap. */
const ROAD_TOP = 512;
const LANE_H = 60;
const ROAD_MID = ROAD_TOP + LANE_H;
const ROAD_BOTTOM = ROAD_MID + LANE_H;
const WHEEL_INSET = 6;
const VEHICLE_SCALE = 0.72;
/** Two vehicles per lane, half a loop apart. Each sits at its resting x (used with
 *  reduced motion) and, when animated, starts its loop from that point. */
const LANE_A = { y: ROAD_BOTTOM - WHEEL_INSET, from: -280, to: 1720, dur: 22 };
const LANE_B = { y: ROAD_MID - WHEEL_INSET, from: 1760, to: -200, dur: 16 };
const laneDelay = (lane: typeof LANE_A, x0: number) =>
  `${(-((x0 - lane.from) / (lane.to - lane.from)) * lane.dur).toFixed(2)}s`;

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
      aria-label="Line drawing of an Ibadan street in the near future: Cocoa House and Mapo Hall above rooftops and solar-roofed towers, and a road lined with a food stall, a pharmacy, a home, a bungalow, a clinic, a school and a bus stop. A visitor scans the home's Urbn plaque and its record shows Verified, an Urbn drone delivers a parcel to its door, black Nearby pins mark the places around it, and the blue Urbn van, a black car, a black Urbn car and an Urbn courier bike pass on a two-lane road."
    >
      {/* far layer: rooftops and landmarks */}
      <motion.g style={far ? { y: far } : undefined}>
        {ROOF_ROWS.map((row, i) => (
          <g
            key={i}
            fill="#fff"
            stroke={i === 0 ? "#C6CAD2" : GREY}
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
        <Tower x={318} top={286} w={108} cols={4} />
        <Tower x={1170} top={300} w={118} cols={4} />
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
        <g transform="translate(666 372)">
          <g className="city-parcel">
            <Parcel />
          </g>
        </g>
        <g transform="translate(666 250)">
          <g className="city-drone">
            <g className="city-hover">
              <Drone />
            </g>
          </g>
        </g>
      </motion.g>

      {/* road */}
      <line x1={0} x2={W} y1={500} y2={500} stroke={INK} strokeWidth={5} />
      <line x1={0} x2={W} y1={ROAD_TOP} y2={ROAD_TOP} stroke={INK} strokeWidth={3} />
      <line
        x1={0}
        x2={W}
        y1={ROAD_MID}
        y2={ROAD_MID}
        stroke={INK}
        strokeWidth={3}
        strokeDasharray="28 22"
      />
      <line x1={0} x2={W} y1={ROAD_BOTTOM} y2={ROAD_BOTTOM} stroke={INK} strokeWidth={5} />
      {/* lane A (near), left to right: the blue Urbn van and a plain black car */}
      {(
        [
          [120, <Van key="van" />],
          [1100, <Car key="sedan" kind="sedan" color={INK} />],
        ] as const
      ).map(([x0, v], i) => (
        <g key={i} transform={`translate(0 ${LANE_A.y})`}>
          <g
            transform={`translate(${x0} 0)`}
            className="city-lane-a"
            style={{ animationDelay: laneDelay(LANE_A, x0) }}
          >
            <g transform={`scale(${VEHICLE_SCALE})`}>{v}</g>
          </g>
        </g>
      ))}
      {/* lane B (far), right to left: a black Urbn car and the courier bike */}
      {(
        [
          [440, <Car key="suv" kind="suv" color={INK} logo="wordmark" flip />],
          [1420, <Bike key="bike" />],
        ] as const
      ).map(([x0, v], i) => (
        <g key={i} transform={`translate(0 ${LANE_B.y})`}>
          <g
            transform={`translate(${x0} 0)`}
            className="city-lane-b"
            style={{ animationDelay: laneDelay(LANE_B, x0) }}
          >
            <g transform={`scale(${VEHICLE_SCALE})`}>{v}</g>
          </g>
        </g>
      ))}
    </svg>
  );
}
