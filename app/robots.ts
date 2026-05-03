import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/settings", "/onboarding", "/admin", "/api/"],
      },
    ],
    sitemap: "https://staydue.app/sitemap.xml",
  };
}
