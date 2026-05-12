import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "./lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = getConfiguredSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/test",
        "/account/",
        "/auth/",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
