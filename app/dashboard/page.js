import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";
import KeywordExplorer from "@/components/KeywordExplorer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function Dashboard({ searchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const googleAdsStatus = params?.googleAds;
  const googleAdsReason = params?.reason ? decodeURIComponent(String(params.reason)) : "";

  return (
    <main className="dashboard-ui min-h-screen bg-[#070b12] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-12">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">KT</div>
            <div><p className="text-sm font-bold text-white">Keyword Traffic</p><p className="text-[11px] text-slate-500">Research workspace</p></div>
          </Link>
          <div className="flex items-center gap-3"><SignOutButton /></div>
        </div>
      </header>

      <section className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 2xl:px-12 lg:py-10">
        {googleAdsStatus === "connected" && <Alert className="mb-5"><AlertTitle>Google Ads connected</AlertTitle><AlertDescription>Your account is ready for keyword traffic checks.</AlertDescription></Alert>}
        {(googleAdsStatus === "error" || googleAdsStatus === "invalid-state") && <Alert variant="destructive" className="mb-5"><AlertTitle>Google Ads connection failed</AlertTitle><AlertDescription>{googleAdsReason || (googleAdsStatus === "invalid-state" ? "OAuth state validation failed. Start the connection again from this dashboard." : "Check the OAuth redirect URI and environment values, then reconnect.")}</AlertDescription></Alert>}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Overview</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Keyword dashboard</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Research Google Ads traffic for grouped keywords and export the results.</p></div>
          <Link href="/dashboard/projects/new"><Button size="lg">Upload keywords <span aria-hidden>→</span></Button></Link>
        </div>

        <KeywordExplorer />
      </section>
    </main>
  );
}
