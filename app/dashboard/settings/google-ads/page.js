'use client';

import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import GoogleAdsSettings from '@/components/GoogleAdsSettings';

export default function GoogleAdsSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      if (!u) {
        window.location.href = '/login';
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <span className="text-gray-400">/</span>
              <Link href="/dashboard/settings/google-ads" className="text-gray-900 font-medium">Google Ads Settings</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm">{user.displayName || user.email}</span>
              <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Ads Settings</h1>
          <p className="mt-2 text-gray-600">Connect your Google Ads account to fetch real keyword metrics</p>
        </div>

        <GoogleAdsSettings />
      </main>
    </div>
  );
}
