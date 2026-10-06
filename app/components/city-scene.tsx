// Illustrated Ibadan street for the homepage hero, drawn in code so it stays sharp,
// light and animatable. Back to front: sky, brown-roofed hills, Cocoa House and
// Mapo Hall, a street of places (buka, pharmacy, a home with its Urbn plaque, a
// bungalow, a clinic, a school), then the road with a keke and a car.
//
// The story it animates: homes carry Urbn plaques, Nearby pins mark the places
// around them, and a keke stops at the home while its record shows Verified.
// Motion is pure CSS (app.css, `.city-*`), paused off screen, and switched off
// for people who prefer reduced motion. Every element's resting state is its
// "finished" look, so the static scene still reads.
import { clsx } from "clsx";
import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

const W = 1600;
const H = 640;

// --- palette --------------------------------------------------------------------
const C = {
  hillFar: "#F1DCB2",
  hillNear: "#E7C98F",
  roof: "#B4542C",
  roofDark: "#8F3F1F",
  wallWarm: "#F7E9CC",
  grass: "#14855F",
  grassDark: "#0E6B4E",
  road: "#5E6970",
  kerb: "#CBD3D8",
  pavement: "#EADFC9",
  cream: "#FBF6EC",
  creamShade: "#E6DCC8",
  ink: "#16181D",
  glass: "#2A3140",
  glassHi: "#5C6DEB",
  blueShade: "#1D31C4",
  urbn: "#253DE2",
  yellow: "#F6B935",
  coral: "#FF7A59",
  leaf: ["#1DB46A", "#18A35F", "#22C276"],
  trunk: "#5B3A29",
  // Nearby pin colours, matching ACTIVITY_META dots.
  business: "#8B5CF6",
  restaurant: "#F43F5E",
  clinic: "#EF4444",
  school: "#6366F1",
  whatsapp: "#25D366",
};

// --- the hills of brown roofs (deterministic, so server and client match) --------
const hillFar = (x: number) => 346 - 22 * Math.sin(x / 170) - 12 * Math.sin(x / 71 + 1.3);
const hillNear = (x: number) => 418 - 14 * Math.sin(x / 120 + 2) - 8 * Math.sin(x / 53);
const hillPath = (f: (x: number) => number, bottom: number) => {
  let d = `M0 ${f(0).toFixed(1)}`;
  for (let x = 20; x <= W; x += 20) d += ` L${x} ${f(x).toFixed(1)}`;
  return `${d} L${W} ${bottom} L0 ${bottom} Z`;
};
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ROOFS: { x: number; y: number; w: number; tone: number }[] = [];
for (let row = 0; row < 4; row++) {
  for (let x = 240 + row * 13; x < 1350; x += 28 + rand() * 16) {
    const w = 16 + rand() * 10;
    ROOFS.push({ x, y: hillFar(x) + 10 + row * 18 + rand() * 6, w, tone: rand() });
  }
}

// --- small parts -----------------------------------------------------------------
function Tree({ x, y = 500, s = 1, tone = 0 }: { x: number; y?: number; s?: number; tone?: number }) {
  const [a, b, c] = [C.leaf[tone % 3], C.leaf[(tone + 1) % 3], C.leaf[(tone + 2) % 3]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-34} width={6} height={34} rx={2} fill={C.trunk} />
      <circle cx={-14} cy={-46} r={20} fill={a} />
      <circle cx={13} cy={-48} r={22} fill={b} />
      <circle cx={0} cy={-66} r={22} fill={c} />
    </g>
  );
}

function Window({ x, y, w = 18, h = 22 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={C.glass} />
      <path d={`M${x + 3} ${y + h - 4} L${x + w - 5} ${y + 3}`} stroke={C.glassHi} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

/** A Nearby pin with a simple category glyph; rises in, then bobs. */
function Pin({ x, y, color, glyph, delay }: { x: number; y: number; color: string; glyph: "shop" | "cross" | "cap" | "bowl"; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="city-pin" style={{ animationDelay: `${delay}s, ${delay + 0.9}s` }}>
        <ellipse cx={0} cy={2} rx={7} ry={2.5} fill="#000" opacity={0.15} />
        <path d="M0 0 C-4 -9 -17 -16 -17 -30 A17 17 0 1 1 17 -30 C17 -16 4 -9 0 0Z" fill={color} />
        <circle cx={0} cy={-30} r={10.5} fill="#fff" />
        <g fill={color} stroke={color}>
          {glyph === "shop" && <path d="M-6 -33 h12 l-1.5 -5 h-9z M-5 -32 h10 v7 h-10z" strokeWidth={0} />}
          {glyph === "cross" && <path d="M-2 -37 h4 v5 h5 v4 h-5 v5 h-4 v-5 h-5 v-4 h5z" strokeWidth={0} />}
          {glyph === "cap" && <path d="M0 -37 L9 -32 L0 -27 L-9 -32Z M-5 -30 v4 c3 2 7 2 10 0 v-4 l-5 3z" strokeWidth={0} />}
          {glyph === "bowl" && <path d="M-7 -31 h14 a7 6 0 0 1 -14 0z M-3 -36 v3 M0 -37 v4 M3 -36 v3" strokeWidth={1.6} strokeLinecap="round" />}
        </g>
      </g>
    </g>
  );
}

function Wheel({ cx, cy, r, spin }: { cx: number; cy: number; r: number; spin: "keke" | "car" }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.ink} />
      <g className={spin === "keke" ? "city-wheel-keke" : "city-wheel-car"}>
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#C9CED6" />
        <rect x={cx - 0.9} y={cy - r * 0.42} width={1.8} height={r * 0.84} fill={C.ink} />
      </g>
    </g>
  );
}

/** Keke (tricycle) facing right; origin is the road point under the front of its body. */
function Keke() {
  return (
    <g>
      <ellipse cx={55} cy={1} rx={55} ry={4} fill="#000" opacity={0.18} />
      {/* canopy and frame */}
      <path d="M10 -80 H86 Q92 -80 92 -74 V-72 H8 V-76 Q8 -80 10 -80Z" fill="#1E5B3A" />
      <rect x={12} y={-72} width={4} height={34} fill="#1E5B3A" />
      <rect x={86} y={-72} width={3} height={30} fill="#1E5B3A" />
      {/* passenger and driver */}
      <circle cx={34} cy={-56} r={7} fill="#4A2C1E" />
      <path d="M24 -48 q10 -6 20 0 v12 h-20z" fill={C.coral} />
      <circle cx={70} cy={-57} r={7} fill="#6B3F2A" />
      <path d="M61 -48 q9 -6 18 0 v12 h-18z" fill={C.urbn} />
      {/* windscreen */}
      <path d="M88 -72 L100 -44 H90 L84 -68Z" fill="#BFE3F5" opacity={0.85} />
      {/* body */}
      <path d="M4 -40 H92 Q108 -40 110 -24 L110 -14 H4Z" fill="#F7C413" />
      <rect x={4} y={-29} width={106} height={5} fill={C.urbn} />
      <rect x={4} y={-14} width={106} height={4} rx={2} fill={C.ink} opacity={0.85} />
      <circle cx={106} cy={-33} r={3} fill="#FFF6C7" />
      <Wheel cx={24} cy={-8} r={11} spin="keke" />
      <Wheel cx={92} cy={-8} r={10} spin="keke" />
    </g>
  );
}

/** Small car facing left; origin is the road point under its nose. */
function Car() {
  return (
    <g>
      <ellipse cx={46} cy={1} rx={46} ry={3.5} fill="#000" opacity={0.16} />
      <path d="M0 -14 Q0 -24 10 -26 L24 -28 L36 -42 H66 L80 -28 Q92 -27 92 -16 V-8 H0Z" fill={C.coral} />
      <path d="M39 -39 H52 V-29 H30Z M55 -39 H64 L74 -29 H55Z" fill="#BFE3F5" />
      <rect x={0} y={-12} width={92} height={4} rx={2} fill={C.ink} opacity={0.8} />
      <circle cx={4} cy={-19} r={2.5} fill="#FFF6C7" />
      <Wheel cx={20} cy={-6} r={8} spin="car" />
      <Wheel cx={72} cy={-6} r={8} spin="car" />
    </g>
  );
}

function Cloud({ x, y, s = 1, className }: { x: number; y: number; s?: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={className}>
        <path d="M0 30 Q-2 12 18 12 Q22 -6 44 -2 Q58 -16 76 -2 Q98 -4 100 16 Q116 18 114 30Z" fill="#fff" opacity={0.95} />
      </g>
    </g>
  );
}

// --- landmarks -------------------------------------------------------------------
function CocoaHouse() {
  const floors = Array.from({ length: 21 }, (_, i) => 96 + i * 18);
  return (
    <g>
      {/* mast */}
      <rect x={168} y={18} width={3} height={52} fill={C.ink} />
      <circle cx={169.5} cy={18} r={4} fill={C.coral} className="city-blink" />
      {/* crown */}
      <rect x={128} y={66} width={86} height={16} fill={C.coral} />
      <rect x={124} y={80} width={94} height={8} fill={C.ink} />
      {/* tower: front and shaded side */}
      <rect x={112} y={88} width={118} height={400} fill={C.cream} />
      <rect x={230} y={88} width={26} height={400} fill={C.creamShade} />
      {floors.map((y) => (
        <g key={y}>
          <rect x={118} y={y} width={106} height={9} fill={C.urbn} opacity={0.82} />
          <rect x={230} y={y} width={26} height={9} fill={C.blueShade} opacity={0.9} />
        </g>
      ))}
      {[150, 196].map((x) => (
        <rect key={x} x={x} y={88} width={4} height={400} fill={C.cream} />
      ))}
    </g>
  );
}

function MapoHall() {
  const cols = [1352, 1384, 1416, 1448, 1480, 1512];
  return (
    <g>
      {/* the hill it stands on */}
      <path d="M1250 470 Q1300 404 1440 398 Q1560 396 1610 430 V470Z" fill={C.grass} />
      <path d="M1290 452 Q1350 414 1440 410 Q1540 410 1600 440 V470 H1290Z" fill={C.grassDark} opacity={0.45} />
      {/* steps and plinth */}
      <rect x={1328} y={384} width={214} height={18} fill={C.creamShade} />
      <rect x={1318} y={398} width={234} height={8} fill="#D8CDB6" />
      {/* hall body behind the colonnade */}
      <rect x={1336} y={268} width={198} height={116} fill="#3A3F4D" />
      {/* columns */}
      {cols.map((x) => (
        <g key={x}>
          <rect x={x} y={268} width={14} height={116} fill="#FFFDF7" />
          <rect x={x + 10} y={268} width={4} height={116} fill={C.creamShade} />
        </g>
      ))}
      {/* entablature and pediment */}
      <rect x={1326} y={250} width={218} height={20} fill="#FFFDF7" />
      <rect x={1326} y={266} width={218} height={4} fill={C.coral} />
      <path d="M1320 252 L1435 196 L1550 252Z" fill="#FFFDF7" />
      <path d="M1346 246 L1435 204 L1524 246Z" fill={C.creamShade} />
      <circle cx={1435} cy={232} r={8} fill={C.coral} />
    </g>
  );
}

// --- the street ------------------------------------------------------------------
function Buka() {
  return (
    <g>
      <rect x={270} y={456} width={80} height={44} fill="#C9895B" />
      <rect x={270} y={456} width={80} height={8} fill="#A86D44" />
      <rect x={300} y={414} width={3} height={42} fill={C.ink} />
      <path d="M252 420 Q301 384 352 420Z" fill={C.coral} />
      <path d="M276 420 Q301 392 301 420 M301 420 Q301 392 326 420" fill="#fff" opacity={0.85} />
      <circle cx={286} cy={452} r={7} fill="#fff" />
      <circle cx={334} cy={452} r={7} fill="#fff" />
    </g>
  );
}

function Pharmacy() {
  return (
    <g>
      <rect x={366} y={392} width={146} height={108} fill={C.cream} />
      <rect x={366} y={388} width={146} height={8} fill={C.ink} />
      <rect x={380} y={400} width={118} height={26} rx={3} fill={C.urbn} />
      <path d="M433 405 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" fill="#3DDC84" />
      {/* striped awning */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${370 + i * 17.5} 432 h17.5 v14 a8.75 6 0 0 1 -17.5 0z`} fill={i % 2 ? "#fff" : C.urbn} />
      ))}
      <rect x={384} y={456} width={34} height={44} fill={C.glass} />
      <rect x={430} y={456} width={68} height={30} rx={2} fill="#BFE3F5" />
      <path d="M436 480 l18 -18 M452 482 l20 -20" stroke="#fff" strokeWidth={3} opacity={0.6} />
    </g>
  );
}

/** The hero home: modern duplex behind a gate wall that carries its Urbn plaque. */
function Home() {
  return (
    <g>
      {/* upper floor */}
      <rect x={566} y={338} width={196} height={70} fill="#FFFFFF" />
      <rect x={566} y={338} width={60} height={70} fill={C.yellow} />
      <Window x={640} y={350} w={52} h={46} />
      <Window x={704} y={350} w={44} h={46} />
      <rect x={556} y={330} width={216} height={10} fill={C.ink} />
      {/* balcony glass */}
      <rect x={636} y={392} width={120} height={14} fill="#BFE3F5" opacity={0.7} />
      <rect x={636} y={392} width={120} height={2} fill={C.ink} />
      {/* ground floor */}
      <rect x={556} y={408} width={224} height={92} fill="#F2F2F0" />
      <rect x={556} y={408} width={224} height={6} fill={C.ink} />
      <Window x={574} y={426} w={40} h={50} />
      <rect x={634} y={428} width={30} height={72} fill="#6B4A33" />
      <Window x={682} y={426} w={80} h={50} />
      {/* gate wall */}
      <rect x={540} y={458} width={256} height={42} fill="#E9E1D2" />
      <rect x={540} y={454} width={256} height={6} fill="#D3C8B4" />
      <rect x={690} y={462} width={70} height={38} fill={C.ink} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={696 + i * 11} y={466} width={3} height={34} fill="#3A3F4D" />
      ))}
      {/* the Urbn plaque */}
      <g transform="translate(588 466)">
        <g className="city-plaque" style={{ animationDelay: "1.1s" }}>
          <rect width={52} height={26} rx={3} fill={C.ink} />
          <rect x={5} y={5} width={18} height={3} rx={1} fill="#fff" />
          <rect x={5} y={11} width={26} height={2} rx={1} fill="#8A90A0" />
          <rect x={5} y={16} width={22} height={2} rx={1} fill="#8A90A0" />
          <rect x={35} y={5} width={13} height={13} rx={1} fill="#fff" />
          <path d="M37 7h4v4h-4z M43 7h3v3h-3z M37 13h3v3h-3z M42 12h4v4h-4z" fill={C.ink} />
          <rect x={5} y={21} width={42} height={2} rx={1} fill={C.urbn} />
          <clipPath id="plaque-clip">
            <rect width={52} height={26} rx={3} />
          </clipPath>
          <g clipPath="url(#plaque-clip)">
            <rect className="city-glint" x={-20} y={-6} width={10} height={40} fill="#fff" opacity={0.55} transform="skewX(-20)" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Bungalow() {
  return (
    <g>
      <rect x={818} y={430} width={148} height={70} fill={C.wallWarm} />
      <path d="M806 434 L840 396 H944 L978 434Z" fill={C.roof} />
      <path d="M840 396 H944 L950 404 H834Z" fill={C.roofDark} />
      <rect x={836} y={448} width={30} height={26} fill="#2F6B4F" />
      <path d="M836 456 h30 M836 464 h30 M846 448 v26 M856 448 v26" stroke={C.wallWarm} strokeWidth={1.5} />
      <rect x={880} y={446} width={26} height={54} fill="#6B4A33" />
      <rect x={918} y={448} width={30} height={26} fill="#2F6B4F" />
      <path d="M918 456 h30 M918 464 h30 M928 448 v26 M938 448 v26" stroke={C.wallWarm} strokeWidth={1.5} />
      <g transform="translate(908 480)">
        <g className="city-plaque" style={{ animationDelay: "1.5s" }}>
          <rect width={20} height={11} rx={1.5} fill={C.ink} />
          <rect x={12} y={2} width={6} height={6} fill="#fff" />
          <rect x={2} y={3} width={8} height={1.6} fill="#fff" />
          <rect x={2} y={7} width={6} height={1.6} fill={C.urbn} />
        </g>
      </g>
    </g>
  );
}

function Clinic() {
  return (
    <g>
      <rect x={994} y={382} width={128} height={118} fill="#FFFFFF" />
      <rect x={1110} y={382} width={12} height={118} fill={C.creamShade} />
      <rect x={990} y={376} width={136} height={8} fill={C.ink} />
      <rect x={1040} y={390} width={34} height={22} rx={3} fill="#FFE4E4" />
      <path d="M1053 393 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6z" transform="translate(0 -1) scale(1 0.92)" fill={C.clinic} />
      <Window x={1006} y={424} w={24} h={22} />
      <Window x={1084} y={424} w={24} h={22} />
      <rect x={1040} y={448} width={34} height={52} fill="#BFE3F5" />
      <rect x={1056} y={448} width={2} height={52} fill="#fff" />
    </g>
  );
}

function School() {
  return (
    <g>
      <rect x={1142} y={384} width={166} height={116} fill={C.yellow} />
      <rect x={1136} y={376} width={178} height={10} fill={C.ink} />
      {[1156, 1192, 1228, 1264].map((x) => (
        <g key={x}>
          <Window x={x} y={398} w={26} h={22} />
          <Window x={x} y={438} w={26} h={22} />
        </g>
      ))}
      <rect x={1214} y={470} width={30} height={30} fill="#6B4A33" />
      {/* flag: green-white-green */}
      <rect x={1318} y={318} width={3} height={182} fill={C.ink} />
      <g className="city-flag">
        <rect x={1321} y={320} width={14} height={26} fill="#008751" />
        <rect x={1335} y={320} width={14} height={26} fill="#fff" />
        <rect x={1349} y={320} width={14} height={26} fill="#008751" />
      </g>
    </g>
  );
}

function PowerLines() {
  return (
    <g stroke={C.ink} fill="none">
      <rect x={522} y={352} width={5} height={148} fill="#7A6A58" stroke="none" />
      <rect x={512} y={358} width={25} height={4} fill="#7A6A58" stroke="none" />
      <rect x={978} y={352} width={5} height={148} fill="#7A6A58" stroke="none" />
      <rect x={968} y={358} width={25} height={4} fill="#7A6A58" stroke="none" />
      <path d="M260 372 Q392 396 514 360 Q750 396 970 360 Q1136 392 1300 366" strokeWidth={1.2} opacity={0.55} />
      <path d="M260 378 Q392 402 535 360 Q752 402 991 360 Q1136 398 1300 372" strokeWidth={1.2} opacity={0.4} />
    </g>
  );
}

/** "Verified" badge over the home, shown while the keke is stopped outside. */
function Verified() {
  return (
    <g transform="translate(614 424)">
      <g className="city-verified">
        <path d="M0 22 L-6 30 L6 24Z" fill="#fff" />
        <rect x={-58} y={-6} width={116} height={32} rx={16} fill="#fff" />
        <rect x={-58} y={-6} width={116} height={32} rx={16} fill="none" stroke="#000" strokeOpacity={0.06} />
        <circle cx={-38} cy={10} r={10} fill="#12B76A" />
        <path d="M-43 10 l3.5 3.5 l6.5 -7" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={-22} y={15} fontFamily="Inter Variable, ui-sans-serif, system-ui, sans-serif" fontSize={14} fontWeight={700} fill={C.ink}>
          Verified
        </text>
      </g>
    </g>
  );
}

/** WhatsApp chat bubble beside the pharmacy pin. */
function ChatBubble() {
  return (
    <g transform="translate(476 344)">
      <g className="city-pin" style={{ animationDelay: "2.2s, 3.1s" }}>
        <circle r={13} fill={C.whatsapp} />
        <path d="M-6 9 l1.5 -5" stroke={C.whatsapp} strokeWidth={4} strokeLinecap="round" />
        <path d="M-4 -4 q1 -2 3 -1 l1.5 3 q0.5 1 -0.8 2 q1.5 3 4.5 4.5 q1 -1.3 2 -0.8 l3 1.5 q1 2 -1 3 q-4 1 -9 -4 q-5 -5 -3.2 -8.2z" fill="#fff" />
      </g>
    </g>
  );
}

// --- the scene -------------------------------------------------------------------

export function CityScene({ className, far, mid }: { className?: string; far?: MotionValue<number>; mid?: MotionValue<number> }) {
  const ref = useRef<SVGSVGElement>(null);
  const [paused, setPaused] = useState(false);

  // Pause every loop while the hero is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { rootMargin: "80px" });
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
      aria-label="Illustration of an Ibadan street: Cocoa House and Mapo Hall above hills of brown roofs, and a road lined with a food stall, a pharmacy, a home carrying its Urbn plaque, a bungalow, a clinic and a school. Nearby pins mark the places and a keke stops at the home as it shows Verified."
    >
      {/* sun and clouds */}
      <circle cx={1250} cy={96} r={46} fill="#FFE3A3" />
      <Cloud x={380} y={70} s={1.1} className="city-cloud" />
      <Cloud x={860} y={130} s={0.8} className="city-cloud city-cloud-slow" />
      <Cloud x={1420} y={60} s={0.9} className="city-cloud" />

      {/* far layer: hills, brown roofs and landmarks */}
      <motion.g style={far ? { y: far } : undefined}>
        <path d={hillPath(hillFar, 520)} fill={C.hillFar} />
        {ROOFS.map((r, i) => (
          <g key={i} transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})`}>
            <rect x={0} y={0} width={r.w} height={9} fill={C.wallWarm} />
            <path d={`M-3 1 L${(r.w * 0.22).toFixed(1)} -7 H${(r.w * 0.78).toFixed(1)} L${(r.w + 3).toFixed(1)} 1Z`} fill={r.tone > 0.7 ? C.roofDark : C.roof} />
          </g>
        ))}
        <path d={hillPath(hillNear, 520)} fill={C.hillNear} />
        <CocoaHouse />
        <MapoHall />
      </motion.g>

      {/* mid layer: the street */}
      <motion.g style={mid ? { y: mid } : undefined}>
        <rect x={0} y={470} width={W} height={40} fill={C.grass} />
        <PowerLines />
        <Buka />
        <Pharmacy />
        <Home />
        <Bungalow />
        <Clinic />
        <School />
        <Tree x={250} s={0.95} tone={1} />
        <Tree x={528} s={0.85} tone={0} />
        <Tree x={800} s={0.8} tone={2} />
        <Tree x={986} s={0.75} tone={1} />
        <Tree x={1132} s={0.7} tone={0} />
        <Tree x={1360} y={502} s={1.05} tone={2} />
        <Tree x={1440} y={504} s={0.9} tone={0} />
        <Tree x={1530} y={502} s={1.1} tone={1} />
        <Tree x={70} y={502} s={1.1} tone={0} />
        {/* Nearby pins over the places, and the home's Verified moment */}
        <Pin x={310} y={404} color={C.restaurant} glyph="bowl" delay={1.6} />
        <Pin x={452} y={382} color={C.business} glyph="shop" delay={1.8} />
        <ChatBubble />
        <Pin x={1058} y={368} color={C.clinic} glyph="cross" delay={2} />
        <Pin x={1226} y={368} color={C.school} glyph="cap" delay={2.2} />
        <Verified />
      </motion.g>

      {/* road */}
      <rect x={0} y={500} width={W} height={14} fill={C.pavement} />
      <rect x={0} y={512} width={W} height={5} fill={C.kerb} />
      <rect x={0} y={517} width={W} height={100} fill={C.road} />
      <g className="city-dashes">
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={i * 70} y={562} width={34} height={4} rx={2} fill="#E9EEF0" opacity={0.85} />
        ))}
      </g>
      <g transform="translate(1250 552)">
        <g className="city-car">
          <Car />
        </g>
      </g>
      <g transform="translate(600 596)">
        <g className="city-keke">
          <g className="city-bob">
            <Keke />
          </g>
        </g>
      </g>

      {/* clouds along the bottom edge melt the scene into the page */}
      <path
        transform="translate(0 22)"
        d="M0 640 V612 Q30 590 64 606 Q92 584 128 604 Q160 586 196 606 Q232 590 262 610 Q300 588 340 606 Q380 592 410 612 Q446 594 486 606 Q520 588 560 608 Q600 592 640 612 Q676 596 712 606 Q752 588 790 608 Q826 594 862 610 Q900 590 940 606 Q978 590 1012 610 Q1050 594 1090 606 Q1126 588 1166 608 Q1204 594 1240 610 Q1280 590 1318 606 Q1356 590 1392 610 Q1430 594 1470 606 Q1506 588 1546 608 Q1576 596 1600 604 V640Z"
        fill="#fff"
      />
    </svg>
  );
}
