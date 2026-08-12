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

const MODIFIER_SUFFIX = /\s+(?:discount code|discounts|discount|coupon code|coupons|coupon|promo code|promo|voucher code|voucher)\s*$/i;

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

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeKeyword(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function inferGroupName(keyword) {
  const cleaned = normalizeKeyword(keyword);
  const base = cleaned.replace(MODIFIER_SUFFIX, "").trim();
  return base || cleaned;
}

function parseKeywords(value) {
  const seen = new Set();
  const rows = [];

  String(value || "")
    .split(/[\n,]+/)
    .map(normalizeKeyword)
    .filter(Boolean)
    .forEach((keyword) => {
      const key = keyword.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(keyword);
      }
    });

  return rows;
}

function sortHistory(history) {
  return [...(Array.isArray(history) ? history : [])].sort((a, b) => {
    const yearDiff = Number(a.year || 0) - Number(b.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return (MONTH_ORDER[a.month] ?? 99) - (MONTH_ORDER[b.month] ?? 99);
  });
}

function combineHistories(results) {
  const buckets = new Map();

  (results || []).forEach((result) => {
    sortHistory(result.monthlySearchVolumes).forEach((item) => {
      const key = `${item.year}-${item.month}`;
      const current = buckets.get(key) || {
        year: item.year,
        month: item.month,
        monthlySearches: 0,
      };
      current.monthlySearches += Number(item.monthlySearches || 0);
      buckets.set(key, current);
    });
  });

  return sortHistory([...buckets.values()]);
}

function competitionClasses(value) {
  if (value === "HIGH") return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  if (value === "MEDIUM") return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  if (value === "LOW") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  return "border-white/10 bg-white/[0.04] text-slate-400";
}

function Sparkline({ history, className = "text-cyan-300" }) {
  const points = sortHistory(history);
  if (!points.length) return <span className="text-xs text-slate-600">No trend</span>;

  const width = 120;
  const height = 34;
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
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-32 overflow-visible" role="img" aria-label="Search trend">
      <polyline points={coords.join(" ")} fill="none" stroke="currentColor" strokeWidth="2.2" className={className} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TrendChart({ history, title = "Monthly search trend", subtitle = "Historical Google Search volume" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const points = sortHistory(history);

  if (!points.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 text-sm text-slate-500">
        Google returned no monthly search-volume history.
      </div>
    );
  }

  const width = 900;
  const height = 290;
  const padX = 54;
  const padTop = 22;
  const padBottom = 48;
  const values = points.map((item) => Number(item.monthlySearches || 0));
  const maxValue = Math.max(...values, 1);
  const magnitude = Math.pow(10, Math.max(0, String(Math.floor(maxValue)).length - 2));
  const niceMax = Math.max(10, Math.ceil(maxValue / magnitude) * magnitude);
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#09111e] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {hovered && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            <strong>{monthShort(hovered.item.month)} {hovered.item.year}</strong> · {formatNumber(hovered.item.monthlySearches)} searches
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[650px]" role="img" aria-label={title}>
          <defs>
            <linearGradient id="keywordTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick.ratio}>
              <line x1={padX} x2={padX + chartWidth} y1={tick.y} y2={tick.y} stroke="rgba(148,163,184,.14)" strokeWidth="1" />
              <text x={padX - 12} y={tick.y + 4} textAnchor="end" fill="rgb(100 116 139)" fontSize="11">{formatNumber(tick.value)}</text>
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
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text x={point.x} y={height - 17} textAnchor="middle" fill="rgb(100 116 139)" fontSize="11">{monthShort(point.item.month)}</text>
              <text x={point.x} y={height - 3} textAnchor="middle" fill="rgb(71 85 105)" fontSize="9">{String(point.item.year || "").slice(-2)}</text>
            </g>
          ))}

          {hovered && <line x1={hovered.x} x2={hovered.x} y1={padTop} y2={padTop + chartHeight} stroke="rgba(103,232,249,.45)" strokeWidth="1" strokeDasharray="4 4" />}
        </svg>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-xl font-black tracking-tight text-white">{value}</p>
      {helper && <p className="mt-1 text-[11px] leading-4 text-slate-600">{helper}</p>}
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
  const [requestedKeywords, setRequestedKeywords] = useState([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [sortKey, setSortKey] = useState("averageMonthlySearches");
  const [sortDirection, setSortDirection] = useState("desc");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResults([]);
    setRequestedKeywords([]);
    setSelectedGroupKey("");
    setSelectedKeyword("");

    const parsedKeywords = parseKeywords(keywords);
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
      setRequestedKeywords(parsedKeywords);

      const firstGroup = inferGroupName(parsedKeywords[0]).toLowerCase();
      setSelectedGroupKey(firstGroup);
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

  const groups = useMemo(() => {
    const groupMap = new Map();
    const keywordToGroup = new Map();

    requestedKeywords.forEach((keyword) => {
      const groupName = inferGroupName(keyword);
      const groupKey = groupName.toLowerCase();
      keywordToGroup.set(keyword.toLowerCase(), groupKey);

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          name: titleCase(groupName),
          requestedKeywords: [],
          results: [],
        });
      }
      groupMap.get(groupKey).requestedKeywords.push(keyword);
    });

    results.forEach((result) => {
      const resultKeyword = normalizeKeyword(result.keyword).toLowerCase();
      let groupKey = keywordToGroup.get(resultKeyword);

      if (!groupKey) {
        const closeVariants = Array.isArray(result.closeVariants) ? result.closeVariants : [];
        const matchedInput = closeVariants
          .map((variant) => normalizeKeyword(variant).toLowerCase())
          .find((variant) => keywordToGroup.has(variant));
        if (matchedInput) groupKey = keywordToGroup.get(matchedInput);
      }

      if (!groupKey) groupKey = inferGroupName(result.keyword).toLowerCase();

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          name: titleCase(inferGroupName(result.keyword)),
          requestedKeywords: [],
          results: [],
        });
      }
      groupMap.get(groupKey).results.push(result);
    });

    return [...groupMap.values()]
      .map((group) => {
        const totalVolume = group.results.reduce((sum, result) => sum + Number(result.averageMonthlySearches || 0), 0);
        const topKeyword = group.results.reduce((best, result) => {
          if (!best || Number(result.averageMonthlySearches || 0) > Number(best.averageMonthlySearches || 0)) return result;
          return best;
        }, null);
        return {
          ...group,
          totalVolume,
          topKeyword,
          combinedHistory: combineHistories(group.results),
        };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }, [requestedKeywords, results]);

  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) || groups[0] || null;

  const sortedResults = useMemo(() => {
    const rows = [...(selectedGroup?.results || [])];
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
  }, [selectedGroup, sortKey, sortDirection]);

  const selectedResult =
    selectedGroup?.results.find((result) => result.keyword === selectedKeyword) ||
    selectedGroup?.results[0] ||
    null;

  const totalSearchVolume = groups.reduce((sum, group) => sum + group.totalVolume, 0);
  const topGroup = groups[0] || null;
  const history = sortHistory(selectedResult?.monthlySearchVolumes);
  const historyValues = history.map((item) => Number(item.monthlySearches || 0));
  const peakSearches = historyValues.length ? Math.max(...historyValues) : null;
  const latestSearches = historyValues.length ? historyValues[historyValues.length - 1] : null;
  const closeVariants = Array.isArray(selectedResult?.closeVariants) ? selectedResult.closeVariants : [];

  function exportCsv() {
    if (!groups.length) return;

    const headers = [
      "Group",
      "Row type",
      "Keyword",
      "Returned keyword",
      "Average monthly traffic",
      "Competition",
      "Competition index",
      "Average CPC",
      "Low top bid",
      "High top bid",
      "Country",
      "Language",
    ];
    const rows = [headers];

    groups.forEach((group) => {
      group.requestedKeywords.forEach((keyword) => {
        const normalizedKeyword = normalizeKeyword(keyword).toLowerCase();
        const result = group.results.find((item) => {
          if (normalizeKeyword(item.keyword).toLowerCase() === normalizedKeyword) return true;
          return (item.closeVariants || []).some(
            (variant) => normalizeKeyword(variant).toLowerCase() === normalizedKeyword
          );
        });

        rows.push([
          group.name,
          "KEYWORD",
          keyword,
          result?.keyword || "",
          result?.averageMonthlySearches ?? "",
          result?.competition || "",
          result?.competitionIndex ?? "",
          result?.averageCpc ?? "",
          result?.lowTopOfPageBid ?? "",
          result?.highTopOfPageBid ?? "",
          country,
          language,
        ]);
      });

      rows.push([
        group.name,
        "GROUP TOTAL",
        "",
        "",
        group.totalVolume,
        "",
        "",
        "",
        "",
        "",
        country,
        language,
      ]);
    });

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `keyword-traffic-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function selectGroup(group) {
    setSelectedGroupKey(group.key);
    setSelectedKeyword(group.results[0]?.keyword || "");
  }

  const SortHeader = ({ field, children }) => (
    <th className="px-4 py-3">
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
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Research keyword traffic by group</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Paste coupon, discount, promo and voucher variations for multiple brands. Groups are detected automatically and each brand gets its own total traffic.
            </p>
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
                rows={6}
                placeholder={"medify air discount code\nmedify air coupon code\nmedify air promo code\n\nblissy discount code\nblissy coupon code\nblissy promo code"}
                className="min-h-[150px] w-full resize-y rounded-xl border border-white/10 bg-[#0b1422] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/5"
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
          <p className="mt-3 text-xs text-slate-600">
            Auto grouping examples: “medify air coupon code / discount / promo / voucher” → <strong className="text-slate-400">Medify Air</strong>. “blissy ...” → <strong className="text-slate-400">Blissy</strong>.
          </p>
        </form>

        {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Keyword groups" value={formatNumber(groups.length)} helper="Brands detected automatically" />
            <MetricCard label="Requested keywords" value={formatNumber(requestedKeywords.length)} helper="Unique inputs sent to Google" />
            <MetricCard label="Google result rows" value={formatNumber(results.length)} helper={requestedKeywords.length !== results.length ? "Google merged one or more close variants" : "One result row per input"} />
            <MetricCard label="Combined avg traffic" value={formatNumber(totalSearchVolume)} helper="Sum of all returned avg monthly searches" />
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-white">Export all traffic data</p>
              <p className="mt-1 text-xs text-slate-500">CSV includes every keyword row and a total row for each group.</p>
            </div>
            <button type="button" onClick={exportCsv} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
              Export CSV
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">Keyword groups</h3>
                <p className="mt-1 text-xs text-slate-500">Each card shows the total average monthly traffic for that brand group.</p>
              </div>
              {topGroup && <span className="text-xs text-slate-600">Highest group: <strong className="text-cyan-200">{topGroup.name}</strong></span>}
            </div>

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {groups.map((group) => {
                const active = selectedGroup?.key === group.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => selectGroup(group)}
                    className={`rounded-2xl border p-5 text-left transition ${active ? "border-cyan-300/35 bg-cyan-300/[0.07] shadow-lg shadow-cyan-950/20" : "border-white/10 bg-[#09111e] hover:border-white/20 hover:bg-white/[0.025]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Group</p>
                        <h4 className="mt-1 text-lg font-black text-white">{group.name}</h4>
                      </div>
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-[10px] font-black text-cyan-200">{group.requestedKeywords.length} keywords</span>
                    </div>
                    <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Total avg monthly traffic</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-white">{formatNumber(group.totalVolume)}</p>
                        <p className="mt-1 text-xs text-slate-600">{group.results.length} Google rows returned</p>
                      </div>
                      <Sparkline history={group.combinedHistory} />
                    </div>
                    {group.topKeyword && (
                      <div className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-slate-500">
                        Top keyword: <strong className="text-slate-300">{group.topKeyword.keyword}</strong> · {formatNumber(group.topKeyword.averageMonthlySearches)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedGroup && (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-[#080f1b]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-cyan-300/[0.06] to-transparent px-5 py-5 sm:px-6 lg:flex-row lg:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Selected group</p>
                  <h3 className="mt-1 text-2xl font-black text-white">{selectedGroup.name}</h3>
                  <p className="mt-2 text-xs text-slate-500">Individual keyword traffic plus combined group total.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] uppercase text-slate-600">Group traffic</p><p className="mt-1 text-lg font-black text-white">{formatNumber(selectedGroup.totalVolume)}</p></div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] uppercase text-slate-600">Requested</p><p className="mt-1 text-lg font-black text-white">{selectedGroup.requestedKeywords.length}</p></div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"><p className="text-[9px] uppercase text-slate-600">Returned</p><p className="mt-1 text-lg font-black text-white">{selectedGroup.results.length}</p></div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <TrendChart
                  history={selectedGroup.combinedHistory}
                  title={`${selectedGroup.name} — combined monthly trend`}
                  subtitle="Sum of the monthly search volumes returned for all Google rows in this group"
                />

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#09111e]">
                  <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-black text-white">Keywords inside {selectedGroup.name}</h4>
                      <p className="mt-1 text-xs text-slate-500">Click any row to inspect all Google metrics for that keyword.</p>
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
                              <td className="px-4 py-4"><div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${active ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" : "bg-slate-700"}`} /><span className="font-bold text-white">{result.keyword || "—"}</span></div></td>
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
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#09111e]">
                    <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Keyword detail</p>
                        <h4 className="mt-1 text-lg font-black text-white">{selectedResult.keyword}</h4>
                      </div>
                      <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${competitionClasses(selectedResult.competition)}`}>{selectedResult.competition || "NO COMPETITION DATA"}</span>
                    </div>

                    <div className="p-5">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <MetricCard label="Avg monthly searches" value={formatNumber(selectedResult.averageMonthlySearches)} helper="12-month average" />
                        <MetricCard label="Competition index" value={selectedResult.competitionIndex ?? "—"} helper="0–100" />
                        <MetricCard label="Average CPC" value={formatMoney(selectedResult.averageCpc)} helper="Google avg CPC" />
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
                                {history.map((item, index) => (
                                  <tr key={`${item.year}-${item.month}-${index}`}>
                                    <td className="px-5 py-3 font-semibold text-slate-300">{formatMonth(item.month)}</td>
                                    <td className="px-5 py-3 text-slate-500">{item.year ?? "—"}</td>
                                    <td className="px-5 py-3 font-black text-white">{formatNumber(item.monthlySearches)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p className="p-5 text-sm text-slate-600">No monthly history returned by Google.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-600">
            Group totals are calculated from the Google result rows actually returned. Google may merge close variants, so returned-row count can be lower than requested-keyword count.
          </p>
        </div>
      )}
    </section>
  );
}
