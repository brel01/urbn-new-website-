// Small scenes for the homepage's "Property Details Shouldn't Get Lost" cards, drawn
// in the same line style as the hero city (components/city-scene.tsx) so the page
// reads as one world: the Urbn house mark, square-cornered strokes, Urbn Blue for
// Urbn. Each is 400x200 to fill the card's 2:1 image slot, and draws in the card's
// own ink (white on the black and blue cards, black on the light one).
// Motion reuses the `.city-*` rules in app.css (paused for reduced motion).
import { clsx } from "clsx";
import { SYMBOL_PATH } from "./logo";

const FONT = "Inter Variable, ui-sans-serif, system-ui, sans-serif";
const BLUE = "#253DE2";
const WARN = "#F79009";
const SUCCESS = "#12B76A";

/** Urbn's house mark: gable, chimney, square corners. Ground line at y=170. */
function House({ x, ink, fill }: { x: number; ink: string; fill: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-62 170 V110 L0 64 L30 86 V72 H46 V98 L62 110 V170" fill={fill} stroke={ink} strokeWidth={6} strokeLinejoin="miter" />
      <rect x={-46} y={118} width={22} height={16} fill={ink} />
      <rect x={24} y={118} width={22} height={16} fill={ink} />
      <rect x={-9} y={134} width={18} height={36} fill={ink} />
    </g>
  );
}

function Svg({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 400 200" role="img" aria-label={label} className={clsx("city-scene aspect-[2/1] w-full", className)}>
      {children}
    </svg>
  );
}

/** A listing card floating beside the house, with a warning dot: the details don't agree. */
function Tag({ x, y, price, beds, delay }: { x: number; y: number; price: string; beds: string; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="city-pin-loop" style={{ animationDelay: `${delay}s`, animationDuration: "7s" }}>
        <rect width={112} height={40} rx={4} fill="#fff" />
        <text x={10} y={17} fontFamily={FONT} fontSize={13} fontWeight={700} fill="#000">
          {price}
        </text>
        <text x={10} y={32} fontFamily={FONT} fontSize={11} fill="#555">
          {beds}
        </text>
        <circle cx={100} cy={12} r={5} fill={WARN} />
      </g>
    </g>
  );
}

/** One Property. Conflicting Details: three listings, three different stories. */
export function ConflictingArt() {
  return (
    <Svg label="Line drawing of one house with three listing cards beside it, each giving a different price and number of bedrooms.">
      <line x1={0} x2={400} y1={170} y2={170} stroke="#fff" strokeWidth={4} />
      <path d="M120 60 L176 98 M300 44 L232 92 M296 138 L262 140" stroke="#fff" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} />
      <House x={200} ink="#fff" fill="#000" />
      <Tag x={10} y={34} price="₦1.2m / yr" beds="3 bed · Bodija" delay={0} />
      <Tag x={282} y={22} price="₦850k / yr" beds="2 bed · Bodija" delay={1.2} />
      <Tag x={282} y={118} price="₦1.5m / yr" beds="4 bed · Agodi" delay={2.4} />
    </Svg>
  );
}

/** A record node around the house: a white circle with a small glyph. */
function Node({ cx, cy, children }: { cx: number; cy: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={20} fill={BLUE} stroke="#fff" strokeWidth={3} />
      <g fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="square">
        {children}
      </g>
    </g>
  );
}

/** Records That Stay Connected: the house stays linked to its records as occupants change. */
export function ConnectedArt() {
  const links: [number, number][] = [
    [300, 40],
    [350, 110],
    [290, 160],
    [70, 46],
  ];
  return (
    <Svg label="Line drawing of a house linked to its agreement, payments, keys and occupant. The occupant changes while the links stay.">
      <line x1={0} x2={400} y1={170} y2={170} stroke="#fff" strokeWidth={4} />
      {links.map(([x, y]) => (
        <line key={`${x}-${y}`} x1={200} y1={110} x2={x} y2={y} stroke="#fff" strokeWidth={2} strokeDasharray="5 5" className="city-dash" opacity={0.8} />
      ))}
      <House x={200} ink="#fff" fill={BLUE} />
      {/* the plaque that keeps it all attached */}
      <g transform="translate(222 140)">
        <rect width={26} height={16} fill="#000" />
        <path d={SYMBOL_PATH} transform="translate(4 3) scale(0.0085)" fill="#fff" fillRule="evenodd" />
      </g>
      {/* agreement */}
      <Node cx={300} cy={40}>
        <path d="M-7 -10 h10 l5 5 v15 h-15z M-3 -2 h7 M-3 3 h7" />
      </Node>
      {/* payments */}
      <Node cx={350} cy={110}>
        <path d="M-9 -6 h18 v12 h-18z M-9 -1 h18" />
      </Node>
      {/* keys */}
      <Node cx={290} cy={160}>
        <circle cx={-4} cy={0} r={5} />
        <path d="M1 0 h9 M7 0 v4" />
      </Node>
      {/* the occupant: one leaves, the next arrives, the record stays */}
      <g transform="translate(70 46)">
        <circle r={20} fill={BLUE} stroke="#fff" strokeWidth={3} />
        <g className="city-face-tolet" opacity={0}>
          <circle cx={0} cy={-5} r={5} fill="#fff" />
          <path d="M-9 11 q9 -12 18 0z" fill="#fff" />
        </g>
        <g className="city-face-verified">
          <circle cx={0} cy={-6} r={5} fill="none" stroke="#fff" strokeWidth={2.5} />
          <path d="M-9 11 q9 -12 18 0" fill="none" stroke="#fff" strokeWidth={2.5} />
        </g>
      </g>
    </Svg>
  );
}

/** Questions Before Payment: scan the plaque, read the record, ask, then pay. */
export function QuestionsArt() {
  return (
    <Svg label="Line drawing of a person scanning a house's Urbn plaque. Their phone shows the verified record, a question and its answer, and the payment button unlocks after.">
      <line x1={0} x2={400} y1={170} y2={170} stroke="#000" strokeWidth={4} />
      <House x={96} ink={BLUE} fill="#F5F5F6" />
      <g transform="translate(116 140)">
        <rect width={26} height={16} fill="#000" />
        <path d={SYMBOL_PATH} transform="translate(4 3) scale(0.0085)" fill="#fff" fillRule="evenodd" />
      </g>
      {/* visitor scanning */}
      <g transform="translate(190 170)">
        <path d="M-34 -42 L-12 -46 L-12 -26Z" fill={BLUE} opacity={0.18} className="city-beam" style={{ animationDuration: "8s" }} />
        <path d="M-4 0 L-2 -20 M5 0 L2 -20" stroke="#000" strokeWidth={5} />
        <rect x={-8} y={-46} width={16} height={28} rx={4} fill="#000" />
        <circle cx={0} cy={-54} r={7} fill="#000" />
        <path d="M-4 -38 L-14 -36 L-16 -44" stroke="#000" strokeWidth={4} fill="none" />
      </g>
      {/* the phone, close up */}
      <g transform="translate(246 10)">
        <rect width={124} height={182} rx={16} fill="#fff" stroke="#000" strokeWidth={5} />
        <rect x={12} y={14} width={100} height={20} rx={3} fill={BLUE} />
        <text x={62} y={27.5} textAnchor="middle" fontFamily={FONT} fontSize={7.4} fontWeight={700} fill="#fff">
          IBADAN-NORTH-0041-U
        </text>
        <rect x={12} y={40} width={58} height={16} rx={8} fill="#fff" stroke="#000" strokeWidth={1.5} />
        <circle cx={22} cy={48} r={5} fill={SUCCESS} />
        <text x={30} y={52} fontFamily={FONT} fontSize={8.5} fontWeight={700} fill="#000">
          Verified
        </text>
        <g className="city-chat-q">
          <rect x={30} y={64} width={82} height={26} rx={6} fill={BLUE} />
          <text x={38} y={81} fontFamily={FONT} fontSize={9} fill="#fff">
            Water included?
          </text>
        </g>
        <g className="city-chat-a">
          <rect x={12} y={96} width={82} height={26} rx={6} fill="#ECEEF1" />
          <text x={20} y={113} fontFamily={FONT} fontSize={9} fill="#000">
            Yes, borehole.
          </text>
        </g>
        <g className="city-pay">
          <rect x={12} y={142} width={100} height={26} rx={6} fill="#000" />
          <text x={62} y={159} textAnchor="middle" fontFamily={FONT} fontSize={10} fontWeight={700} fill="#fff">
            Pay
          </text>
        </g>
      </g>
    </Svg>
  );
}
