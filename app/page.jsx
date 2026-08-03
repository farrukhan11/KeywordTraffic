import Link from "next/link";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

const workflow = [
  {
    title: "Enter or upload keywords",
    description: "Search a few keywords instantly or upload a larger CSV or Excel list for bulk research.",
  },
  {
    title: "Choose your market",
    description: "Select the country and language you want to research so every search matches your target audience.",
  },
  {
    title: "Compare keyword metrics",
    description: "Review monthly searches, competition, competition index, and bid ranges to identify useful keywords.",
  },
];

const dataUse = [
  {
    title: "Metrics we retrieve",
    description:
      "After you connect Google Ads, we retrieve historical metrics only for the keywords you choose to search.",
  },
  {
    title: "How we use the data",
    description:
      "We display average monthly searches, competition, competition index, and bid ranges inside your keyword research workspace.",
  },
  {
    title: "Your control",
    description:
      "Connecting Google Ads is optional. You can revoke access through your Google Account, and we do not sell or redistribute Google user data.",
  },
];

const demoKeywords = [
  ["running shoes", "12,100"],
  ["sportswear deals", "8,100"],
  ["fashion discount codes", "5,400"],
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <SiteHeader />

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            Keyword research by Coupon Tech
          </span>
          <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
            Coupon Tech – Bulk Google Ads Keyword Research
          </h1>
          <p className="mt-4 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">
            Search keywords, compare demand, and plan smarter campaigns.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Search individual keywords or upload lists in bulk. Choose a country and language, then review historical monthly searches, competition, competition index, and top-of-page bid ranges in one workspace.
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
            Historical keyword metrics require an optional Google Ads connection. You choose whether to connect through Google OAuth and can revoke access at any time. Learn more in our{" "}
            <Link className="font-semibold text-indigo-300 underline underline-offset-4 hover:text-indigo-200" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-300">Keyword search preview</p>
              <p className="mt-1 text-sm text-slate-400">Example monthly search volumes — not live results</p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Historical keyword data</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">The search insights you need, without the noise</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Coupon Tech helps authorized team members turn keyword lists into useful research metrics for SEO research and advertising campaign planning. It does not generate website traffic or create, edit, or launch advertising campaigns.
            </p>
            <p className="mt-5 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-5 py-4 text-base font-semibold leading-7 text-indigo-100">
              Google Ads connection is used only to retrieve historical metrics for the keywords you submit.
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
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">From keyword list to search insights in three steps</h2>
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
          <h2 className="text-2xl font-bold">Organize research by project</h2>
          <p className="mt-4 leading-8 text-slate-300">
            Keep keyword lists grouped by store, website, market, campaign, or client. Duplicate keywords are removed so your research stays clean and easy to review.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-bold">Research metrics for better decisions</h2>
          <p className="mt-4 leading-8 text-slate-300">
            Compare search demand, advertiser competition, and bid ranges to prioritize keyword opportunities for content, SEO research, and paid campaign planning.
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
