#!/usr/bin/env node
// Imports Urbn's Medium posts into the site as blog stories.
//
//   npm run import:medium                     # fetch https://medium.com/feed/@urbn_hq
//   npm run import:medium -- ./feed.xml       # or a saved copy of the feed
//   npm run import:medium -- https://medium.com/feed/@someone
//
// Writes app/lib/medium-stories.generated.ts and downloads every image into
// public/images/blog/<slug>/ (converted to WebP when Python + Pillow are available),
// so the site never hot-links Medium. Medium's RSS feed carries the 10 most
// recent posts; re-running replaces the previous import.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_TS = join(ROOT, "app/lib/medium-stories.generated.ts");
const ALT_TEXT = join(ROOT, "scripts/medium-alt-text.json");
const IMG_DIR = join(ROOT, "public/images/blog");
const DEFAULT_FEED = "https://medium.com/feed/@urbn_hq";
const FALLBACK_COVER = "/og/urbn-share.png";

const source = process.argv[2] ?? DEFAULT_FEED;

// --- fetching (curl honours the environment's proxy settings) ---------------

function download(url, dest) {
  const args = ["-sSfL", "--retry", "3", "-A", "Mozilla/5.0 (UrbnImporter)", url];
  if (dest) args.push("-o", dest);
  return execFileSync("curl", args, { maxBuffer: 64 * 1024 * 1024, encoding: dest ? undefined : "utf8" });
}

const readFeed = (src) => (/^https?:\/\//.test(src) ? download(src) : readFileSync(src, "utf8"));

// --- tiny XML/HTML helpers ---------------------------------------------------

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const cdata = (s = "") => s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
const tag = (xml, name) => cdata(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "");
const tags = (xml, name) => [...xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "g"))].map((m) => cdata(m[1]));
const attr = (html, name) => html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const text = (html) => decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

/** Keep only inline formatting; everything else is unwrapped. */
function inline(html) {
  return html
    .replace(/<(\/?)b>/gi, "<$1strong>")
    .replace(/<(\/?)i>/gi, "<$1em>")
    .replace(/<a\b[^>]*>/gi, (a) => {
      const href = decode(attr(a, "href") ?? "");
      return /^(https?:|mailto:)/.test(href) ? `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener">` : "<a>";
    })
    .replace(/<(?!\/?(?:a|strong|em|code)\b|br\s*\/?>)[^>]+>/gi, "")
    .replace(/<a>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// --- conversion --------------------------------------------------------------

const slugFromLink = (link) =>
  new URL(link).pathname
    .split("/")
    .filter(Boolean)
    .pop()
    .replace(/-[0-9a-f]{8,12}$/, "")
    .toLowerCase();

const titleCase = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Medium wraps embeds in an embedly iframe; point at the original (e.g. YouTube) instead. */
function embedUrl(src) {
  const inner = new URL(src, "https://medium.com").searchParams.get("src");
  const url = inner ?? src;
  const yt = url.match(/youtube\.com\/embed\/([\w-]+)/);
  return yt ? `https://www.youtube.com/watch?v=${yt[1]}` : url;
}

function toBlocks(html) {
  html = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  const blocks = [];
  const re = /<(h[1-6]|p|figure|blockquote|ul|ol|pre)\b[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>|<img\b[^>]*>/gi;
  for (const m of html.matchAll(re)) {
    const [whole, el = "", inner = ""] = m;
    const name = el.toLowerCase();
    if (/^<img/i.test(whole)) {
      const src = attr(whole, "src");
      // Medium appends a 1×1 tracking pixel; skip it and other stat beacons.
      if (src && !/\/_\/stat|width="1"/.test(whole)) blocks.push({ type: "img", src, alt: decode(attr(whole, "alt") ?? "") });
    } else if (/^h[1-6]$/.test(name)) {
      const t = text(inner);
      if (t) blocks.push({ type: "h", text: t, level: Number(name[1]) });
    } else if (name === "p") {
      const h = inline(inner);
      if (text(h)) blocks.push({ type: "p", html: h });
    } else if (name === "blockquote") {
      const h = inline(inner);
      if (text(h)) blocks.push({ type: "quote", html: h });
    } else if (name === "ul" || name === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => inline(li[1])).filter((h) => text(h));
      if (items.length) blocks.push({ type: "list", ordered: name === "ol", items });
    } else if (name === "pre") {
      blocks.push({ type: "p", html: `<code>${inline(inner)}</code>` });
    } else if (name === "figure") {
      const img = inner.match(/<img\b[^>]*>/i)?.[0];
      const iframe = inner.match(/<iframe\b[^>]*>/i)?.[0];
      const caption = text(inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ?? "");
      if (img && attr(img, "src")) blocks.push({ type: "img", src: attr(img, "src"), alt: decode(attr(img, "alt") ?? "") || caption, caption: caption || undefined });
      else if (iframe && attr(iframe, "src")) {
        const url = embedUrl(decode(attr(iframe, "src")));
        blocks.push({ type: "embed", url, title: caption || (/youtube\.com/.test(url) ? "Watch the video on YouTube" : undefined) });
      }
    }
  }
  return blocks;
}

const isDomain = (s = "") => /^[\w-]+(\.[\w-]+)+$/.test(s.trim());
const sameTitle = (heading, title) => {
  const h = heading.toLowerCase().replace(/\s+[—|-]\s+urbn$/, "").trim();
  return h === title.toLowerCase();
};

/** Tidy Medium writing habits into proper structure. */
function normalise(blocks, title) {
  const out = [];
  for (const b of blocks) {
    if (b.type === "p") {
      const plain = text(b.html);
      // Hashtag footers (#UrbnNigeria #HousingNigeria …) aren't article content.
      if (/^(#\w+\s*)+$/.test(plain)) continue;
      // A paragraph that is only bold text is a section heading.
      if (/^<strong>[^<]+<\/strong>$/.test(b.html) && plain.length < 90) {
        out.push({ type: "h", text: plain.replace(/:$/, ""), level: 3 });
        continue;
      }
      // "· item" paragraphs typed as bullets become one list.
      const bullet = b.html.match(/^\s*[·•▪◦-]\s+([\s\S]*)$/);
      if (bullet) {
        const prev = out[out.length - 1];
        if (prev?.type === "list" && !prev.ordered && prev.typed) prev.items.push(bullet[1]);
        else out.push({ type: "list", ordered: false, items: [bullet[1]], typed: true });
        continue;
      }
    }
    if (b.type === "img") {
      // "urbn.ng" style credits are neither a description nor a useful caption.
      if (isDomain(b.caption)) b.caption = undefined;
      if (!b.alt || isDomain(b.alt)) {
        const heading = [...out].reverse().find((x) => x.type === "h");
        b.alt = `Illustration: ${heading ? heading.text : title}`;
      }
    }
    out.push(b);
  }
  return out.map(({ typed, ...b }) => b);
}

const excerptOf = (s, max = 160) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
};

function convertItem(item) {
  const title = text(tag(item, "title"));
  const link = tag(item, "link").split("?")[0];
  const slug = slugFromLink(link);
  const html = tag(item, "content:encoded") || tag(item, "description");
  const categories = tags(item, "category").map(text);
  let blocks = toBlocks(html);

  // Medium repeats the title as the first heading, often followed by the subtitle.
  if (blocks[0]?.type === "h" && sameTitle(blocks[0].text, title)) blocks.shift();
  let subtitle;
  const firstImgIdx = blocks.findIndex((b) => b.type === "img");
  if (blocks[0]?.type === "h" && blocks[0].level >= 4 && (firstImgIdx === -1 || firstImgIdx > 0)) subtitle = blocks.shift().text;

  // The first image becomes the cover; drop it from the body when it opens the post.
  const cover = blocks.find((b) => b.type === "img");
  if (cover && blocks.indexOf(cover) <= 1 && blocks.slice(0, blocks.indexOf(cover)).every((b) => b.type !== "p")) blocks.splice(blocks.indexOf(cover), 1);

  blocks = normalise(blocks, title).map(({ level, ...b }) => b);
  const words = blocks.map((b) => (b.type === "p" || b.type === "quote" ? text(b.html) : b.type === "list" ? b.items.map(text).join(" ") : "")).join(" ").split(/\s+/).filter(Boolean).length;
  const firstPara = blocks.find((b) => b.type === "p");

  return {
    slug,
    title,
    excerpt: excerptOf(subtitle ?? (firstPara ? text(firstPara.html) : title)),
    image: cover?.src ?? FALLBACK_COVER,
    imageAlt: cover?.alt && !isDomain(cover.alt) ? cover.alt : title,
    category: categories[0] ? titleCase(categories[0]) : "Stories",
    date: new Date(tag(item, "pubDate") || tag(item, "atom:updated")).toISOString().slice(0, 10),
    readMins: Math.max(1, Math.round(words / 200)),
    body: blocks,
    sourceUrl: link,
  };
}

// --- images ------------------------------------------------------------------

const hasPillow = (() => {
  try {
    execFileSync("python3", ["-c", "import PIL"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

function localiseImage(url, slug, n) {
  const dir = join(IMG_DIR, slug);
  mkdirSync(dir, { recursive: true });
  const ext = (url.split("?")[0].match(/\.(jpe?g|png|gif|webp|avif)$/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
  const raw = join(dir, `${n}.${ext}`);
  download(url, raw);
  if (hasPillow && ext !== "gif" && ext !== "webp") {
    const webp = join(dir, `${n}.webp`);
    const size = execFileSync("python3", [
      "-c",
      "import sys;from PIL import Image;im=Image.open(sys.argv[1]);im=im.convert('RGBA' if im.mode in ('RGBA','LA','P') else 'RGB');im.thumbnail((1600,1600));im.save(sys.argv[2],'WEBP',quality=82);print(im.size[0],im.size[1])",
      raw,
      webp,
    ], { encoding: "utf8" }).trim().split(" ").map(Number);
    rmSync(raw);
    return { src: `/images/blog/${slug}/${n}.webp`, width: size[0], height: size[1] };
  }
  return { src: `/images/blog/${slug}/${n}.${ext}` };
}

// --- run ---------------------------------------------------------------------

const xml = readFeed(source);
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
if (items.length === 0) {
  console.error(`No posts found in ${source}. Is it a Medium RSS feed?`);
  process.exit(1);
}

const stories = items.map(convertItem);
const altText = existsSync(ALT_TEXT) ? JSON.parse(readFileSync(ALT_TEXT, "utf8")) : {};
if (existsSync(IMG_DIR)) rmSync(IMG_DIR, { recursive: true });
for (const s of stories) {
  let n = 0;
  const seen = new Map();
  const local = (url) => {
    if (!/^https?:\/\//.test(url)) return { src: url };
    if (!seen.has(url)) seen.set(url, { ...localiseImage(url, s.slug, n), key: `${s.slug}/${n++}` });
    return seen.get(url);
  };
  const cover = local(s.image);
  s.image = cover.src;
  if (altText[cover.key]) s.imageAlt = altText[cover.key];
  // Portrait covers are posters with the title baked in: show them whole, never cropped.
  if (cover.height && cover.height > cover.width * 0.9) s.imageFit = "contain";
  for (const b of s.body) {
    if (b.type !== "img") continue;
    const img = local(b.src);
    b.src = img.src;
    if (altText[img.key]) b.alt = altText[img.key];
  }
  console.log(`✓ ${s.title}  (${s.date}, ${s.body.length} blocks, ${n} images)`);
}
stories.sort((a, b) => b.date.localeCompare(a.date));

writeFileSync(
  OUT_TS,
  `// Generated by scripts/import-medium.mjs from ${source.startsWith("http") ? source : "a saved Medium feed"}.\n` +
    `// Do not edit by hand; re-run \`npm run import:medium\`.\n` +
    `import type { Story } from "./stories";\n\n` +
    `export const MEDIUM_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};\n`,
);
console.log(`\nImported ${stories.length} posts → app/lib/medium-stories.generated.ts`);
