import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Create account" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-indigo-500/40 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div>
            <Link className="inline-flex items-center gap-3 text-xl font-black text-white" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm">KT</span>
              Keyword Traffic
            </Link>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              An internal keyword research and Google Ads campaign-planning platform for organizing bulk keyword lists and authorized historical metrics.
            </p>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support email</p>
              <a
                className="mt-2 inline-block font-semibold text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-200"
                href="mailto:seemreviews@gmail.com"
              >
                seemreviews@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Important links</h2>
            <nav aria-label="Footer navigation" className="mt-5 grid gap-3 sm:grid-cols-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-indigo-400/60 hover:text-white"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 bg-slate-950 px-6 py-5 text-center text-xs leading-6 text-slate-400">
        © 2026 Keyword Traffic. Google Ads is a trademark of Google LLC. Keyword Traffic is not endorsed by or affiliated with Google.
      </div>
    </footer>
  );
}
