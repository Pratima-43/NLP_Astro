import type { NextConfig } from "next";

// Addresses used by earlier versions of the app keep working.
const MOVED: Array<[string, string]> = [
  ["/dashboard", "/home"],
  ["/dashboard/numerology", "/numbers"],
  ["/dashboard/astrology", "/stars"],
  ["/dashboard/palmistry", "/hand"],
  ["/dashboard/combined-report", "/story"],
  ["/dashboard/chatbot", "/ask"],
  ["/dashboard/settings", "/me"],
  ["/onboarding", "/setup"],
  ["/pricing", "/premium"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Signed-in pages restore the session in the browser, so only the public pages have a
    // server-rendered instant UI. Validate only segments that opt in with `export const instant`.
    instantInsights: { validationLevel: "manual-warning" },
  },
  redirects() {
    return MOVED.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
