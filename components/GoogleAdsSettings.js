'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';

export default function GoogleAdsSettings() {
  const [connection, setConnection] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error')) {
        window.history.replaceState({}, '', '/dashboard/settings/google-ads');
        return 'Connection failed. Please try again.';
      }
    }
    return null;
  });
  const [success, setSuccess] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('connected') === 'true') {
        window.history.replaceState({}, '', '/dashboard/settings/google-ads');
        return 'Google Ads connected successfully!';
      }
    }
    return null;
  });

  const getToken = useCallback(async () => {
    if (!getFirebaseAuth().currentUser) return null;
    return getFirebaseAuth().currentUser.getIdToken();
  }, []);

  const fetchConnection = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/google-ads/connection', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConnection(data.connection);
    } catch (err) {
      setError('Failed to load connection status');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch('/api/google-ads/connection', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setConnection(data.connection);
      } catch {
        if (!cancelled) setError('Failed to load connection status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [getToken]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/google-ads/oauth/start', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Failed to initiate connection');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Ads? Previously fetched metrics will be preserved.')) return;
    try {
      const token = await getToken();
      await fetch('/api/google-ads/connection/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnection(null);
      setCustomers([]);
      setSuccess('Google Ads disconnected.');
    } catch (err) {
      setError('Failed to disconnect');
    }
  };

  const handleLoadCustomers = async () => {
    setLoadingCustomers(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/google-ads/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/google-ads/customers/select', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: customer.customerId, customerName: customer.name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConnection((prev) => ({
        ...prev,
        selectedCustomerId: customer.customerId,
        selectedCustomerName: customer.name || customer.customerId,
        selectedLoginCustomerId: data.connection.selectedLoginCustomerId,
      }));
      setSuccess('Customer account selected!');
      setCustomers([]);
    } catch (err) {
      setError(err.message || 'Failed to select customer');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const isConnected = connection && connection.status === 'connected';
  const hasSelectedCustomer = connection?.selectedCustomerId;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Google Ads Connection</h3>

        {!isConnected ? (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Why connect Google Ads?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Access real Google Keyword Planner historical metrics</li>
                <li>Get accurate average monthly search volumes</li>
                <li>View competition levels and bid estimates</li>
                <li>See monthly search trends for each keyword</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Required permissions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Google Ads API access (read-only for keyword planning)</li>
                <li>OAuth scope: adwords</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <p className="text-sm text-gray-600">
                Your Google OAuth credentials are encrypted at rest using AES-256-GCM.
                We never expose refresh tokens to the browser or store them in localStorage.
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Connect Google Ads'}
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </dd>
              </div>
              {connection.googleAccountEmail && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Google Account</dt>
                  <dd className="mt-1 text-sm text-gray-900">{connection.googleAccountEmail}</dd>
                </div>
              )}
              {hasSelectedCustomer && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Selected Customer</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {connection.selectedCustomerName || connection.selectedCustomerId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatCustomerId(connection.selectedCustomerId)}</dd>
                  </div>
                  {connection.selectedLoginCustomerId && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Login Customer ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatCustomerId(connection.selectedLoginCustomerId)}</dd>
                    </div>
                  )}
                </>
              )}
              {connection.lastSuccessfulAuthAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Authenticated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(connection.lastSuccessfulAuthAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-4">
              {!hasSelectedCustomer && (
                <button
                  onClick={handleLoadCustomers}
                  disabled={loadingCustomers}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingCustomers ? 'Loading...' : 'Select Customer Account'}
                </button>
              )}
              {hasSelectedCustomer && (
                <button
                  onClick={handleLoadCustomers}
                  disabled={loadingCustomers}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingCustomers ? 'Loading...' : 'Change Account'}
                </button>
              )}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {connecting ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Selection */}
      {customers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Google Ads Account</h3>
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.customerId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  customer.customerId === connection?.selectedCustomerId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.name || `Customer ${formatCustomerId(customer.customerId)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {formatCustomerId(customer.customerId)}
                    </p>
                    {customer.currencyCode && (
                      <p className="text-xs text-gray-400">
                        Currency: {customer.currencyCode} | Timezone: {customer.timeZone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {customer.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    )}
                    {customer.customerId === connection?.selectedCustomerId && (
                      <span className="text-blue-600 text-sm font-medium">Selected</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCustomerId(id) {
  if (!id) return '';
  const clean = id.replace(/-/g, '');
  if (clean.length !== 10) return id;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
}
