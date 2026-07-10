import Link from 'next/link';

const features = [
  ['Bulk keyword checks', 'Paste keywords or upload CSV files and process thousands of terms in organized batches.'],
  ['Google Ads data', 'Pull average monthly searches, monthly trends, competition and bid estimates from Keyword Planner.'],
  ['Store-wise projects', 'Keep every brand, market and keyword set separate with clear progress and saved reports.'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-80 -left-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold">K</span>
          <span>Keyword Traffic</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white">Sign in</Link>
          <Link href="/login" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100">Get started</Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-28">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            Google Keyword Planner automation
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Check keyword traffic for every store in minutes
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Replace repetitive 10-keyword manual searches with one reliable workspace for bulk imports, Google Ads metrics, progress tracking and downloadable results.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="rounded-xl bg-blue-500 px-6 py-3.5 text-center font-semibold hover:bg-blue-400">Start researching</Link>
            <Link href="/dashboard" className="rounded-xl border border-slate-700 px-6 py-3.5 text-center font-semibold text-slate-200 hover:bg-slate-900">Open dashboard</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div><p className="text-2xl font-bold">50</p><p className="text-xs text-slate-400">keywords per batch</p></div>
            <div><p className="text-2xl font-bold">12 mo</p><p className="text-xs text-slate-400">search history</p></div>
            <div><p className="text-2xl font-bold">CSV</p><p className="text-xs text-slate-400">bulk import ready</p></div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Current project</p><h2 className="text-xl font-semibold">UK Fashion Stores</h2></div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Processing</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['2,000','Keywords'],['1,450','Fetched'],['550','Cached']].map(([value,label]) => (
              <div key={label} className="rounded-2xl bg-slate-950 p-4"><p className="text-xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-950 p-4">
            <div className="mb-3 flex justify-between text-sm"><span>Overall progress</span><span className="text-blue-300">72%</span></div>
            <div className="h-2 rounded-full bg-slate-800"><div className="h-2 w-[72%] rounded-full bg-blue-500" /></div>
          </div>
          <div className="mt-5 space-y-2">
            {['nike discount code','adidas promo code','asos voucher code'].map((keyword, index) => (
              <div key={keyword} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3 text-sm">
                <span>{keyword}</span><span className="font-semibold text-slate-200">{[12100,8100,6600][index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-3 lg:px-8">
          {features.map(([title, description], index) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 font-bold text-blue-300">0{index + 1}</span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
