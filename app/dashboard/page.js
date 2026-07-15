import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import GoogleAdsConnection from "@/models/GoogleAdsConnection";
import SignOutButton from "@/components/SignOutButton";
import QuickKeywordSearch from "@/components/QuickKeywordSearch";

const statusStyles = {
  READY: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  PROCESSING: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  FAILED: "border-red-400/20 bg-red-400/10 text-red-300",
  DRAFT: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

export default async function Dashboard({ searchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const [projects, googleAdsConnection] = await Promise.all([
    Project.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    GoogleAdsConnection.findOne({ userId: session.user.id }).lean(),
  ]);
  const params = await searchParams;
  const googleAdsStatus = params?.googleAds;
  const googleAdsReason = params?.reason ? decodeURIComponent(String(params.reason)) : "";
  const keywordCount = projects.reduce((total, project) => total + (project.keywords?.length || 0), 0);
  const readyCount = projects.filter((project) => project.status === "READY").length;
  const completedCount = projects.filter((project) => project.status === "COMPLETED").length;

  const stats = [
    { label: "Stores / projects", value: projects.length, helper: "Total imported stores" },
    { label: "Unique keywords", value: keywordCount, helper: "Ready for traffic checks" },
    { label: "Ready projects", value: readyCount, helper: "Waiting for API processing" },
    { label: "Completed", value: completedCount, helper: "Traffic data collected" },
  ];

  return (
    <main className="min-h-screen bg-[#060a12] text-white">
      <header className="border-b border-white/10 bg-[#080d17]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard">
            <img src="/Coupon-tech.png" alt="Coupon Tech Logo" className="h-8 w-auto" />
          </Link>
          <SignOutButton />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {googleAdsStatus === "connected" && <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-200">Google Ads successfully connected.</div>}
        {(googleAdsStatus === "error" || googleAdsStatus === "invalid-state") && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
            <div className="font-bold">Google Ads connection failed.</div>
            <div className="mt-1 text-sm">{googleAdsReason || (googleAdsStatus === "invalid-state" ? "OAuth state validation failed. Start the connection again from this dashboard." : "Check the OAuth redirect URI and environment values, then reconnect.")}</div>
          </div>
        )}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">Overview</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Keyword dashboard</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Upload store keywords in bulk, prepare traffic jobs and review Google Ads Keyword Planner metrics from one place.</p>
          </div>
          <Link href="/dashboard/projects/new" className="rounded-xl bg-cyan-400 px-5 py-3 text-center font-black text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300">Upload keywords</Link>
        </div>

        <QuickKeywordSearch />

        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-white/10 bg-[#0d1422] p-6 shadow-xl shadow-black/10"><div className="text-sm font-semibold text-slate-400">{stat.label}</div><div className="mt-3 text-4xl font-black">{stat.value.toLocaleString()}</div><div className="mt-3 text-xs text-slate-600">{stat.helper}</div></article>)}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0d1422] p-6 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">Recent projects</h2><p className="mt-1 text-sm text-slate-500">Stores imported manually or through CSV / Excel.</p></div><Link href="/dashboard/projects/new" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">Add more →</Link></div>
            {projects.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-[#080d17] p-12 text-center"><div className="text-lg font-bold">No keyword projects yet</div><p className="mt-2 text-sm text-slate-500">Download the template and upload your first CSV or Excel file.</p></div> : <div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><div className="hidden grid-cols-[1.3fr_0.8fr_0.55fr_0.45fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid"><span>Store</span><span>Market</span><span>Keywords</span><span>Status</span></div><div className="divide-y divide-white/10">{projects.map((project) => <div key={project._id.toString()} className="grid gap-3 px-5 py-5 hover:bg-white/[0.025] md:grid-cols-[1.3fr_0.8fr_0.55fr_0.45fr] md:items-center md:gap-4"><div><div className="font-bold text-white">{project.name}</div><div className="mt-1 text-xs text-slate-600">Created {new Date(project.createdAt).toLocaleDateString()}</div></div><div className="text-sm text-slate-400">{project.country}<br /><span className="text-xs text-slate-600">{project.language}</span></div><div className="text-sm font-bold text-slate-200">{project.keywords?.length || 0}</div><div><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[project.status] || statusStyles.DRAFT}`}>{project.status}</span></div></div>)}</div></div>}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/15 to-cyan-400/5 p-6"><p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">Import format</p><h2 className="mt-3 text-xl font-black">Use the ready template</h2><p className="mt-2 text-sm leading-6 text-slate-400">Columns: Store Name, Keyword, Country and Language. Multiple rows for the same store are grouped automatically.</p><a href="/api/templates/keywords" className="mt-5 inline-flex rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-black text-violet-200 hover:bg-violet-400/20">Download Excel template</a></section>

            <section className="rounded-3xl border border-white/10 bg-[#0d1422] p-6">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Google Ads API</p><span className={`rounded-full px-3 py-1 text-xs font-bold ${googleAdsConnection ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{googleAdsConnection ? "Connected" : "Not connected"}</span></div>
              <h2 className="mt-3 text-xl font-black">{googleAdsConnection ? "Account connected" : "Connect Google Ads"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Authorize the Google account that can access your manager and customer Ads accounts.</p>
              {googleAdsConnection?.googleEmail && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Connected as <strong>{googleAdsConnection.googleEmail}</strong></div>}
              <a href="/api/google-ads/connect" className="mt-5 block rounded-xl bg-cyan-400 px-4 py-3 text-center text-sm font-black text-slate-950 hover:bg-cyan-300">{googleAdsConnection ? "Reconnect Google Ads" : "Connect Google Ads"}</a>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
