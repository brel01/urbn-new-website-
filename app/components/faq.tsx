import { clsx } from "clsx";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import type { Faq } from "~/lib/faqs";
import { EASE, Reveal } from "./motion";
import { ButtonLink, SectionHeading } from "./ui";

function FaqItem({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div
      className={clsx(
        "rounded-2xl border transition-colors duration-300",
        open ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:border-ink",
      )}
    >
      <h3 className="font-sans text-base font-semibold tracking-normal sm:text-[17px]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
        >
          {faq.q}
          <span className="shrink-0">{open ? <Minus className="size-5" /> : <Plus className="size-5" />}</span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-6 text-[15px] leading-relaxed text-neutral-300 sm:px-6">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqList({ faqs, columns = 2 }: { faqs: Faq[]; columns?: 1 | 2 }) {
  const [open, setOpen] = useState<number | null>(0);
  const cols = columns === 2 ? [faqs.filter((_, i) => i % 2 === 0), faqs.filter((_, i) => i % 2 === 1)] : [faqs];
  return (
    <div className={clsx("grid gap-3 sm:gap-4", columns === 2 && "lg:grid-cols-2")}>
      {cols.map((col, c) => (
        <div key={c} className="flex flex-col gap-3 sm:gap-4">
          {col.map((faq) => {
            const index = faqs.indexOf(faq);
            return (
              <FaqItem key={faq.q} faq={faq} open={open === index} onToggle={() => setOpen(open === index ? null : index)} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function FaqSection({
  faqs,
  lede = "Questions about property identity, inspections or getting started? Find out how Urbn works.",
}: {
  faqs: Faq[];
  lede?: string;
}) {
  return (
    <section className="container-x py-16 sm:py-24 lg:py-32" aria-labelledby="faq-heading">
      <Reveal>
        <SectionHeading title={<span id="faq-heading">FAQs</span>} lede={lede} />
      </Reveal>
      <Reveal className="mx-auto mt-8 max-w-5xl md:mt-14" delay={0.1}>
        <FaqList faqs={faqs} />
      </Reveal>
      <div className="mt-8 md:mt-10 md:text-center">
        <ButtonLink to="/faq" variant="dark" size="lg" className="w-full md:h-11 md:w-auto md:px-5 md:text-[15px]">
          See All FAQs
        </ButtonLink>
      </div>
    </section>
  );
}
