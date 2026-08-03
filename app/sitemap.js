const publicPages = ["", "/privacy", "/terms", "/contact"];

export default function sitemap() {
  return publicPages.map((path, index) => ({
    url: `https://coupon-tech.com${path}`,
    lastModified: new Date("2026-08-03"),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.6,
  }));
}
