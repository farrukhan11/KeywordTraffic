"use client";

import { Fragment, useState } from "react";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  if (value == null) return "—";
  return Number(value).toFixed(2);
}

function formatMonth(month) {
  if (!month) return "Unknown month";
  return String(month)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function QuickKeywordSearch() {
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [requestedKeywordCount, setRequestedKeywordCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setRequestedKeywordCount(0);
    setExpandedRows({});

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
      setRequestedKeywordCount(Number(data.keywordCount ?? parsedKeywords.length));
      if (!(data.results || []).length) setError("Google returned no historical data for these keywords.");
    } catch (err) {
      setError(err.message || "Unable to fetch keyword traffic.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(index) {
    setExpandedRows((current) => ({ ...current, [index]: !current[index] }));
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0d1422] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Quick keyword search</p>
      <h2 className="mt-2 text-2xl font-black">Type keywords and check live traffic</h2>
      <p className="mt-2 text-sm text-slate-400">Separate multiple keywords with commas or new lines. Google Ads must be connected.</p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 xl:grid-cols-[1.7fr_0.7fr_0.6fr_auto]">
        <textarea
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          rows={2}
          placeholder="nike discount code, nike promo code"
          className="min-h-14 resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600"
        />
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
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Requested keywords: <strong className="text-white">{requestedKeywordCount}</strong></span>
            <span>Google result rows: <strong className="text-white">{results.length}</strong></span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">Avg monthly searches</th>
                  <th className="px-4 py-3">Competition</th>
                  <th className="px-4 py-3">Index</th>
                  <th className="px-4 py-3">Low top bid</th>
                  <th className="px-4 py-3">High top bid</th>
                  <th className="px-4 py-3">More data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {results.map((result, index) => {
                  const closeVariants = Array.isArray(result.closeVariants) ? result.closeVariants : [];
                  const monthlyHistory = Array.isArray(result.monthlySearchVolumes) ? result.monthlySearchVolumes : [];
                  const isExpanded = Boolean(expandedRows[index]);

                  return (
                    <Fragment key={`${result.keyword}-${index}`}>
                      <tr className="text-slate-300">
                        <td className="px-4 py-4 font-bold text-white">{result.keyword || "—"}</td>
                        <td className="px-4 py-4">{formatNumber(result.averageMonthlySearches)}</td>
                        <td className="px-4 py-4">{result.competition || "—"}</td>
                        <td className="px-4 py-4">{result.competitionIndex ?? "—"}</td>
                        <td className="px-4 py-4">{formatMoney(result.lowTopOfPageBid)}</td>
                        <td className="px-4 py-4">{formatMoney(result.highTopOfPageBid)}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleRow(index)}
                            className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20"
                          >
                            {isExpanded ? "Hide details" : "Show all data"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-black/15">
                          <td colSpan={7} className="px-4 py-5">
                            <div className="grid gap-5 xl:grid-cols-[0.8fr_2fr]">
                              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Close variants</p>
                                {closeVariants.length > 0 ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {closeVariants.map((variant, variantIndex) => (
                                      <span key={`${variant}-${variantIndex}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                                        {variant}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-3 text-sm text-slate-500">Google returned no close variants.</p>
                                )}
                              </div>

                              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly search volume history</p>
                                {monthlyHistory.length > 0 ? (
                                  <div className="mt-3 overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                      <thead className="text-xs uppercase text-slate-600">
                                        <tr>
                                          <th className="px-3 py-2 text-left">Month</th>
                                          <th className="px-3 py-2 text-left">Year</th>
                                          <th className="px-3 py-2 text-left">Searches</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5">
                                        {monthlyHistory.map((month, monthIndex) => (
                                          <tr key={`${month.year}-${month.month}-${monthIndex}`}>
                                            <td className="px-3 py-2 text-slate-300">{formatMonth(month.month)}</td>
                                            <td className="px-3 py-2 text-slate-400">{month.year ?? "—"}</td>
                                            <td className="px-3 py-2 font-bold text-white">{formatNumber(month.monthlySearches)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="mt-3 text-sm text-slate-500">Google returned no monthly search-volume breakdown.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
