import { Check, Mail, MapPin, MessageCircle } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import { Reveal, WordsReveal } from "~/components/motion";
import { SocialLinks } from "~/components/social";
import { Button } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE } from "~/lib/site";
import type { Route } from "./+types/contact";
import { PageSky } from "~/components/city-scene";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Contact Urbn",
    description: "Need help with the app or want to discuss a partnership? Get in touch with the Urbn team.",
    path: "/contact",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  });

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10) errors.message = "Add a little more detail, using at least 10 characters.";
  if (Object.keys(errors).length) return { ok: false as const, errors };
  // TODO: forward to the support inbox / CRM.
  console.info("[contact]", { name, email, topic: form.get("topic") });
  return { ok: true as const, errors: {} as Record<string, string> };
}

const field = "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-urbn focus:ring-2 focus:ring-urbn/20";

export default function Contact() {
  const result = useActionData<typeof action>();
  const busy = useNavigation().state === "submitting";
  const err = result?.errors ?? {};
  return (
    <>
      <PageSky />
    <section className="container-x grid gap-16 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <WordsReveal text="Let's talk." className="text-6xl sm:text-8xl" />
        <p className="lede mt-6 max-w-md">
          Need help with Urbn, a property record or a partnership enquiry? Send us a message.
        </p>
        <ul className="mt-10 space-y-5">
          <li className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-urbn text-white"><Mail className="size-5" /></span>
            <a href={`mailto:${SITE.email}`} className="text-lg hover:text-urbn">{SITE.email}</a>
          </li>
          <li className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-urbn text-white"><MapPin className="size-5" /></span>
            <span className="text-lg">Based in Ibadan, Oyo State, Nigeria</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-urbn text-white"><MessageCircle className="size-5" /></span>
            <SocialLinks className="text-ink [&_a:hover]:bg-mist [&_a:hover]:text-urbn" />
          </li>
        </ul>
      </div>
      <Reveal>
        {result?.ok ? (
          <div className="flex h-full flex-col items-center justify-center rounded-card bg-mist p-10 text-center" role="status">
            <span className="grid size-14 place-items-center rounded-full bg-success text-white"><Check className="size-7" /></span>
            <h2 className="mt-5 text-3xl">Message Sent</h2>
            <p className="mt-2 text-neutral-600">Thanks for contacting Urbn. Your message has been received.</p>
          </div>
        ) : (
          <Form method="post" className="rounded-card bg-mist p-6 sm:p-10" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Full name
                <input name="name" autoComplete="name" className={field} aria-invalid={!!err.name} />
                {err.name && <span className="mt-1 block text-error">{err.name}</span>}
              </label>
              <label className="block text-sm font-medium">
                Email address
                <input name="email" type="email" autoComplete="email" className={field} aria-invalid={!!err.email} />
                {err.email && <span className="mt-1 block text-error">{err.email}</span>}
              </label>
            </div>
            <label className="mt-5 block text-sm font-medium">
              What is your enquiry about?
              <select name="topic" className={field} defaultValue="renter">
                <option value="renter">Finding a property</option>
                <option value="owner">Managing a property</option>
                <option value="agent">Agent support</option>
                <option value="partner">Partnership or investment</option>
                <option value="press">Press</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-medium">
              Message
              <textarea name="message" rows={5} className={field} aria-invalid={!!err.message} />
              {err.message && <span className="mt-1 block text-error">{err.message}</span>}
            </label>
            <Button type="submit" variant="dark" size="lg" arrow className="mt-6 w-full sm:w-auto" disabled={busy}>
              {busy ? "Sending…" : "Send Message"}
            </Button>
          </Form>
        )}
      </Reveal>
    </section>
    </>
  );
}
