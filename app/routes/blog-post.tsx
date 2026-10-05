import { ChevronLeft } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { data, Link } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { EASE, Reveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE, absoluteUrl } from "~/lib/site";
import { STORIES, coverFit, getStory, type StoryBlock } from "~/lib/stories";
import type { Route } from "./+types/blog-post";

export function loader({ params }: Route.LoaderArgs) {
  const story = getStory(params.slug);
  if (!story) throw data("Not found", { status: 404 });
  return { story, more: STORIES.filter((s) => s.slug !== story.slug).slice(0, 4) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Not found | Urbn" }];
  const s = loaderData.story;
  return seo({
    title: s.title,
    description: s.excerpt,
    path: `/blog/${s.slug}`,
    image: s.image,
    imageAlt: s.imageAlt,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: s.title,
        description: s.excerpt,
        image: absoluteUrl(s.image),
        datePublished: s.date,
        dateModified: s.date,
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        publisher: { "@id": `${SITE.url}/#organization` },
        mainEntityOfPage: absoluteUrl(`/blog/${s.slug}`),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: s.title, path: `/blog/${s.slug}` },
      ]),
    ],
  });
};

// Inline links in imported posts get the site's link style.
const prose = "[&_a]:font-medium [&_a]:text-urbn [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-mist [&_code]:px-1 [&_code]:text-[0.9em]";

function Block({ block: b }: { block: StoryBlock }) {
  switch (b.type) {
    case "h":
      return <h2 className="mt-10 mb-1 text-2xl sm:text-3xl">{b.text}</h2>;
    case "p":
      return <p className={prose} dangerouslySetInnerHTML={{ __html: b.html }} />;
    case "quote":
      return (
        <blockquote className={`border-l-4 border-urbn pl-5 font-display text-xl leading-snug text-ink sm:text-2xl ${prose}`}>
          <span dangerouslySetInnerHTML={{ __html: b.html }} />
        </blockquote>
      );
    case "list": {
      const List = b.ordered ? "ol" : "ul";
      return (
        <List className={`space-y-2 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} ${prose}`}>
          {b.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </List>
      );
    }
    case "img":
      return (
        <figure className="-mx-4 my-10 sm:mx-0">
          <img src={b.src} alt={b.alt} loading="lazy" className="w-full sm:rounded-card" />
          {b.caption && <figcaption className="mt-3 px-4 text-center text-sm text-neutral-500 sm:px-0">{b.caption}</figcaption>}
        </figure>
      );
    case "embed":
      return (
        <a href={b.url} target="_blank" rel="noopener" className="block rounded-2xl bg-mist p-5 text-[15px] font-semibold text-ink hover:bg-fog">
          {b.title ?? b.url} ↗
        </a>
      );
  }
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { story: s, more } = loaderData;
  // Imported posts without a subtitle use their opening paragraph as the excerpt; don't show it twice.
  const first = s.body.find((b) => b.type === "p");
  const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ");
  const showLede = !(first?.type === "p" && plain(first.html).startsWith(plain(s.excerpt.replace(/…$/, "")).slice(0, 60)));
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-urbn" style={{ scaleX: progress }} />
      <article className="container-x pt-10 pb-24">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
            <ChevronLeft className="size-4" /> All stories
          </Link>
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="mt-8 text-sm text-urbn">
              {s.category} ·{" "}
              <time dateTime={s.date}>{new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>{" "}
              · {s.readMins} min read
            </p>
            <h1 className="mt-3 text-4xl leading-[1.05] sm:text-6xl">{s.title}</h1>
            {showLede && <p className="lede mt-5">{s.excerpt}</p>}
          </motion.header>
        </div>
        <motion.img
          src={s.image}
          alt={s.imageAlt}
          className={s.imageFit === "contain" ? "mx-auto mt-10 w-full max-w-lg rounded-card" : "mx-auto mt-10 aspect-[1.6] w-full max-w-4xl rounded-card object-cover"}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        />
        <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[17px] leading-[1.8] text-neutral-800">
          {s.body.map((b, i) => (
            <Reveal key={i}>
              <Block block={b} />
            </Reveal>
          ))}
          {s.sourceUrl && (
            <p className="border-t border-neutral-200 pt-6 text-sm text-neutral-500">
              Originally published on{" "}
              <a href={s.sourceUrl} target="_blank" rel="noopener" className="font-semibold text-urbn hover:underline">
                Medium
              </a>
              .
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-6">
            <ButtonLink to="/verify" variant="dark">Check a DPI</ButtonLink>
            <ButtonLink to="/listings" variant="outline">Browse Listings</ButtonLink>
          </div>
        </div>
      </article>
      <section className="bg-mist py-20">
        <div className="container-x">
          <h2 className="text-3xl">More Stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((m) => (
              <Link key={m.slug} to={`/blog/${m.slug}`} className="group flex gap-5 rounded-card bg-white p-4">
                <img src={m.image} alt="" loading="lazy" className={`aspect-square w-28 shrink-0 rounded-xl ${coverFit(m)} sm:w-36`} />
                <div>
                  <p className="text-sm text-urbn">{m.category}</p>
                  <h3 className="mt-1 font-display text-xl group-hover:text-urbn">{m.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{m.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="h-20" />
      <CtaBanner />
    </>
  );
}
