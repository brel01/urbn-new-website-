// Production server: static assets + pre-rendered HTML (no trailing-slash
// redirects) with SSR for everything else (search queries, DPI lookups, APIs).
import compression from "compression";
import express from "express";
import { createRequestHandler } from "@react-router/express";
import fs from "node:fs";
import path from "node:path";

const CLIENT = path.resolve("build/client");
const app = express();
app.disable("x-powered-by");
app.use(compression());

// Fingerprinted build assets: cache forever.
app.use("/assets", express.static(path.join(CLIENT, "assets"), { immutable: true, maxAge: "1y", index: false, redirect: false }));

// Pre-rendered pages for clean GET requests ("/dpi" → build/client/dpi/index.html).
app.use((req, res, next) => {
  if (req.method !== "GET" || Object.keys(req.query).length) return next();
  const clean = decodeURIComponent(req.path).replace(/\/+$/, "") || "/";
  if (clean !== req.path && req.path !== "/") return res.redirect(301, clean + (req.url.slice(req.path.length) || ""));
  const file = path.join(CLIENT, clean, "index.html");
  if (!file.startsWith(CLIENT)) return next();
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return next();
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
    res.sendFile(file);
  });
});

// Other public files (images, fonts, icons, sitemap.xml, robots.txt, .data).
app.use(express.static(CLIENT, { maxAge: "1h", index: false, redirect: false }));

app.all(
  "*splat",
  createRequestHandler({
    build: () => import("./build/server/index.js"),
  }),
);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Urbn website on http://localhost:${port}`));
