import { readFileSync } from "node:fs";

// Redirects added in the dashboard.
const saved = JSON.parse(readFileSync(new URL("./data/redirects.json", import.meta.url), "utf8"));
// The admin page is included when PL_ADMIN=1 (`npm run admin` locally) and in every Vercel production build,
// because Vercel does not pass the PL_ADMIN variable to the build. The dashboard still needs a login, and
// app/admin/api/route.ts answers 404 unless PL_ADMIN=1 is set when the site runs.
const admin = process.env.PL_ADMIN === "1" || process.env.VERCEL_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js", ...(admin ? ["admin.tsx", "admin.ts"] : [])],
  // Every page URL ends with "/" (e.g. /about-us/). Links without it redirect (308) to the "/" version.
  // Files such as /robots.txt, /llms.txt and /sitemap_index.xml are served without a slash.
  trailingSlash: true,
  // MCP server (lib/packlegacy-mcp): the artwork checker loads sharp by path inside a worker thread,
  // so make sure sharp and its native binaries ship with the routes that use it.
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/mcp": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*", "./node_modules/detect-libc/**/*", "./node_modules/semver/**/*"],
    "/api/packaging-tools": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*", "./node_modules/detect-libc/**/*", "./node_modules/semver/**/*"],
  },
  // The site lives at https://packlegacy.com (lib/site.ts). Send www to it in Vercel → Settings → Domains,
  // not here: a host redirect here loops forever if Vercel's domain settings redirect the other way.
  async redirects() {
    return [
      ...saved,
      // Packaging Inserts is a category page now; its packlegacy.com address was under /product/.
      { source: "/product/packaging-inserts/", destination: "/packaging-inserts/", permanent: true },
      // The sitemap opens only at /sitemap_index.xml (as on the old WordPress/Yoast site).
      { source: "/sitemap.xml", destination: "/sitemap_index.xml", statusCode: 301 },
    ];
  },
  // Until the live site sets ALLOW_INDEXING=true (see lib/site.ts), tell search engines not to index anything.
  async headers() {
    if (process.env.ALLOW_INDEXING === "true") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
