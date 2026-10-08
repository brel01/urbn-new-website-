// U-Beep on the web: the app's sender flow (urbn-mobile src/app/(public)/u-beep/
// [dpiCode].tsx) in a sheet on the property's record. Reason → unit (when the
// scan was for a whole multi-unit property) → message → phone → code → sent,
// then it waits up to 30 minutes for a reply. On the web the sender is always
// anonymous, so they confirm their phone number with a one-time code.
import { clsx } from "clsx";
import { AlertTriangle, ArrowLeft, Bell, Check, LoaderCircle, MoreHorizontal, Package, Shield, ShoppingBag, User, Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { appDeepLink } from "~/lib/dpi";
import {
  type CreateUBeepResponse,
  SAMPLE_OTP,
  UBEEP_PRESETS,
  UBEEP_REASONS,
  UBEEP_WINDOW_MS,
  type UBeepError,
  type UBeepReason,
  type UBeepStatusResponse,
  type UBeepTargets,
} from "~/lib/ubeep";
import { EASE } from "./motion";
import { SampleBadge } from "./nearby";

const ICONS: Record<UBeepReason, typeof Package> = {
  DELIVERY: Package,
  VISITOR: User,
  SERVICE: Wrench,
  PICKUP: ShoppingBag,
  PROPERTY_ISSUE: AlertTriangle,
  SECURITY: Shield,
  OTHER: MoreHorizontal,
};

type Step = "REASON" | "UNIT_SELECT" | "MESSAGE" | "PHONE" | "OTP" | "SENT";
type Sent = CreateUBeepResponse & { propertyName: string };

const POLL_MS = 7000;
const storeKey = (dpi: string, unit: string | null) => `urbn:ubeep:${dpi}${unit ? `/${unit}` : ""}`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
  if (!res.ok) throw Object.assign(new Error((body as UBeepError).error), body, { status: res.status });
  return body as T;
}

const readSent = (key: string): Sent | null => {
  try {
    const s = JSON.parse(sessionStorage.getItem(key) ?? "null") as Sent | null;
    return s && Date.parse(s.expiresAt) > Date.now() - 60_000 ? s : null;
  } catch {
    return null;
  }
};

export function UBeepSheet({
  open,
  onClose,
  dpiCode,
  unitCode,
  propertyName,
  sample,
}: {
  open: boolean;
  onClose: () => void;
  dpiCode: string;
  unitCode: string | null;
  propertyName: string;
  sample?: boolean;
}) {
  const key = storeKey(dpiCode, unitCode);
  const [step, setStep] = useState<Step>("REASON");
  const [reason, setReason] = useState<UBeepReason | null>(null);
  const [unit, setUnit] = useState<string | null>(unitCode);
  const [targets, setTargets] = useState<UBeepTargets | null>(null);
  const [targetsError, setTargetsError] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  // Same id across retries of the same beep, so a double tap never sends two.
  const requestId = useRef<string | null>(null);

  // Escape closes; the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      root.style.overflow = prev;
    };
  }, [open, onClose]);

  // A beep already sent from this page (e.g. before a refresh) reopens on its status.
  useEffect(() => {
    if (!open) return;
    const s = readSent(key);
    if (s) {
      setSent(s);
      setStep("SENT");
    }
  }, [open, key]);

  // A property-level scan asks which unit, when the property has several.
  const loadTargets = useCallback(() => {
    if (unitCode) return setTargets({ mode: "DIRECT" });
    setTargetsError(false);
    setTargets(null);
    request<UBeepTargets>(`/api/ubeep/targets?dpi=${encodeURIComponent(dpiCode)}`)
      .then(setTargets)
      .catch(() => setTargetsError(true));
  }, [dpiCode, unitCode]);
  useEffect(() => {
    if (open && !targets) loadTargets();
  }, [open, targets, loadTargets]);

  const reset = () => {
    sessionStorage.removeItem(key);
    requestId.current = null;
    setSent(null);
    setReason(null);
    setUnit(unitCode);
    setMessage("");
    setOtp("");
    setError(null);
    setStep("REASON");
  };

  const fail = (e: unknown) => setError(e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.");

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await request("/api/ubeep/otp/send", { method: "POST", body: JSON.stringify({ phone }) });
      setOtp("");
      setStep("OTP");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const verifyAndSend = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { verificationToken } = await request<{ verificationToken: string }>("/api/ubeep/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      requestId.current ??= crypto.randomUUID();
      const res = await request<CreateUBeepResponse>("/api/ubeep", {
        method: "POST",
        body: JSON.stringify({ dpiCode, unitCode: unit ?? undefined, reason, message: message.trim(), verificationToken, clientRequestId: requestId.current }),
      });
      const s: Sent = { ...res, expiresAt: res.expiresAt ?? new Date(Date.now() + UBEEP_WINDOW_MS).toISOString(), propertyName };
      try {
        sessionStorage.setItem(key, JSON.stringify(s));
      } catch {
        /* private mode */
      }
      setSent(s);
      setStep("SENT");
    } catch (err) {
      // The property needs a unit after all: pick one, then send again.
      if ((err as { errorCode?: string }).errorCode === "UBEEP_UNIT_SELECTION_REQUIRED") {
        setUnit(null);
        setTargets(null);
        loadTargets();
        setStep("UNIT_SELECT");
        return;
      }
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const back: Partial<Record<Step, Step>> = {
    UNIT_SELECT: "REASON",
    MESSAGE: targets?.mode === "SELECT_UNIT" && !unitCode ? "UNIT_SELECT" : "REASON",
    PHONE: "MESSAGE",
    OTP: "PHONE",
  };
  const presets = reason ? (UBEEP_PRESETS[reason] ?? []) : [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ubeep-title">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="relative flex max-h-[92svh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white sm:rounded-[1.75rem]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-neutral-200 sm:hidden" />
            <header className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-2 sm:pt-5">
              {back[step] ? (
                <button type="button" aria-label="Back" onClick={() => (setError(null), setStep(back[step]!))} className="grid size-9 place-items-center rounded-full hover:bg-mist">
                  <ArrowLeft className="size-4" />
                </button>
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-ink text-white">
                  <Bell className="size-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">U-Beep</p>
                <p className="truncate text-xs text-neutral-500">
                  {propertyName}
                  {unit && ` · Unit ${unit}`}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-mist hover:bg-fog">
                <X className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {step !== "SENT" && (
                <a href={appDeepLink(dpiCode, unit)} className="mb-4 flex items-center justify-between rounded-xl bg-mist px-3 py-2.5 text-xs text-neutral-600">
                  <span>Have the Urbn app?</span>
                  <span className="font-semibold text-ink">Open in Urbn →</span>
                </a>
              )}

              {step === "REASON" && (
                <Panel title="Why are you here?">
                  <div className="grid grid-cols-3 gap-2.5">
                    {UBEEP_REASONS.map((r) => {
                      const Icon = ICONS[r.id];
                      const on = reason === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            if (reason !== r.id) setMessage("");
                            setReason(r.id);
                          }}
                          className={clsx(
                            "flex flex-col items-center gap-2 rounded-2xl p-3.5 text-center text-xs transition active:scale-95",
                            on ? "bg-ink font-bold text-white" : r.id === "SECURITY" ? "border-2 border-ink font-bold" : "border border-neutral-200 bg-mist font-semibold",
                          )}
                        >
                          <Icon className="size-5" />
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                  {targetsError && (
                    <p className="mt-4 text-sm text-error">
                      Couldn't load this property's units. Please try again.{" "}
                      <button type="button" onClick={loadTargets} className="font-semibold underline">
                        Try Again
                      </button>
                    </p>
                  )}
                  <Primary disabled={!reason || !targets} onClick={() => setStep(targets?.mode === "SELECT_UNIT" && !unitCode ? "UNIT_SELECT" : "MESSAGE")}>
                    {reason && !targets && !targetsError ? <LoaderCircle className="size-4 animate-spin" /> : "Continue"}
                  </Primary>
                </Panel>
              )}

              {step === "UNIT_SELECT" && (
                <Panel title="Which unit?">
                  {!targets ? (
                    targetsError ? (
                      <p className="text-sm text-error">
                        Couldn't load this property's units.{" "}
                        <button type="button" onClick={loadTargets} className="font-semibold underline">
                          Try Again
                        </button>
                      </p>
                    ) : (
                      <LoaderCircle className="size-5 animate-spin text-neutral-400" />
                    )
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(targets.mode === "SELECT_UNIT" ? targets.units : []).map((u) => (
                        <button
                          key={u.unitCode}
                          type="button"
                          aria-pressed={unit === u.unitCode}
                          onClick={() => setUnit(u.unitCode)}
                          className={clsx("h-10 rounded-full px-4 text-sm font-semibold", unit === u.unitCode ? "bg-ink text-white" : "border border-neutral-200 bg-mist")}
                        >
                          {u.unitCode}
                        </button>
                      ))}
                    </div>
                  )}
                  <Primary disabled={!unit} onClick={() => setStep("MESSAGE")}>
                    Continue
                  </Primary>
                </Panel>
              )}

              {step === "MESSAGE" && (
                <Panel title="Add a message">
                  {presets.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {presets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setMessage(p)}
                          className={clsx("rounded-full px-3 py-1.5 text-left text-xs font-medium", message === p ? "bg-ink text-white" : "border border-neutral-200 bg-mist")}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                  <label className="block text-xs font-semibold text-neutral-600" htmlFor="ubeep-message">
                    Message
                  </label>
                  <textarea
                    id="ubeep-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell them why you're here"
                    rows={3}
                    maxLength={500}
                    className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 p-3 text-[15px] outline-none focus:border-urbn focus:ring-2 focus:ring-urbn/20"
                  />
                  <Primary disabled={!message.trim()} onClick={() => setStep("PHONE")}>
                    Send U-Beep
                  </Primary>
                </Panel>
              )}

              {step === "PHONE" && (
                <form onSubmit={sendCode}>
                  <Panel title="Verify it's you" body="We'll text you a code so the people at this property know the U-Beep came from a real number.">
                    <Field id="ubeep-phone" label="Phone Number">
                      <input
                        id="ubeep-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-[15px] outline-none focus:border-urbn focus:ring-2 focus:ring-urbn/20"
                      />
                    </Field>
                    <ErrorText error={error} />
                    <Primary type="submit" disabled={busy || phone.replace(/\D/g, "").length < 10}>
                      {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Send Code"}
                    </Primary>
                  </Panel>
                </form>
              )}

              {step === "OTP" && (
                <form onSubmit={verifyAndSend}>
                  <Panel title="Enter the code" body={`We sent a code to ${phone}.`}>
                    <Field id="ubeep-otp" label="Code">
                      <input
                        id="ubeep-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit code"
                        className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-urbn focus:ring-2 focus:ring-urbn/20"
                      />
                    </Field>
                    {sample && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <SampleBadge /> Sample mode: no text is sent. Use code {SAMPLE_OTP}.
                      </p>
                    )}
                    <ErrorText error={error} />
                    <Primary type="submit" disabled={busy || otp.length < 4}>
                      {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Verify & Send"}
                    </Primary>
                    <button type="button" disabled={busy} onClick={() => sendCode()} className="mt-2 h-10 w-full text-sm font-semibold text-neutral-600 hover:text-ink">
                      Send a new code
                    </button>
                  </Panel>
                </form>
              )}

              {step === "SENT" && sent && <SentStatus sent={sent} onDone={onClose} onAgain={reset} />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** "U-Beep sent", then the reply (or "No response yet" once the 30 minutes are up). */
function SentStatus({ sent, onDone, onAgain }: { sent: Sent; onDone: () => void; onAgain: () => void }) {
  const [status, setStatus] = useState<UBeepStatusResponse | null>(null);
  const [expired, setExpired] = useState(() => Date.parse(sent.expiresAt) <= Date.now());

  useEffect(() => {
    if (!sent.trackToken) return;
    let stop = false;
    let t: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (stop) return;
      if (Date.parse(sent.expiresAt) <= Date.now()) return setExpired(true);
      try {
        const s = await request<UBeepStatusResponse>(`/api/ubeep/${encodeURIComponent(sent.id)}/status`, { headers: { "X-Track-Token": sent.trackToken! } });
        if (stop) return;
        setStatus(s);
        if (s.status !== "PENDING") return;
      } catch {
        /* keep trying until the window closes */
      }
      t = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [sent]);

  const responded = status?.status === "RESPONDED";
  const over = !responded && (expired || status?.status === "EXPIRED");
  return (
    <div className="pt-2 pb-1 text-center" role="status" aria-live="polite">
      <span className={clsx("mx-auto grid size-16 place-items-center rounded-full text-white", responded ? "bg-success" : "bg-ink")}>
        {responded ? <Check className="size-8" /> : <Bell className="size-7" />}
      </span>
      <h2 id="ubeep-title" className="mt-4 font-display text-2xl">
        {responded ? "They responded" : "U-Beep sent"}
      </h2>
      {responded ? (
        <blockquote className="mx-auto mt-3 max-w-xs rounded-2xl bg-mist px-4 py-3 text-[15px]">“{status?.responseMessage || "On my way"}”</blockquote>
      ) : (
        <p className="mt-2 text-sm text-neutral-600">We've notified the people at {sent.propertyName || "this property"}.</p>
      )}
      {!responded && (
        <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-neutral-200 p-4 text-sm">
          <p className="font-semibold">Response window: 30 minutes</p>
          <p className="mt-1 flex items-center justify-center gap-2 text-neutral-500">
            {over ? (
              "No response yet"
            ) : (
              <>
                <span className="size-2 animate-pulse rounded-full bg-urbn" /> Waiting for a response…
              </>
            )}
          </p>
        </div>
      )}
      <p className="mt-4 text-xs text-neutral-500">Keep this page open to see their reply.</p>
      <Primary onClick={onDone}>Done</Primary>
      <button type="button" onClick={onAgain} className="mt-2 h-10 w-full text-sm font-semibold text-neutral-600 hover:text-ink">
        Send another U-Beep
      </button>
    </div>
  );
}

function Panel({ title, body, children }: { title: string; body?: string; children: ReactNode }) {
  return (
    <div>
      <h2 id="ubeep-title" className="font-display text-2xl leading-tight">
        {title}
      </h2>
      {body && <p className="mt-1.5 text-sm text-neutral-600">{body}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-neutral-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorText({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
      {error}
    </p>
  ) : null;
}

function Primary({ children, disabled, onClick, type = "button" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300"
    >
      {children}
    </button>
  );
}
