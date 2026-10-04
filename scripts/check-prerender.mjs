// Fails the build if any pre-rendered page is a redirect stub or missing its <h1>.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("build/client");
const bad = [];
let pages = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html") {
      pages++;
      const html = fs.readFileSync(p, "utf8");
      if (html.includes('http-equiv="refresh"')) bad.push(`${p}: redirect stub`);
      else if (!/<h1[\s>]/.test(html)) bad.push(`${p}: no <h1>`);
    }
  }
};
walk(root);
if (bad.length) {
  console.error(`Prerender check failed:\n  ${bad.join("\n  ")}`);
  process.exit(1);
}
console.log(`Prerender check: ${pages} pages OK`);
