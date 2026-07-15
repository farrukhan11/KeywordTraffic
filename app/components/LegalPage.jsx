import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function LegalPage({ title, updated, intro, children }) {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <SiteHeader />

      <article className="mx-auto w-full max-w-4xl flex-1 px-6 pb-20 pt-12">
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
