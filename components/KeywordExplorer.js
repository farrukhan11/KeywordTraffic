"use client";

import { useMemo, useState } from "react";

const MAX_KEYWORDS = 1000;
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

const MODIFIER_SUFFIX = /\s+(?:discount code|discounts|discount|coupon code|coupons|coupon|promo code|promo|voucher code|voucher)\s*$/i;

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function titleCase(value) {
  return normalize(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferGroup(keyword) {
  const cleaned = normalize(keyword);
  return cleaned.replace(MODIFIER_SUFFIX, "").trim() || cleaned;
}

function parseKeywords(value) {
  const seen = new Set();
  return String(value || "")
    .split(/[\n,]+/)
    .map(normalize)
    .filter(Boolean)
    .filter((keyword) => {
      const key = keyword.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(2);
}

function monthName(month) {
  return String(month || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortHistory(history) {
  return [...(Array.isArray(history) ? history : [])].sort((a, b) => {
    const yearDiff = Number(a.year || 0) - Number(b.year || 0);
    if (yearDiff) return yearDiff;
    return (MONTH_ORDER[a.month] ?? 99) - (MONTH_ORDER[b.month] ?? 99);
  });
}

function combineHistory(rows) {
  const months = new Map();
  rows.forEach((row) => {
    sortHistory(row.monthlySearchVolumes).forEach((point) => {
      const key = `${point.year}-${point.month}`;
      const current = months.get(key) || { year: point.year, month: point.month, monthlySearches: 0 };
      current.monthlySearches += Number(point.monthlySearches || 0);
      months.set(key, current);
    });
  });
  return sortHistory([...months.values()]);
}

function competitionBadge(value) {
  if (value === "HIGH") return "border-red-400/20 bg-red-400/10 text-red-300";
  if (value === "MEDIUM") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  if (value === "LOW") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  return "border-white/10 bg-white/[0.03] text-slate-500";
}

function MiniTrend({ history }) {
  const points = sortHistory(history);
  if (!points.length) return <span className="text-xs text-slate-600">No data</span>;

  const width = 112;
  const height = 34;
  const values = points.map((point) => Number(point.monthlySearches || 0));
  const max = Math.max(...values, 1);
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - 3 - (Number(point.monthlySearches || 0) / max) * (height - 6);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-28" aria-label="12 month trend">
      <polyline points={coords.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TrendChart({ history, title }) {
  const [hovered, setHovered] = useState(null);
  const points = sortHistory(history);
  if (!points.length) {
    return <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#090f19] text-sm text-slate-600">No monthly history returned by Google.</div>;
  }

  const width = 920;
  const height = 280;
  const left = 56;
  const right = 18;
  const top = 20;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const values = points.map((point) => Number(point.monthlySearches || 0));
  const maxValue = Math.max(...values, 1);
  const step = Math.pow(10, Math.max(0, String(Math.floor(maxValue)).length - 2));
  const niceMax = Math.max(10, Math.ceil(maxValue / step) * step);

  const coords = points.map((point, index) => ({
    point,
    x: left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth),
    y: top + chartHeight - (Number(point.monthlySearches || 0) / niceMax) * chartHeight,
  }));

  const line = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${left},${top + chartHeight} ${line} ${left + chartWidth},${top + chartHeight}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({ ratio, value: Math.round(niceMax * ratio), y: top + chartHeight - chartHeight * ratio }));
  const active = hovered == null ? null : coords[hovered];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090f19] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">Google Ads monthly search history</p>
        </div>
        {active && (
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            {monthName(active.point.month)} {active.point.year}: <strong>{formatNumber(active.point.monthlySearches)}</strong>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[650px] w-full" aria-label={title}>
          <defs>
            <linearGradient id="trafficArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick.ratio}>
              <line x1={left} x2={left + chartWidth} y1={tick.y} y2={tick.y} stroke="rgba(148,163,184,.12)" />
              <text x={left - 10} y={tick.y + 4} textAnchor="end" fill="rgb(100 116 139)" fontSize="10">{formatNumber(tick.value)}</text>
            </g>
          ))}
          <polygon points={area} fill="url(#trafficArea)" />
          <polyline points={line} fill="none" stroke="rgb(34 211 238)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map(({ x, y, point }, index) => (
            <g key={`${point.year}-${point.month}-${index}`} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
              <circle cx={x} cy={y} r={hovered === index ? 6 : 4} fill="#090f19" stroke="rgb(103 232 249)" strokeWidth="2.5" className="cursor-pointer" />
              <text x={x} y={height - 14} textAnchor="middle" fill="rgb(100 116 139)" fontSize="10">{monthName(point.month).slice(0, 3)}</text>
              <text x={x} y={height - 2} textAnchor="middle" fill="rgb(71 85 105)" fontSize="9">{String(point.year || "").slice(-2)}</text>
            </g>
          ))}
          {active && <line x1={active.x} x2={active.x} y1={top} y2={top + chartHeight} stroke="rgba(103,232,249,.35)" strokeDasharray="4 4" />}
        </svg>
      </div>
    </div>
  );
}

function Stat({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a111d] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-white">{value}</p>
      {helper && <p className="mt-1 text-[11px] text-slate-600">{helper}</p>}
    </div>
  );
}

export default function KeywordExplorer() {
  const [keywords, setKeywords] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [requestedKeywords, setRequestedKeywords] = useState([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");

  const inputKeywords = useMemo(() => parseKeywords(keywords), [keywords]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setRequestedKeywords([]);
    setSelectedGroupKey("");
    setSelectedKeyword("");

    const parsed = parseKeywords(keywords);
    if (!parsed.length) return setError("Enter at least one keyword.");
    if (parsed.length > MAX_KEYWORDS) return setError(`Maximum ${MAX_KEYWORDS.toLocaleString()} keywords per search.`);

    setLoading(true);
    try {
      const response = await fetch("/api/google-ads/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: parsed, country, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to fetch Google Ads metrics.");

      const rows = data.results || [];
      setRequestedKeywords(parsed);
      setResults(rows);
      setSelectedGroupKey(inferGroup(parsed[0]).toLowerCase());
      setSelectedKeyword(rows[0]?.keyword || "");
      if (!rows.length) setError("Google returned no historical metrics for these keywords.");
    } catch (err) {
      setError(err.message || "Unable to fetch Google Ads metrics.");
    } finally {
      setLoading(false);
    }
  }

  const groups = useMemo(() => {
    const groupMap = new Map();
    const keywordToGroup = new Map();

    requestedKeywords.forEach((keyword) => {
      const name = inferGroup(keyword);
      const key = name.toLowerCase();
      keywordToGroup.set(keyword.toLowerCase(), key);
      if (!groupMap.has(key)) groupMap.set(key, { key, name: titleCase(name), requestedKeywords: [], results: [] });
      groupMap.get(key).requestedKeywords.push(keyword);
    });

    results.forEach((result) => {
      const resultKey = normalize(result.keyword).toLowerCase();
      let groupKey = keywordToGroup.get(resultKey);

      if (!groupKey) {
        const variant = (Array.isArray(result.closeVariants) ? result.closeVariants : [])
          .map((item) => normalize(item).toLowerCase())
          .find((item) => keywordToGroup.has(item));
        if (variant) groupKey = keywordToGroup.get(variant);
      }

      if (!groupKey) groupKey = inferGroup(result.keyword).toLowerCase();
      if (!groupMap.has(groupKey)) groupMap.set(groupKey, { key: groupKey, name: titleCase(inferGroup(result.keyword)), requestedKeywords: [], results: [] });
      groupMap.get(groupKey).results.push(result);
    });

    return [...groupMap.values()]
      .map((group) => {
        const totalVolume = group.results.reduce((sum, row) => sum + Number(row.averageMonthlySearches || 0), 0);
        const topKeyword = [...group.results].sort((a, b) => Number(b.averageMonthlySearches || 0) - Number(a.averageMonthlySearches || 0))[0] || null;
        return { ...group, totalVolume, topKeyword, combinedHistory: combineHistory(group.results) };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }, [requestedKeywords, results]);

  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) || groups[0] || null;
  const selectedResult = selectedGroup?.results.find((row) => row.keyword === selectedKeyword) || selectedGroup?.results[0] || null;
  const totalVolume = groups.reduce((sum, group) => sum + group.totalVolume, 0);
  const closeVariants = Array.isArray(selectedResult?.closeVariants) ? selectedResult.closeVariants : [];
  const selectedHistory = sortHistory(selectedResult?.monthlySearchVolumes);
  const latestPoint = selectedHistory[selectedHistory.length - 1] || null;

  function selectGroup(group) {
    setSelectedGroupKey(group.key);
    setSelectedKeyword(group.results[0]?.keyword || "");
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-xl shadow-black/20">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
              <span>Keyword Explorer</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="normal-case tracking-normal text-slate-500">Google Ads historical metrics</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Bulk keyword research</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Paste multiple brands and keyword variations. Coupon, discount, promo and voucher terms are grouped automatically.</p>
          </div>
          <div className="flex gap-2 text-[11px] text-slate-500">
            <span className="rounded-md border border-white/10 bg-[#080e18] px-2.5 py-1.5">Google Search</span>
            <span className="rounded-md border border-white/10 bg-[#080e18] px-2.5 py-1.5">12 months</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#080e18] focus-within:border-cyan-400/30">
          <textarea
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            rows={5}
            placeholder={"medify air discount code\nmedify air coupon code\nmedify air promo code\nblissy discount code\nblissy coupon code"}
            className="block min-h-[122px] w-full resize-y border-0 bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-700"
          />
          <div className="flex flex-col gap-3 border-t border-white/10 bg-[#0a111d] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <select value={country} onChange={(event) => setCountry(event.target.value)} className="h-10 min-w-44 rounded-lg border border-white/10 bg-[#0d1625] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400/30">
                <option>United Kingdom</option><option>United States</option><option>Pakistan</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option>
              </select>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 min-w-36 rounded-lg border border-white/10 bg-[#0d1625] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400/30">
                <option>English</option><option>Urdu</option><option>Arabic</option><option>French</option><option>German</option>
              </select>
              <span className={`rounded-md px-2.5 py-1.5 text-xs ${inputKeywords.length > MAX_KEYWORDS ? "bg-red-400/10 text-red-300" : "bg-white/[0.04] text-slate-500"}`}>
                {formatNumber(inputKeywords.length)} / {formatNumber(MAX_KEYWORDS)} keywords
              </span>
            </div>
            <button disabled={loading || !inputKeywords.length || inputKeywords.length > MAX_KEYWORDS} className="h-10 rounded-lg bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Fetching…" : "Get metrics"}
            </button>
          </div>
        </form>

        {error && <div className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Groups" value={formatNumber(groups.length)} helper="Detected brands" />
            <Stat label="Requested" value={formatNumber(requestedKeywords.length)} helper="Unique keywords" />
            <Stat label="Returned" value={formatNumber(results.length)} helper="After Google de-duplication" />
            <Stat label="Combined volume" value={formatNumber(totalVolume)} helper="Avg monthly searches" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-xl border border-white/10 bg-[#090f19]">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-bold text-white">Keyword groups</h3>
                <p className="mt-1 text-xs text-slate-600">Select a brand to inspect</p>
              </div>
              <div className="max-h-[620px] overflow-y-auto p-2">
                {groups.map((group) => {
                  const active = selectedGroup?.key === group.key;
                  return (
                    <button key={group.key} type="button" onClick={() => selectGroup(group)} className={`mb-1 w-full rounded-lg px-3 py-3 text-left transition ${active ? "bg-cyan-300/10 ring-1 ring-cyan-300/20" : "hover:bg-white/[0.035]"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${active ? "text-cyan-100" : "text-slate-300"}`}>{group.name}</p>
                          <p className="mt-1 text-[11px] text-slate-600">{group.requestedKeywords.length} requested · {group.results.length} returned</p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-white">{formatNumber(group.totalVolume)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="max-w-[120px] truncate text-[10px] text-slate-600">{group.topKeyword?.keyword || "No Google row"}</span>
                        <MiniTrend history={group.combinedHistory} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selectedGroup && (
              <div className="min-w-0 space-y-5">
                <div className="rounded-xl border border-white/10 bg-[#090f19]">
                  <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Selected group</p>
                      <h3 className="mt-1 text-xl font-bold text-white">{selectedGroup.name}</h3>
                    </div>
                    <div className="flex gap-5 text-right">
                      <div><p className="text-[10px] uppercase text-slate-600">Avg volume</p><p className="mt-1 text-xl font-bold text-white">{formatNumber(selectedGroup.totalVolume)}</p></div>
                      <div><p className="text-[10px] uppercase text-slate-600">Keywords</p><p className="mt-1 text-xl font-bold text-white">{selectedGroup.results.length}</p></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <TrendChart history={selectedGroup.combinedHistory} title={`${selectedGroup.name} combined monthly traffic`} />
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090f19]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Keywords</h4>
                      <p className="mt-1 text-xs text-slate-600">Click a row for full Google data</p>
                    </div>
                    <span className="text-xs text-slate-600">{country} · {language}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full text-left text-sm">
                      <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-[0.1em] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Keyword</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Competition</th><th className="px-4 py-3">Index</th><th className="px-4 py-3">Avg CPC</th><th className="px-4 py-3">Low bid</th><th className="px-4 py-3">High bid</th><th className="px-4 py-3">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {[...selectedGroup.results].sort((a, b) => Number(b.averageMonthlySearches || 0) - Number(a.averageMonthlySearches || 0)).map((row, index) => {
                          const active = selectedResult?.keyword === row.keyword;
                          return (
                            <tr key={`${row.keyword}-${index}`} onClick={() => setSelectedKeyword(row.keyword)} className={`cursor-pointer transition ${active ? "bg-cyan-300/[0.06]" : "hover:bg-white/[0.025]"}`}>
                              <td className="px-4 py-3 font-semibold text-white">{row.keyword}</td>
                              <td className="px-4 py-3 font-bold text-white">{formatNumber(row.averageMonthlySearches)}</td>
                              <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${competitionBadge(row.competition)}`}>{row.competition || "NO DATA"}</span></td>
                              <td className="px-4 py-3 text-slate-400">{row.competitionIndex ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-400">{formatMoney(row.averageCpc)}</td>
                              <td className="px-4 py-3 text-slate-400">{formatMoney(row.lowTopOfPageBid)}</td>
                              <td className="px-4 py-3 text-slate-400">{formatMoney(row.highTopOfPageBid)}</td>
                              <td className="px-4 py-3"><MiniTrend history={row.monthlySearchVolumes} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedResult && (
                  <div className="rounded-xl border border-white/10 bg-[#090f19]">
                    <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Keyword detail</p>
                        <h4 className="mt-1 text-lg font-bold text-white">{selectedResult.keyword}</h4>
                      </div>
                      <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold ${competitionBadge(selectedResult.competition)}`}>{selectedResult.competition || "NO COMPETITION DATA"}</span>
                    </div>
                    <div className="p-4">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                        <Stat label="Avg searches" value={formatNumber(selectedResult.averageMonthlySearches)} helper="12-month average" />
                        <Stat label="Comp. index" value={selectedResult.competitionIndex ?? "—"} helper="0–100" />
                        <Stat label="Avg CPC" value={formatMoney(selectedResult.averageCpc)} />
                        <Stat label="Low top bid" value={formatMoney(selectedResult.lowTopOfPageBid)} />
                        <Stat label="High top bid" value={formatMoney(selectedResult.highTopOfPageBid)} />
                        <Stat label="Latest month" value={latestPoint ? formatNumber(latestPoint.monthlySearches) : "—"} helper={latestPoint ? `${monthName(latestPoint.month)} ${latestPoint.year}` : "No history"} />
                      </div>

                      <div className="mt-4 grid gap-4 2xl:grid-cols-[1.5fr_0.7fr]">
                        <TrendChart history={selectedResult.monthlySearchVolumes} title={`${selectedResult.keyword} monthly traffic`} />
                        <div className="rounded-xl border border-white/10 bg-[#080e18] p-4">
                          <h5 className="text-sm font-bold text-white">Close variants</h5>
                          <p className="mt-1 text-xs text-slate-600">Google may combine these into one result row.</p>
                          {closeVariants.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">{closeVariants.map((variant, index) => <span key={`${variant}-${index}`} className="rounded-md border border-violet-300/15 bg-violet-300/[0.06] px-2.5 py-1.5 text-xs text-violet-200">{variant}</span>)}</div>
                          ) : <p className="mt-3 text-sm text-slate-600">No close variants returned.</p>}
                        </div>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                        <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3"><h5 className="text-sm font-bold text-white">Monthly search volume</h5></div>
                        {selectedHistory.length ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.1em] text-slate-600"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Year</th><th className="px-4 py-3 text-left">Searches</th></tr></thead>
                              <tbody className="divide-y divide-white/[0.06]">{selectedHistory.map((point, index) => <tr key={`${point.year}-${point.month}-${index}`}><td className="px-4 py-3 text-slate-300">{monthName(point.month)}</td><td className="px-4 py-3 text-slate-500">{point.year}</td><td className="px-4 py-3 font-bold text-white">{formatNumber(point.monthlySearches)}</td></tr>)}</tbody>
                            </table>
                          </div>
                        ) : <p className="p-4 text-sm text-slate-600">No monthly history returned.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-600">Group totals are calculated from Google result rows actually returned. Google can merge near-exact close variants, so returned rows may be fewer than requested keywords.</p>
        </div>
      )}
    </section>
  );
}
