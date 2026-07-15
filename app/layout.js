import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://coupon-tech.com"),
  title: {
    default: "Keyword Traffic – Bulk Google Ads Keyword Research",
    template: "%s | Keyword Traffic",
  },
  description:
    "Internal keyword research and campaign-planning platform for processing bulk keyword lists and Google Ads historical metrics.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Keyword Traffic – Bulk Google Ads Keyword Research",
    description:
      "Organize bulk keyword lists and prepare authorized Google Ads historical metrics for campaign research and planning.",
    url: "https://coupon-tech.com",
    siteName: "Keyword Traffic",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
