import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import GoogleAdsConnection from "@/models/GoogleAdsConnection";
import SignOutButton from "@/components/SignOutButton";
import KeywordExplorer from "@/components/KeywordExplorer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main className="dashboard-ui min-h-screen bg-[#070b12] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-12">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">KT</div>
            <div><p className="text-sm font-bold text-white">Keyword Traffic</p><p className="text-[11px] text-slate-500">Research workspace</p></div>
          </Link>
          <div className="flex items-center gap-3"><Badge variant="secondary" className="hidden sm:inline-flex">Google Ads workspace</Badge><SignOutButton /></div>
        </div>
      </header>

      <section className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 2xl:px-12 lg:py-10">
        {googleAdsStatus === "connected" && <Alert className="mb-5"><AlertTitle>Google Ads connected</AlertTitle><AlertDescription>Your account is ready for keyword traffic checks.</AlertDescription></Alert>}
        {(googleAdsStatus === "error" || googleAdsStatus === "invalid-state") && <Alert variant="destructive" className="mb-5"><AlertTitle>Google Ads connection failed</AlertTitle><AlertDescription>{googleAdsReason || (googleAdsStatus === "invalid-state" ? "OAuth state validation failed. Start the connection again from this dashboard." : "Check the OAuth redirect URI and environment values, then reconnect.")}</AlertDescription></Alert>}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Overview</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Keyword dashboard</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Upload store keywords, prepare traffic jobs, and review Google Ads Keyword Planner metrics from one place.</p></div>
          <Link href="/dashboard/projects/new"><Button size="lg">Upload keywords <span aria-hidden>↗</span></Button></Link>
        </div>

        <KeywordExplorer />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <Card key={stat.label} className="bg-[#0b111c]"><CardHeader className="pb-2"><CardDescription>{stat.label}</CardDescription><CardTitle className="text-3xl text-white">{stat.value.toLocaleString()}</CardTitle></CardHeader><CardContent><p className="text-xs text-slate-500">{stat.helper}</p></CardContent></Card>)}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Recent projects</CardTitle><CardDescription>Stores imported manually or through CSV / Excel.</CardDescription></div><Link href="/dashboard/projects/new"><Button variant="ghost" size="sm">Add more <span aria-hidden>→</span></Button></Link></CardHeader><CardContent>
            {projects.length === 0 ? <div className="rounded-lg border border-dashed border-white/15 bg-black/10 p-12 text-center"><p className="font-semibold text-white">No keyword projects yet</p><p className="mt-2 text-sm text-slate-500">Download the template and upload your first CSV or Excel file.</p></div> : <div className="overflow-hidden rounded-lg border border-white/10"><div className="hidden grid-cols-[1.3fr_0.8fr_0.55fr_0.45fr] gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:grid"><span>Store</span><span>Market</span><span>Keywords</span><span>Status</span></div><div className="divide-y divide-white/10">{projects.map((project) => <div key={project._id.toString()} className="grid gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[1.3fr_0.8fr_0.55fr_0.45fr] md:items-center"><div><div className="font-medium text-white">{project.name}</div><div className="mt-1 text-xs text-slate-500">Created {new Date(project.createdAt).toLocaleDateString()}</div></div><div className="text-sm text-slate-400">{project.country}<br /><span className="text-xs text-slate-500">{project.language}</span></div><div className="text-sm font-medium text-slate-200">{project.keywords?.length || 0}</div><div><Badge variant="outline" className={statusStyles[project.status] || statusStyles.DRAFT}>{project.status}</Badge></div></div>)}</div></div>}
          </CardContent></Card>

          <aside className="space-y-6"><Card className="border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-cyan-400/5"><CardHeader><Badge className="w-fit bg-violet-400/10 text-violet-200">Import format</Badge><CardTitle className="mt-2">Use the ready template</CardTitle><CardDescription>Columns: Store Name, Keyword, Country and Language. Multiple rows for the same store are grouped automatically.</CardDescription></CardHeader><CardContent><a href="/api/templates/keywords"><Button variant="outline" className="w-full border-violet-300/20 text-violet-100 hover:bg-violet-400/10">Download Excel template</Button></a></CardContent></Card>
            <Card><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant={googleAdsConnection ? "success" : "warning"}>{googleAdsConnection ? "Connected" : "Not connected"}</Badge><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Google Ads API</span></div><CardTitle>{googleAdsConnection ? "Account connected" : "Connect Google Ads"}</CardTitle><CardDescription>Authorize the Google account that can access your manager and customer Ads accounts.</CardDescription></CardHeader><CardContent>{googleAdsConnection?.googleEmail && <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">Connected as <strong>{googleAdsConnection.googleEmail}</strong></div>}<a href="/api/google-ads/connect"><Button className="w-full">{googleAdsConnection ? "Reconnect Google Ads" : "Connect Google Ads"}</Button></a></CardContent></Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
