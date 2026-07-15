"use client";

import { useState } from "react";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  if (value == null) return "—";
  return Number(value).toFixed(2);
}

export default function QuickKeywordSearch() {
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    const parsedKeywords = [...new Set(keywords.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean))];
    if (!parsedKeywords.length) return setError("Please enter at least one keyword.");
    if (parsedKeywords.length > 50) return setError("Quick search supports up to 50 keywords at a time.");

    setLoading(true);
    try {
      const response = await fetch("/api/google-ads/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: parsedKeywords, country, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to fetch keyword traffic.");
      setResults(data.results || []);
      if (!(data.results || []).length) setError("Google returned no historical data for these keywords.");
    } catch (err) {
      setError(err.message || "Unable to fetch keyword traffic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0d1422] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Quick keyword search</p>
      <h2 className="mt-2 text-2xl font-black">Type keywords and check live traffic</h2>
      <p className="mt-2 text-sm text-slate-400">Separate multiple keywords with commas or new lines. Google Ads must be connected.</p>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 xl:grid-cols-[1.7fr_0.7fr_0.6fr_auto]">
        <textarea value={keywords} onChange={(event) => setKeywords(event.target.value)} rows={2} placeholder="nike discount code, nike promo code" className="min-h-14 resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600" />
        <select value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white">
          <option>United Kingdom</option><option>United States</option><option>Pakistan</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option>
        </select>
        <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-white/10 bg-[#080d17] px-4 py-3 text-white">
          <option>English</option><option>Urdu</option><option>Arabic</option><option>French</option><option>German</option>
        </select>
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60">{loading ? "Checking..." : "Search"}</button>
      </form>
      {error && <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {results.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3">Keyword</th><th className="px-4 py-3">Monthly searches</th><th className="px-4 py-3">Competition</th><th className="px-4 py-3">Index</th><th className="px-4 py-3">Low bid</th><th className="px-4 py-3">High bid</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {results.map((result, index) => (
                <tr key={`${result.keyword}-${index}`} className="text-slate-300">
                  <td className="px-4 py-4 font-bold text-white">{result.keyword || "—"}</td>
                  <td className="px-4 py-4">{formatNumber(result.averageMonthlySearches)}</td>
                  <td className="px-4 py-4">{result.competition || "—"}</td>
                  <td className="px-4 py-4">{result.competitionIndex ?? "—"}</td>
                  <td className="px-4 py-4">{formatMoney(result.lowTopOfPageBid)}</td>
                  <td className="px-4 py-4">{formatMoney(result.highTopOfPageBid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
