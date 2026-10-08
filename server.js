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

// App link verification files, so https://www.urbn.ng/property/dpi/... and
// /listing/... open the Urbn app when it's installed. Apple and Google fetch these
// directly: JSON content type, no auth and no redirects (so they're answered
// before the trailing-slash redirect below). The IDs come from the environment,
// so going live is a config change:
//   APPLE_TEAM_ID         Apple Developer Team ID
//   ANDROID_CERT_SHA256   release signing certificate fingerprint(s), comma-separated
//                         (include both the upload and Play App Signing certificates)
const APP_LINK_PATHS = ["/listing/*", "/property/dpi/*"];
const appleAppSiteAssociation = JSON.stringify({
  applinks: { apps: [], details: [{ appID: `${process.env.APPLE_TEAM_ID || "<TEAM_ID>"}.com.urbn`, paths: APP_LINK_PATHS }] },
});
const assetLinks = JSON.stringify([
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.urbn",
      sha256_cert_fingerprints: (process.env.ANDROID_CERT_SHA256 || "<RELEASE_CERT_SHA256>").split(",").map((s) => s.trim()).filter(Boolean),
    },
  },
]);
const sendAppLinkFile = (body) => (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(Buffer.from(body)); // Buffer: no "; charset" suffix on the content type
};
for (const p of ["/.well-known/apple-app-site-association", "/apple-app-site-association"]) app.get([p, `${p}/`], sendAppLinkFile(appleAppSiteAssociation));
app.get(["/.well-known/assetlinks.json", "/.well-known/assetlinks.json/"], sendAppLinkFile(assetLinks));

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
