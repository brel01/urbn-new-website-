import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Public origin used for canonical URLs and social preview images.
// SITE_URL wins; on Vercel it falls back to the project's production domain.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://urbn.ng");

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  define: {
    "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl.replace(/\/$/, "")),
  },
  resolve: {
    tsconfigPaths: true,
  },
});
