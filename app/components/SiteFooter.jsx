import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div>
          <div className="text-lg font-bold text-white">Keyword Traffic</div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            An internal keyword research and Google Ads campaign-planning platform for organizing bulk keyword lists and historical metrics.
          </p>
          <a
            className="mt-4 inline-block text-sm font-medium text-indigo-300 hover:text-indigo-200"
            href="mailto:seemreviews@gmail.com"
          >
            seemreviews@gmail.com
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm md:justify-self-end">
          <Link className="hover:text-white" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-white" href="/terms">
            Terms of Service
          </Link>
          <Link className="hover:text-white" href="/contact">
            Contact
          </Link>
          <Link className="hover:text-white" href="/login">
            Login
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-5 text-center text-xs text-slate-500">
        © 2026 Keyword Traffic. Google Ads is a trademark of Google LLC. Keyword Traffic is not endorsed by or affiliated with Google.
      </div>
    </footer>
  );
}
