import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold">Keyword Traffic</div>
        <div className="flex gap-3"><Link className="rounded-lg px-4 py-2 text-slate-300" href="/login">Login</Link><Link className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold" href="/register">Get started</Link></div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div><span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">Built for bulk store research</span><h1 className="mt-6 text-5xl font-black leading-tight">Check thousands of keyword traffic metrics without manual Keyword Planner work.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Create store projects, paste or upload keywords, remove duplicates and prepare them for Google Ads historical metrics processing.</p><div className="mt-8 flex gap-4"><Link className="rounded-xl bg-indigo-500 px-6 py-3 font-bold" href="/register">Create account</Link><Link className="rounded-xl border border-slate-700 px-6 py-3 font-bold" href="/login">Open dashboard</Link></div></div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"><div className="grid grid-cols-3 gap-3">{[["200","Stores"],["2,000","Keywords"],["40","Batches"]].map(([n,l])=><div key={l} className="rounded-2xl bg-slate-800 p-4"><div className="text-2xl font-bold">{n}</div><div className="text-sm text-slate-400">{l}</div></div>)}</div><div className="mt-5 space-y-3">{["nike discount code","adidas voucher code","asos promo code"].map((k,i)=><div key={k} className="flex justify-between rounded-xl border border-slate-800 p-4"><span>{k}</span><span className="text-emerald-400">{[12100,8100,5400][i]} searches</span></div>)}</div></div>
      </section>
    </main>
  );
}
