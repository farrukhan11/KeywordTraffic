"use client";

import { useMemo, useState } from "react";

const MONTH_ORDER = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(2);
}

function formatMonth(month) {
  if (!month) return "—";
  return String(month)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function monthShort(month) {
  return formatMonth(month).slice(0, 3);
}

function sortHistory(history) {
  return [...(Array.isArray(history) ? history : [])].sort((a, b) => {
    const yearDiff = Number(a.year || 0) - Number(b.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return (MONTH_ORDER[a.month] ?? 99) - (MONTH_ORDER[b.month] ?? 99);
  });
}

function competitionClasses(value) {
  if (value === "HIGH") return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  if (value === "MEDIUM") return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  if (value === "LOW") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  return "border-white/10 bg-white/[0.04] text-slate-400";
}

function Sparkline({ history }) {
  const points = sortHistory(history);
  if (!points.length) return <span className="text-xs text-slate-600">No trend</span>;

  const width = 110;
  const height = 32;
  const values = points.map((item) => Number(item.monthlySearches || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const coords = points.map((item, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - 3 - ((Number(item.monthlySearches || 0) - min) / range) * (height - 6);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-28 overflow-visible" role="img" aria-label="12 month search trend">
      <polyline points={coords.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TrendChart({ history }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const points = sortHistory(history);

  if (!points.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 text-sm text-slate-500">
        Google returned no monthly search-volume history for this keyword.
      </div>
    );
  }

  const width = 900;
  const height = 290;
  const padX = 52;
  const padTop = 22;
  const padBottom = 48;
  const values = points.map((item) => Number(item.monthlySearches || 0));
  const maxValue = Math.max(...values, 1);
  const niceMax = Math.max(10, Math.ceil(maxValue / Math.pow(10, Math.max(0, String(Math.floor(maxValue)).length - 2))) * Math.pow(10, Math.max(0, String(Math.floor(maxValue)).length - 2)));
  const chartHeight = height - padTop - padBottom;
  const chartWidth = width - padX * 2;

  const coords = points.map((item, index) => {
    const x = padX + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
    const y = padTop + chartHeight - (Number(item.monthlySearches || 0) / niceMax) * chartHeight;
    return { x, y, item };
  });

  const linePoints = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${padX},${padTop + chartHeight} ${linePoints} ${padX + chartWidth},${padTop + chartHeight}`;
  const hovered = hoveredIndex == null ? null : coords[hoveredIndex];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: Math.round(niceMax * ratio),
    y: padTop + chartHeight - chartHeight * ratio,
  }));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09111e] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-white">Monthly search trend</p>
          <p className="mt-1 text-xs text-slate-500">Historical Google Search volume returned by Keyword Planner</p>
        </div>
        {hovered && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            <strong>{monthShort(hovered.item.month)} {hovered.item.year}</strong> · {formatNumber(hovered.item.monthlySearches)} searches
          </div>
        )}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[650px]" role="img" aria-label="Monthly Google search volume graph">
          <defs>
            <linearGradient id="keywordTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick.ratio}>
              <line x1={padX} x2={padX + chartWidth} y1={tick.y} y2={tick.y} stroke="rgba(148,163,184,.14)" strokeWidth="1" />
              <text x={padX - 12} y={tick.y + 4} textAnchor="end" fill="rgb(100 116 139)" fontSize="11">
                {formatNumber(tick.value)}
              </text>
            </g>
          ))}

          <polygon points={areaPoints} fill="url(#keywordTrendFill)" />
          <polyline points={linePoints} fill="none" stroke="rgb(34 211 238)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {coords.map((point, index) => (
            <g key={`${point.item.year}-${point.item.month}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 7 : 4.5}
                fill="rgb(8 15 28)"
                stroke="rgb(103 232 249)"
                strokeWidth="3"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text x={point.x} y={height - 17} textAnchor="middle" fill="rgb(100 116 139)" fontSize="11">
                {monthShort(point.item.month)}
              </text>
              <text x={point.x} y={height - 3} textAnchor="middle" fill="rgb(71 85 105)" fontSize="9">
                {String(point.item.year || "").slice(-2)}
              </text>
            </g>
          ))}

          {hovered && (
            <line x1={hovered.x} x2={hovered.x} y1={padTop} y2={padTop + chartHeight} stroke="rgba(103,232,249,.45)" strokeWidth="1" strokeDasharray="4 4" />
          )}
        </svg>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
      {helper && <p className="mt-1 text-[11px] text-slate-600">{helper}</p>}
    </div>
  );
}

export default function QuickKeywordSearch() {
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [requestedKeywordCount, setRequestedKeywordCount] = useState(0);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [sortKey, setSortKey] = useState("averageMonthlySearches");
  const [sortDirection, setSortDirection] = useState("desc");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setRequestedKeywordCount(0);
    setSelectedKeyword("");

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

      const nextResults = data.results || [];
      setResults(nextResults);
      setRequestedKeywordCount(Number(data.keywordCount ?? parsedKeywords.length));
      setSelectedKeyword(nextResults[0]?.keyword || "");
      if (!nextResults.length) setError("Google returned no historical data for these keywords.");
    } catch (err) {
      setError(err.message || "Unable to fetch keyword traffic.");
    } finally {
      setLoading(false);
    }
  }

  function changeSort(key) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  }

  const sortedResults = useMemo(() => {
    const rows = [...results];
    return rows.sort((a, b) => {
      let aValue = a?.[sortKey];
      let bValue = b?.[sortKey];
      if (sortKey === "keyword" || sortKey === "competition") {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      aValue = Number(aValue ?? -1);
      bValue = Number(bValue ?? -1);
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [results, sortKey, sortDirection]);

  const selectedResult = results.find((result) => result.keyword === selectedKeyword) || results[0] || null;
  const totalSearchVolume = results.reduce((sum, result) => sum + Number(result.averageMonthlySearches || 0), 0);
  const highestVolume = results.reduce((best, result) => {
    if (!best || Number(result.averageMonthlySearches || 0) > Number(best.averageMonthlySearches || 0)) return result;
    return best;
  }, null);

  const history = sortHistory(selectedResult?.monthlySearchVolumes);
  const historyValues = history.map((item) => Number(item.monthlySearches || 0));
  const peakSearches = historyValues.length ? Math.max(...historyValues) : null;
  const latestSearches = historyValues.length ? historyValues[historyValues.length - 1] : null;
  const closeVariants = Array.isArray(selectedResult?.closeVariants) ? selectedResult.closeVariants : [];

  const SortHeader = ({ field, children, className = "" }) => (
    <th className={`px-4 py-3 ${className}`}>
      <button type="button" onClick={() => changeSort(field)} className="flex items-center gap-1.5 whitespace-nowrap font-bold hover:text-slate-300">
        {children}
        <span className={sortKey === field ? "text-cyan-300" : "text-slate-700"}>{sortKey === field ? (sortDirection === "desc" ? "↓" : "↑") : "↕"}</span>
      </button>
    </th>
  );

  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1321] shadow-2xl shadow-black/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/[0.07] via-transparent to-violet-400/[0.05] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Keyword Explorer</span>
              <span className="text-xs text-slate-500">Google Ads historical metrics</span>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Research keyword traffic</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Enter up to 50 keywords. Use commas or new lines. Results use the selected location, language and Google Search network.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">Network: <strong className="text-slate-300">Google Search</strong></span>
            <span className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">Period: <strong className="text-slate-300">Last 12 months</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-[#070d17]/80 p-3 shadow-inner shadow-black/20">
          <div className="grid gap-3 xl:grid-cols-[1.7fr_0.65fr_0.55fr_auto]">
            <div className="relative">
              <textarea
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                rows={3}
                placeholder={"blissy coupon code\nblissy discount code\nblissy promo code"}
                className="min-h-[78px] w-full resize-y rounded-xl border border-white/10 bg-[#0b1422] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/5"
              />
              <span className="absolute bottom-3 right-3 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-600">max 50</span>
            </div>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1422] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400/40">
              <option>United Kingdom</option><option>United States</option><option>Pakistan</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option>
            </select>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1422] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400/40">
              <option>English</option><option>Urdu</option><option>Arabic</option><option>French</option><option>German</option>
            </select>
            <button disabled={loading} className="min-h-[54px] rounded-xl bg-cyan-300 px-7 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
              {loading ? "Fetching data…" : "Search keywords"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Requested keywords" value={formatNumber(requestedKeywordCount)} helper="Unique inputs sent to Google" />
            <MetricCard label="Google result rows" value={formatNumber(results.length)} helper={requestedKeywordCount !== results.length ? "Close variants may be de-duplicated" : "One result row per input"} />
            <MetricCard label="Combined avg volume" value={formatNumber(totalSearchVolume)} helper="Sum of returned avg monthly searches" />
            <MetricCard label="Top keyword" value={highestVolume?.keyword || "—"} helper={highestVolume ? `${formatNumber(highestVolume.averageMonthlySearches)} avg searches` : ""} />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#09111e]">
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-black text-white">Keyword results</h3>
                <p className="mt-1 text-xs text-slate-500">Click any row to inspect every metric returned by Google.</p>
              </div>
              <div className="text-xs text-slate-500">{country} · {language} · Google Search</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.025] text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <SortHeader field="keyword">Keyword</SortHeader>
                    <SortHeader field="averageMonthlySearches">Volume</SortHeader>
                    <SortHeader field="competition">Competition</SortHeader>
                    <SortHeader field="competitionIndex">Comp. index</SortHeader>
                    <SortHeader field="averageCpc">Avg CPC</SortHeader>
                    <SortHeader field="lowTopOfPageBid">Low top bid</SortHeader>
                    <SortHeader field="highTopOfPageBid">High top bid</SortHeader>
                    <th className="px-4 py-3 font-bold">12-mo trend</th>
                    <th className="px-4 py-3 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {sortedResults.map((result, index) => {
                    const active = selectedResult?.keyword === result.keyword;
                    return (
                      <tr
                        key={`${result.keyword}-${index}`}
                        onClick={() => setSelectedKeyword(result.keyword)}
                        className={`cursor-pointer transition ${active ? "bg-cyan-300/[0.07]" : "hover:bg-white/[0.025]"}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${active ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" : "bg-slate-700"}`} />
                            <span className="font-bold text-white">{result.keyword || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-black text-white">{formatNumber(result.averageMonthlySearches)}</td>
                        <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${competitionClasses(result.competition)}`}>{result.competition || "NO DATA"}</span></td>
                        <td className="px-4 py-4 text-slate-300">{result.competitionIndex ?? "—"}</td>
                        <td className="px-4 py-4 text-slate-300">{formatMoney(result.averageCpc)}</td>
                        <td className="px-4 py-4 text-slate-300">{formatMoney(result.lowTopOfPageBid)}</td>
                        <td className="px-4 py-4 text-slate-300">{formatMoney(result.highTopOfPageBid)}</td>
                        <td className="px-4 py-4 text-cyan-300"><Sparkline history={result.monthlySearchVolumes} /></td>
                        <td className="px-4 py-4"><button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200">Analyze</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedResult && (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-[#080f1b]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-cyan-300/[0.06] to-transparent px-5 py-5 sm:px-6 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedResult.keyword}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${competitionClasses(selectedResult.competition)}`}>{selectedResult.competition || "NO COMPETITION DATA"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Complete historical metric set returned by Google Ads Keyword Planner for this result.</p>
                </div>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">{country}</span>
                  <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">{language}</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <MetricCard label="Avg monthly searches" value={formatNumber(selectedResult.averageMonthlySearches)} helper="12-month average" />
                  <MetricCard label="Competition index" value={selectedResult.competitionIndex ?? "—"} helper="0–100" />
                  <MetricCard label="Average CPC" value={formatMoney(selectedResult.averageCpc)} helper="Google legacy avg CPC" />
                  <MetricCard label="Low top bid" value={formatMoney(selectedResult.lowTopOfPageBid)} helper="20th percentile" />
                  <MetricCard label="High top bid" value={formatMoney(selectedResult.highTopOfPageBid)} helper="80th percentile" />
                  <MetricCard label="Latest month" value={latestSearches == null ? "—" : formatNumber(latestSearches)} helper={history.length ? `${formatMonth(history[history.length - 1].month)} ${history[history.length - 1].year}` : "No monthly history"} />
                </div>

                <div className="mt-5 grid gap-5 2xl:grid-cols-[1.6fr_0.7fr]">
                  <TrendChart history={selectedResult.monthlySearchVolumes} />

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Trend summary</p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-black/20 p-3"><p className="text-[10px] uppercase text-slate-600">Peak month</p><p className="mt-1 text-lg font-black text-white">{peakSearches == null ? "—" : formatNumber(peakSearches)}</p></div>
                        <div className="rounded-xl bg-black/20 p-3"><p className="text-[10px] uppercase text-slate-600">Data points</p><p className="mt-1 text-lg font-black text-white">{history.length}</p></div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Close variants</p>
                      {closeVariants.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {closeVariants.map((variant, index) => <span key={`${variant}-${index}`} className="rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-semibold text-violet-200">{variant}</span>)}
                        </div>
                      ) : <p className="mt-3 text-sm text-slate-600">Google returned no close variants for this result.</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  <div className="border-b border-white/10 bg-white/[0.025] px-5 py-4">
                    <h4 className="font-black text-white">Monthly search volume data</h4>
                    <p className="mt-1 text-xs text-slate-500">Exact month/year points used in the graph above.</p>
                  </div>
                  {history.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                          <tr><th className="px-5 py-3 text-left">Month</th><th className="px-5 py-3 text-left">Year</th><th className="px-5 py-3 text-left">Monthly searches</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                          {history.map((month, index) => (
                            <tr key={`${month.year}-${month.month}-${index}`} className="hover:bg-white/[0.02]">
                              <td className="px-5 py-3 font-bold text-slate-300">{formatMonth(month.month)}</td>
                              <td className="px-5 py-3 text-slate-500">{month.year ?? "—"}</td>
                              <td className="px-5 py-3 font-black text-white">{formatNumber(month.monthlySearches)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="px-5 py-8 text-sm text-slate-600">No monthly volume rows returned by Google.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
