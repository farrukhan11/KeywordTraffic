'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, NETWORK_OPTIONS } from '@/utils/countries';

export default function NewProjectPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    language: '',
    network: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getFirebaseAuth().currentUser.getIdToken();
      const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === formData.country);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === formData.language);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          country: formData.country,
          countryName: countryObj?.name || formData.country,
          language: formData.language,
          languageName: langObj?.name || formData.language,
          network: formData.network,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      window.location.href = `/dashboard/projects/${data.project._id}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              <Link href="/dashboard/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">New Project</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.displayName || user?.email}</span>
              <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Project</h2>
          <p className="mt-2 text-gray-600">Set up your keyword research project</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project description" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Target Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Target Country *</label>
                <select id="country" name="country" required value={formData.country} onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a country</option>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                <select id="language" name="language" required value={formData.language} onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a language</option>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Network Settings</h3>
            <div className="space-y-4">
              {NETWORK_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input type="radio" id={option.value} name="network" value={option.value}
                    checked={formData.network === option.value} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor={option.value} className="ml-3 block text-sm font-medium text-gray-700">{option.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/projects" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
