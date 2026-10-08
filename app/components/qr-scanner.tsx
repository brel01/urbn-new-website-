// Scan QR and Upload QR Image for Find a Property, like the app's DPI search.
// Uses the browser's BarcodeDetector where there is one and jsQR (loaded on
// demand) everywhere else. Decoded text goes back to the caller, which runs it
// through parseDpiIdentifier, so plaque links, urbn:// links and bare codes all work.
import { Camera, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "./motion";

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

async function nativeDetector(): Promise<Detector | null> {
  const BD = (globalThis as { BarcodeDetector?: { new (o: { formats: string[] }): Detector; getSupportedFormats?: () => Promise<string[]> } }).BarcodeDetector;
  if (!BD) return null;
  try {
    const formats = (await BD.getSupportedFormats?.()) ?? [];
    return formats.includes("qr_code") ? new BD({ formats: ["qr_code"] }) : null;
  } catch {
    return null;
  }
}

/** Reads a QR code from pixels on a canvas, with whichever decoder is available. */
async function decodeCanvas(canvas: HTMLCanvasElement, detector: Detector | null): Promise<string | null> {
  if (detector) {
    const found = await detector.detect(canvas).catch(() => []);
    if (found[0]?.rawValue) return found[0].rawValue;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { default: jsQR } = await import("jsqr");
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

export class QrImageError extends Error {}

/** Upload QR Image: resolves with the code's text, or throws the app's messages. */
export async function decodeQrImage(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new QrImageError("Could not read that image");
  }
  // Large photos are scaled down: quicker, and jsQR copes better.
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const text = await decodeCanvas(canvas, await nativeDetector());
  if (!text) throw new QrImageError("No QR code found in that image");
  return text;
}

/** Scan QR: the rear camera in a sheet, until a code is read. */
export function QrScanSheet({ open, onClose, onResult }: { open: boolean; onClose: () => void; onResult: (text: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    let stream: MediaStream | null = null;
    let stop = false;
    let t: ReturnType<typeof setTimeout>;
    const canvas = document.createElement("canvas");
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setError("This browser can't use the camera. Upload a photo of the QR code instead.");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch (e) {
        const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
        return setError(
          denied
            ? "Camera permission is needed to scan. Allow camera access for this site in your browser settings, or upload a photo of the QR code."
            : "We couldn't start the camera. Upload a photo of the QR code instead.",
        );
      }
      if (stop || !video.current) return stream.getTracks().forEach((tr) => tr.stop());
      video.current.srcObject = stream;
      await video.current.play().catch(() => {});
      const detector = await nativeDetector();
      const tick = async () => {
        const v = video.current;
        if (stop || !v) return;
        if (v.videoWidth) {
          const scale = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
          canvas.width = Math.round(v.videoWidth * scale);
          canvas.height = Math.round(v.videoHeight * scale);
          canvas.getContext("2d", { willReadFrequently: true })!.drawImage(v, 0, 0, canvas.width, canvas.height);
          const text = await decodeCanvas(canvas, detector);
          if (text && !stop) {
            navigator.vibrate?.(40);
            return onResult(text);
          }
        }
        t = setTimeout(tick, 200);
      };
      tick();
    })();
    return () => {
      stop = true;
      clearTimeout(t);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [open, onResult]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-black text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Scan a property's QR code"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
            <p className="font-semibold">Scan QR</p>
            <button type="button" onClick={onClose} aria-label="Close scanner" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X className="size-5" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <video ref={video} muted playsInline className="absolute inset-0 size-full object-cover" />
            {!error && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="relative size-64 rounded-3xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.45)] ring-2 ring-white/90">
                  <motion.span
                    className="absolute inset-x-4 h-0.5 rounded-full bg-urbn shadow-[0_0_12px_#253DE2]"
                    initial={{ top: "10%" }}
                    animate={{ top: "90%" }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div>
                  <Camera className="mx-auto size-10 text-white/60" />
                  <p className="mt-4 text-sm text-white/80">{error}</p>
                  <button type="button" onClick={onClose} className="mt-5 h-11 rounded-xl bg-white px-5 text-sm font-semibold text-ink">
                    Back to Search
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70">Point your camera at the QR code on the Urbn plaque.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
