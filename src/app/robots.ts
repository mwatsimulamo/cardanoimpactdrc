import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/fr/equipes", "/en/equipes"],
      disallow: ["/fr/admin", "/en/admin", "/fr/equipe", "/en/equipe", "/fr/desinscription", "/en/desinscription"],
    },
    sitemap: "https://www.cardanoimpactdrc.org/sitemap.xml",
  };
}
