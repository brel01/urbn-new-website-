import { clsx } from "clsx";
import {
  BellRing,
  CalendarCheck,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Send,
  Share2,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { LogoSymbol } from "./logo";

/** iPhone-style frame. Children render as the screen (dark app UI). */
export function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "relative aspect-[9/19] w-full rounded-[2.6rem] bg-neutral-900 p-[0.55rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] ring-1 ring-neutral-700",
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#05070f] via-[#070b22] to-[#0d1650] text-white">
        <div className="absolute top-2 left-1/2 z-20 h-[1.35rem] w-[34%] -translate-x-1/2 rounded-full bg-black" />
        <div className="flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold">
          <span>10:49</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm border border-white/80" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Ticks while the element is in view, so loops only run when visible. */
function useLoop(steps: number, interval: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15%" });
  // Rest on the completed state so a screen never looks empty before it animates.
  const [step, setStep] = useState(steps - 1);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setStep((s) => (s + 1) % steps), interval);
    return () => clearInterval(t);
  }, [inView, steps, interval]);
  return { ref, step };
}

const Title = ({ children }: { children: ReactNode }) => (
  <p className="mt-5 text-center font-display text-[17px]">{children}</p>
);

// ---------------------------------------------------------------------------

export function UBeepScreen() {
  const { ref, step } = useLoop(3, 2200);
  return (
    <div ref={ref} className="flex h-full flex-col items-center px-5">
      <Title>U-Beep</Title>
      <div className="relative mt-8 grid size-14 place-items-center">
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute inset-0 animate-ping-slow rounded-full bg-urbn/60" style={{ animationDelay: `${i * 0.8}s` }} />
        ))}
        <motion.span
          className="relative grid size-14 place-items-center rounded-full bg-urbn"
          animate={{ rotate: [0, -14, 12, -8, 6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.3 }}
        >
          <BellRing className="size-6" />
        </motion.span>
      </div>
      <p className="mt-4 text-[11px] font-semibold">Scan Property QR Code</p>
      <div className="relative mt-3 size-24 overflow-hidden rounded-lg bg-white p-1.5">
        <div className="grid size-full grid-cols-7 grid-rows-7 gap-px">
          {Array.from({ length: 49 }).map((_, i) => (
            <span key={i} className={clsx("rounded-[1px]", (i * 7 + (i % 5) * 3) % 3 === 0 ? "bg-black" : "bg-white")} />
          ))}
        </div>
        <span className="absolute inset-x-0 h-6 animate-scan bg-gradient-to-b from-transparent via-urbn/50 to-transparent" />
      </div>
      <p className="mt-2 text-[10px] text-white/60">Send a U-Beep</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-auto mb-6 w-full rounded-xl bg-white/10 p-3 text-[10.5px] backdrop-blur"
        >
          <p className="font-semibold">{["Delivery at the Gate", "Visitor for Flat 2", "Plumber Has Arrived"][step]}</p>
          <p className="mt-0.5 text-white/60">Alert Sent</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function VideoScreen() {
  const { ref, step } = useLoop(3, 2600);
  const imgs = ["/images/house-result.webp", "/images/hero-billboard.webp", "/images/house-plaque.webp"];
  const titles = ["Olatunde House · Bodija", "Romi Tayo House · Akobo", "Aerodrome Duplex · Samonda"];
  return (
    <div ref={ref} className="absolute inset-0">
      <AnimatePresence initial={false}>
        <motion.img
          key={step}
          src={imgs[step]}
          alt=""
          className="absolute inset-0 size-full object-cover"
          initial={{ y: "100%" }}
          animate={{ y: "0%", scale: [1, 1.08] }}
          exit={{ y: "-100%" }}
          transition={{ y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, scale: { duration: 2.6, ease: "linear" } }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />
      <p className="absolute top-9 left-0 w-full text-center text-[11px] font-semibold">Video Listings</p>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-[9px]">
        {[Heart, MessageCircle, Share2].map((I, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <span className="grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur">
              <I className={clsx("size-4", i === 0 && "fill-error text-error")} />
            </span>
            {["2.1k", "184", "Share"][i]}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-8">
        <p className="font-display text-[15px]">{titles[step]}</p>
        <p className="mt-1 text-[10px] text-white/70">Verified · Swipe for next walkthrough</p>
        <div className="mt-3 h-0.5 overflow-hidden rounded bg-white/25">
          <motion.div key={step} className="h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.6, ease: "linear" }} />
        </div>
      </div>
    </div>
  );
}

export function LocationScreen() {
  const path = "M30 270 C 60 220, 40 180, 90 160 S 150 120, 140 80 S 170 40, 190 30";
  return (
    <div className="absolute inset-0 bg-[#0a0f24]">
      <svg viewBox="0 0 220 330" className="absolute inset-0 size-full" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" x2="220" y1={i * 30} y2={i * 30 + 12} stroke="#1b2350" strokeWidth="6" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} y1="0" y2="330" x1={i * 32} x2={i * 32 - 20} stroke="#1b2350" strokeWidth="4" />
        ))}
        <path d={path} stroke="#253de2" strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
        <motion.path
          d={path}
          stroke="#5c6deb"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle r="7" fill="#fff">
          <animateMotion dur="4s" repeatCount="indefinite" path={path} />
        </circle>
        <circle r="4" fill="#253de2">
          <animateMotion dur="4s" repeatCount="indefinite" path={path} />
        </circle>
      </svg>
      <span className="absolute top-[7%] right-[10%] grid size-8 place-items-center rounded-full bg-urbn ring-4 ring-urbn/30">
        <MapPin className="size-4" />
      </span>
      <p className="absolute top-9 left-0 w-full text-center text-[11px] font-semibold">Live Location</p>
      <div className="absolute inset-x-3 bottom-5 rounded-2xl bg-white p-3 text-ink">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-urbn text-white">
            <Navigation className="size-4" />
          </span>
          <div className="text-[10.5px]">
            <p className="font-semibold">Kunle Is on His Way</p>
            <p className="text-neutral-500">Estimated Arrival: 4 Min · Jericho GRA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingScreen() {
  const { ref, step } = useLoop(4, 1500);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = ["10:00", "12:30", "14:00", "16:30"];
  return (
    <div ref={ref} className="flex h-full flex-col px-4">
      <Title>Request Inspection</Title>
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-white/10 p-1 text-[10px] font-semibold">
        <span className="rounded-lg bg-white py-1.5 text-center text-ink">Physical</span>
        <span className="py-1.5 text-center text-white/70">Virtual</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {days.map((d, i) => (
          <span key={d} className={clsx("rounded-lg py-2 text-center text-[10px]", i === 2 ? "bg-urbn" : "bg-white/10")}>
            {d}
            <span className="block font-display text-sm">{14 + i}</span>
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-1.5">
        {slots.map((s, i) => (
          <motion.span
            key={s}
            animate={{ backgroundColor: step >= 1 && i === 1 ? "#ffffff" : "rgba(255,255,255,0.1)", color: step >= 1 && i === 1 ? "#000" : "#fff" }}
            className="rounded-lg py-2 text-center text-[11px] font-semibold"
          >
            {s}
          </motion.span>
        ))}
      </div>
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-auto mb-6 flex items-center gap-2 rounded-xl bg-success/20 p-3 text-[10.5px]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-success">
              <Check className="size-4" />
            </span>
            <span>
              <b className="block">Accepted by Owner</b>
              <span className="text-white/70">Wed 16 · 12:30 · Bodija</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AiScreen() {
  const { ref, step } = useLoop(4, 1700);
  const q = "2-bedroom flat in Bodija, up to ₦800k a year";
  return (
    <div ref={ref} className="flex h-full flex-col px-4">
      <Title>AI Search</Title>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[10.5px]">
        <Sparkles className="size-3.5 shrink-0 text-blue-300" />
        <span className="truncate">{step === 0 ? q.slice(0, 12) + "…" : q}</span>
      </div>
      <div className="mt-4 space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: step >= 1 + (i > 0 ? 1 : 0) ? 1 : 0, y: step >= 1 + (i > 0 ? 1 : 0) ? 0 : 12 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.07] p-2"
          >
            <img src={["/images/house-identity.webp", "/images/hero-billboard.webp", "/images/house-result.webp"][i]} alt="" className="size-11 rounded-lg object-cover" />
            <div className="min-w-0 text-[10px]">
              <p className="truncate font-semibold">{["Bodija Court · 2 bed", "New Bodija Flat · 2 bed", "UI Road Flat · 2 bed"][i]}</p>
              <p className="text-white/60">{["₦750,000", "₦780,000", "₦700,000"][i]} / year</p>
            </div>
            <span className="ml-auto text-[8.5px] font-semibold text-success">Verified</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-auto mb-6 text-center text-[10px] text-white/50">3 Matching Listings · Refine Search</p>
    </div>
  );
}

export function ChatScreen() {
  const { ref, step } = useLoop(5, 1400);
  const msgs: [boolean, string][] = [
    [true, "Hi, is the 3-bedroom flat in Akobo still available?"],
    [false, "Yes. You can request an inspection in the app."],
    [true, "I've requested Saturday at 11am."],
    [false, "I've accepted it. See you then."],
  ];
  return (
    <div ref={ref} className="flex h-full flex-col px-4">
      <div className="mt-5 flex items-center gap-2 border-b border-white/10 pb-3">
        <span className="grid size-8 place-items-center rounded-full bg-urbn font-display text-xs">TH</span>
        <div className="text-[10.5px]">
          <p className="font-semibold">Tayo Homes</p>
          <p className="text-white/60">Property Manager</p>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        {msgs.map(([me, text], i) => (
          <motion.p
            key={i}
            animate={{ opacity: step > i ? 1 : 0, y: step > i ? 0 : 10 }}
            className={clsx(
              "max-w-[80%] rounded-2xl px-3 py-2 text-[10.5px]",
              me ? "self-end rounded-br-sm bg-urbn" : "self-start rounded-bl-sm bg-white/12 bg-white/10",
            )}
          >
            {text}
          </motion.p>
        ))}
      </div>
      <div className="mb-5 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[10px] text-white/50">
        Message… <Send className="ml-auto size-3.5 text-white" />
      </div>
    </div>
  );
}

export function CommunityScreen() {
  const posts = [
    ["Adaeze · Bodija", "Does anyone know a reliable electrician near Bodija Market?", "12 replies"],
    ["Femi · Akobo", "Water supply is back on Kolapo Ishola Road.", "34 likes"],
    ["Estate Admin", "Residents' meeting this Saturday at 10am, at the clubhouse.", "Pinned"],
  ];
  return (
    <div className="flex h-full flex-col px-4">
      <Title>Bodija Community</Title>
      <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/60">
        <Users className="size-3" /> Residents & neighbours
      </p>
      <div className="mt-4 space-y-2">
        {posts.map(([who, text, meta], i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.25 }}
            className="rounded-xl bg-white/[0.07] p-3 text-[10px]"
          >
            <p className="font-semibold">{who}</p>
            <p className="mt-1 text-white/80">{text}</p>
            <p className="mt-1.5 text-white/40">{meta}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Home screen of the app, mirrors the in-hand photo from the designs. */
export function AppHomeScreen() {
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-white/50">Urbn</p>
          <p className="font-display text-[15px]">Good morning</p>
        </div>
        <LogoSymbol className="w-4 text-white" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[9px]">
        {[
          [BellRing, "U-Beep"],
          [MapPin, "Find a Property"],
          [Video, "Listings"],
        ].map(([I, l]: any) => (
          <span key={l} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.06] py-3">
            <I className="size-4" />
            {l}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[10px] font-semibold">Featured</p>
      <div className="mt-2 overflow-hidden rounded-xl bg-white/[0.06]">
        <img src="/images/house-result.webp" alt="" className="h-24 w-full object-cover" />
        <div className="flex items-center justify-between p-2 text-[10px]">
          <span>
            <b className="block">Olatunde House</b>
            <span className="text-white/60">Bodija, Ibadan</span>
          </span>
          <span className="text-success">Verified</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.06] p-2 text-[10px]">
        <CalendarCheck className="size-4 text-blue-300" /> Inspection booked · Sat 11:00
      </div>
    </div>
  );
}

/** Nearby: businesses, schools, clinics and other activities recorded at nearby properties, nearest first. */
export function NearbyScreen() {
  const { ref, step } = useLoop(4, 1600);
  const chips = ["All", "Business", "School", "Clinic", "Restaurant"];
  const places = [
    ["Mama Tunde's Kitchen", "Restaurant", "0.3 km"],
    ["Bright Future Academy", "School", "0.6 km"],
    ["Bodija Family Clinic", "Clinic", "0.9 km"],
    ["Adeola Pharmacy", "Business", "1.2 km"],
  ];
  return (
    <div ref={ref} className="flex h-full flex-col px-4">
      <Title>Near Me</Title>
      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-hidden">
        {chips.map((c, i) => (
          <span key={c} className={clsx("shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-semibold", i === 0 ? "bg-white text-ink" : "bg-white/10 text-white/70")}>
            {c}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {places.map(([name, type, km], i) => (
          <motion.div
            key={name}
            animate={{ opacity: step >= Math.min(i, 3) ? 1 : 0.25, y: step >= Math.min(i, 3) ? 0 : 6 }}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.07] p-2.5 text-[10px]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-urbn">
              <MapPin className="size-3.5" />
            </span>
            <span className="min-w-0">
              <b className="block truncate">{name}</b>
              <span className="text-white/60">{type}</span>
            </span>
            <span className="ml-auto shrink-0 text-white/60">{km}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-auto mb-6 text-center text-[10px] text-white/50">Nearest First · Bodija</p>
    </div>
  );
}
