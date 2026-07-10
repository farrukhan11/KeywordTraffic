'use client';

import { useState } from 'react';

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="text-gray-400 ml-1">&#8597;</span>;
  return <span className="text-blue-600 ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
}

export default function KeywordResultsTable({ keywords, projectId, metricsMap }) {
  const [sortField, setSortField] = useState('averageMonthlySearches');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    const metricA = metricsMap?.[a.normalizedKeyword];
    const metricB = metricsMap?.[b.normalizedKeyword];

    const getVal = (m, field) => {
      if (!m) return field === 'competition' ? 'ZZZ' : -1;
      return m[field] ?? (field === 'competition' ? 'ZZZ' : -1);
    };

    let valA = getVal(metricA, sortField);
    let valB = getVal(metricB, sortField);

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const filteredKeywords = filterStatus === 'ALL'
    ? sortedKeywords
    : sortedKeywords.filter((kw) => {
        const metric = metricsMap?.[kw.normalizedKeyword];
        if (filterStatus === 'HAS_DATA') return metric && metric.averageMonthlySearches != null;
        if (filterStatus === 'NO_DATA') return !metric || metric.averageMonthlySearches == null;
        if (filterStatus === 'CACHED') return metric?.source === 'CACHED';
        return true;
      });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Keywords with Metrics ({filteredKeywords.length})
        </h3>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="ALL">All Keywords</option>
          <option value="HAS_DATA">Has Metrics Data</option>
          <option value="NO_DATA">No Metrics Data</option>
          <option value="CACHED">Cached Only</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('averageMonthlySearches')}
              >
                Avg Monthly Searches<SortIcon field="averageMonthlySearches" sortField={sortField} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('competition')}
              >
                Competition<SortIcon field="competition" sortField={sortField} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('competitionIndex')}
              >
                Competition Index<SortIcon field="competitionIndex" sortField={sortField} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lowTopOfPageBidMicros')}
              >
                Low Bid (micros)<SortIcon field="lowTopOfPageBidMicros" sortField={sortField} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('highTopOfPageBidMicros')}
              >
                High Bid (micros)<SortIcon field="highTopOfPageBidMicros" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Fetched</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKeywords.map((keyword) => {
              const metric = metricsMap?.[keyword.normalizedKeyword];
              return (
                <tr key={keyword._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={keyword.normalizedKeyword}>
                    {keyword.normalizedKeyword}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric?.averageMonthlySearches != null ? metric.averageMonthlySearches.toLocaleString() : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric?.competition || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric?.competitionIndex != null ? metric.competitionIndex.toFixed(3) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric?.lowTopOfPageBidMicros != null ? metric.lowTopOfPageBidMicros.toLocaleString() : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric?.highTopOfPageBidMicros != null ? metric.highTopOfPageBidMicros.toLocaleString() : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      metric ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {metric ? 'Data Available' : 'No Data'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {metric?.source === 'GOOGLE_ADS_API' ? 'Google Ads' : metric?.source === 'CACHED' ? 'Cached' : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {metric?.fetchedAt ? new Date(metric.fetchedAt).toLocaleDateString() : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {metric?.monthlySearchVolumes?.length > 0 ? (
                      <button
                        onClick={() => setExpandedRow(expandedRow === keyword._id ? null : keyword._id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {expandedRow === keyword._id ? 'Hide' : 'View'} ({metric.monthlySearchVolumes.length} months)
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredKeywords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No keywords match the current filter.</p>
        </div>
      )}

      {expandedRow && (
        <MonthlySearchHistory
          keyword={keywords.find((k) => k._id === expandedRow)}
          metric={metricsMap?.[keywords.find((k) => k._id === expandedRow)?.normalizedKeyword]}
          onClose={() => setExpandedRow(null)}
        />
      )}
    </div>
  );
}

function MonthlySearchHistory({ keyword, metric, onClose }) {
  if (!metric?.monthlySearchVolumes?.length) return null;

  const volumes = metric.monthlySearchVolumes;
  const maxSearches = Math.max(...volumes.map((v) => v.monthlySearches));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Monthly Search History: {keyword?.normalizedKeyword}
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <div className="grid grid-cols-12 gap-1 items-end" style={{ height: '120px' }}>
        {volumes.map((v, i) => {
          const height = maxSearches > 0 ? (v.monthlySearches / maxSearches) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-full bg-blue-200 rounded-t"
                style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px' }}
                title={`${monthNames[v.month - 1]} ${v.year}: ${v.monthlySearches.toLocaleString()}`}
              ></div>
              <span className="text-[10px] text-gray-500 mt-1">{monthNames[v.month - 1]}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {volumes.map((v) => `${monthNames[v.month - 1]} ${v.year}: ${v.monthlySearches.toLocaleString()}`).join(' | ')}
      </div>
    </div>
  );
}
