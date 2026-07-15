import Link from "next/link";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link className="shrink-0" href="/" aria-label="Coupon Tech home">
          <img src="/Coupon-tech-black.jpg" alt="Coupon Tech Logo" className="h-18 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white sm:px-4"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:px-4"
            href="/register"
          >
            Get started
          </Link>
        </div>
      </div>

      <nav className="border-t border-slate-800/80 px-4 py-2 lg:hidden" aria-label="Mobile public navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 overflow-x-auto">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
