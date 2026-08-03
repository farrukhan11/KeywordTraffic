import Link from "next/link";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

const workflow = [
  {
    title: "Create a project",
    description: "Organize keyword research by store, market, campaign, or client project.",
  },
  {
    title: "Upload keywords in bulk",
    description: "Paste or upload keyword lists, normalize entries, and remove duplicates before processing.",
  },
  {
    title: "Review planning metrics",
    description: "Use authorized Google Ads historical metrics for campaign research, comparison, and export.",
  },
];

const dataUse = [
  {
    title: "What we access",
    description:
      "After you choose to connect Google Ads, Keyword Traffic accesses the authorized account identifiers and keyword-planning historical metrics needed for your request.",
  },
  {
    title: "Why we access it",
    description:
      "The data is used to display search volume, competition, and bid-range insights inside your private keyword research projects.",
  },
  {
    title: "Your control",
    description:
      "Connecting Google Ads is optional. You can revoke access through your Google Account, and we do not sell or redistribute Google user data.",
  },
];

const demoKeywords = [
  ["running shoes discount", "12,100"],
  ["sportswear voucher", "8,100"],
  ["fashion promo code", "5,400"],
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <SiteHeader />

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            Keyword Traffic by Coupon Tech
          </span>
          <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
            Keyword Traffic
          </h1>
          <p className="mt-4 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">
            Bulk keyword research and advertising campaign planning, in one workspace.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Create research projects, upload or paste keyword lists, remove duplicates, and review authorized Google Ads historical metrics such as average monthly searches, competition, and bid ranges.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400" href="/register">
              Create account
            </Link>
            <Link className="rounded-xl border border-slate-700 px-6 py-3 font-bold hover:border-slate-500" href="/login">
              Open dashboard
            </Link>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400">
            Google Ads access is optional and begins only after you authorize an eligible account through Google OAuth. Learn how we use and protect data in our{" "}
            <Link className="font-semibold text-indigo-300 underline underline-offset-4 hover:text-indigo-200" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-300">Illustrative demo data</p>
              <p className="mt-1 text-sm text-slate-400">Example layout only — not live Google Ads results</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Sample</span>
          </div>
          <div className="mt-5 space-y-3">
            {demoKeywords.map(([keyword, searches]) => (
              <div key={keyword} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <span className="text-sm sm:text-base">{keyword}</span>
                <span className="whitespace-nowrap text-sm font-semibold text-emerald-400">{searches} searches</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Google data and your privacy</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Clear, limited, and user-authorized access</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Keyword Traffic requests Google data only to provide the keyword-planning features described on this page. It does not generate artificial traffic or place advertising campaigns on your behalf.
            </p>
            <p className="mt-5 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-5 py-4 text-base font-semibold leading-7 text-indigo-100">
              Users securely log in via their Google Accounts to grant access exclusively for fetching Google Ads historical keyword metrics.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dataUse.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-xl bg-indigo-500 px-5 py-3 font-bold hover:bg-indigo-400" href="/privacy">
              Read our Privacy Policy
            </Link>
            <Link className="rounded-xl border border-slate-700 px-5 py-3 font-bold hover:border-slate-500" href="/contact">
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">How it works</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">A clear workflow for bulk keyword planning</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <div className="text-sm font-bold text-indigo-300">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Designed for authorized internal users</h2>
          <p className="mt-4 leading-8 text-slate-300">
            Access is account-based. Users manage only the projects and Google Ads accounts they are authorized to use. The platform is intended for campaign research and planning, not for selling or redistributing Google user data.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Transparent data handling</h2>
          <p className="mt-4 leading-8 text-slate-300">
            Our Privacy Policy explains how account, keyword, OAuth, and Google Ads data are accessed, used, stored, retained, and deleted.
          </p>
          <Link className="mt-5 inline-block font-semibold text-indigo-300 hover:text-indigo-200" href="/privacy">
            Read the Privacy Policy →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
