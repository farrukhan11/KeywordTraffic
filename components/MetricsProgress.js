'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';

export default function MetricsProgress({ projectId, onMetricsComplete }) {
  const [status, setStatus] = useState(null);
  const [lockToken, setLockToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const pollingRef = useRef(null);
  const processBatchRef = useRef(null);

  const getToken = useCallback(async () => {
    if (!getFirebaseAuth().currentUser) return null;
    return getFirebaseAuth().currentUser.getIdToken();
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/metrics/status?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      // Silently fail on poll
    }
  }, [projectId, getToken]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await fetchStatus();
    }
    load();
    return () => { cancelled = true; };
  }, [fetchStatus]);

  useEffect(() => {
    if (processing && !status?.metricsCompletedAt) {
      pollingRef.current = setInterval(fetchStatus, 3000);
      return () => clearInterval(pollingRef.current);
    }
    return () => clearInterval(pollingRef.current);
  }, [processing, status?.metricsCompletedAt, fetchStatus]);

  const handleStart = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/metrics/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, forceRefresh }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLockToken(data.lockToken);
      setProcessing(true);
      fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBatch = async () => {
    if (!lockToken) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/metrics/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, lockToken }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.completed) {
        setProcessing(false);
        setLockToken(null);
        onMetricsComplete?.();
      }

      fetchStatus();
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processBatchRef.current = handleProcessBatch;
  });

  const handlePause = async () => {
    if (!lockToken) return;
    try {
      const token = await getToken();
      await fetch('/api/metrics/pause', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, lockToken }),
      });
      setProcessing(false);
      setLockToken(null);
      fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (processing && status && !status.metricsCompletedAt) {
      const timer = setTimeout(() => processBatchRef.current?.(), 1000);
      return () => clearTimeout(timer);
    }
  }, [processing, status]);

  if (!status) return null;

  const metricsStatus = status.metricsStatus || 'NOT_STARTED';
  const total = status.metricsTotal || 0;
  const processed = status.metricsProcessed || 0;
  const succeeded = status.metricsSucceeded || 0;
  const failed = status.metricsFailed || 0;
  const cached = status.metricsCached || 0;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  const remaining = Math.max(0, total - processed);

  const statusColors = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Metrics Processing</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[metricsStatus] || statusColors.NOT_STARTED}`}>
          {metricsStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {metricsStatus === 'NOT_STARTED' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Fetch real Google Keyword Planner historical metrics for this project.
            {total > 0 && ` This project has ${total} unique keywords.`}
          </p>
          <button
            onClick={() => handleStart(false)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Fetch Google Metrics'}
          </button>
        </div>
      )}

      {(metricsStatus === 'PROCESSING' || metricsStatus === 'COMPLETED' || metricsStatus === 'FAILED') && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Keywords</p>
              <p className="text-lg font-semibold text-gray-900">{total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cached</p>
              <p className="text-lg font-semibold text-green-600">{cached}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Processed</p>
              <p className="text-lg font-semibold text-blue-600">{processed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-lg font-semibold text-orange-600">{remaining}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Succeeded</p>
              <p className="text-lg font-semibold text-green-600">{succeeded}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-red-600">{failed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-gray-900">{progress}%</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {status.metricsLastError && (
            <p className="text-sm text-red-600 mb-4">Last error: {status.metricsLastError}</p>
          )}

          {status.metricsCompletedAt && (
            <p className="text-sm text-gray-500 mb-4">
              Completed: {new Date(status.metricsCompletedAt).toLocaleString()}
            </p>
          )}

          <div className="flex space-x-3">
            {metricsStatus === 'PROCESSING' && (
              <>
                <button
                  onClick={handlePause}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Pause
                </button>
                <button
                  onClick={handleProcessBatch}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Next Batch'}
                </button>
              </>
            )}

            {metricsStatus === 'COMPLETED' && (
              <button
                onClick={() => handleStart(true)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50"
              >
                Force Refresh All
              </button>
            )}

            {metricsStatus === 'FAILED' && (
              <>
                <button
                  onClick={() => handleStart(false)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Retrying...' : 'Retry'}
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/settings/google-ads'}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  Reconnect Google Ads
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
