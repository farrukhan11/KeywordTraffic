import Link from "next/link";
import SiteFooter from "./SiteFooter";

export default function LegalPage({ title, updated, intro, children }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/">
          <img src="/Coupon-tech-black.jpg" alt="Coupon Tech Logo" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link className="rounded-lg px-4 py-2 text-slate-300 hover:text-white" href="/login">
            Login
          </Link>
          <Link className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400" href="/register">
            Get started
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 pb-20 pt-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Keyword Traffic</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-slate-400">Last updated: {updated}</p>
        {intro ? <p className="mt-8 text-lg leading-8 text-slate-300">{intro}</p> : null}
        <div className="mt-10 space-y-10 text-base leading-8 text-slate-300">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
