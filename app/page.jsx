import Link from "next/link";
import SiteFooter from "./components/SiteFooter";

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

const demoKeywords = [
  ["running shoes discount", "12,100"],
  ["sportswear voucher", "8,100"],
  ["fashion promo code", "5,400"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/">
          <img src="/Coupon-tech-black.jpg" alt="Coupon Tech Logo" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white sm:block" href="/privacy">
            Privacy
          </Link>
          <Link className="rounded-lg px-4 py-2 text-slate-300 hover:text-white" href="/login">
            Login
          </Link>
          <Link className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400" href="/register">
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            Internal keyword research and campaign planning
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Process bulk keyword lists without repetitive Keyword Planner work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Keyword Traffic helps authorized team members create projects, upload or paste large keyword lists, remove duplicates, and prepare Google Ads historical metrics for research and campaign planning.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400" href="/register">
              Create account
            </Link>
            <Link className="rounded-xl border border-slate-700 px-6 py-3 font-bold hover:border-slate-500" href="/login">
              Open dashboard
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Google Ads access is optional and only used after an authorized user connects an eligible account.
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

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
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
