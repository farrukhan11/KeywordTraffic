'use client';

import { useState } from 'react';

export default function KeywordImport({ projectId, onImportComplete }) {
  const [mode, setMode] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePasteImport = async () => {
    if (!pasteText.trim()) return;
    setImporting(true);
    setError(null);
    setResult(null);

    const keywords = pasteText.split('\n').map((k) => k.trim()).filter(Boolean);

    try {
      const res = await fetch(`/api/projects/${projectId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, source: 'PASTE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setPasteText('');
      onImportComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const Papa = (await import('papaparse')).default;
      const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
      const keywords = parsed.data.map((row) => row[0]?.trim()).filter(Boolean);

      if (keywords.length === 0) {
        throw new Error('No keywords found in the CSV file');
      }

      const res = await fetch(`/api/projects/${projectId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, source: 'CSV' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      onImportComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Keywords</h3>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMode('paste')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            mode === 'paste'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Paste Keywords
        </button>
        <button
          onClick={() => setMode('csv')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            mode === 'csv'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Upload CSV
        </button>
      </div>

      {mode === 'paste' ? (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Enter one keyword per line..."
            rows={8}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={handlePasteImport}
            disabled={importing || !pasteText.trim()}
            className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Keywords'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            disabled={importing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-500">Upload a CSV file with one keyword per line or a single column.</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            Imported {result.imported} keywords. {result.duplicates > 0 && `${result.duplicates} duplicates skipped.`}
          </p>
        </div>
      )}
    </div>
  );
}
