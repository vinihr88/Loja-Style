import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constantes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/conta", "/carrinho", "/checkout", "/pedido", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
