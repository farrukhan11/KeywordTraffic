export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://coupon-tech.com/sitemap.xml",
    host: "https://coupon-tech.com",
  };
}
