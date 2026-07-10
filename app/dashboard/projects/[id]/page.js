'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import KeywordImport from '@/components/KeywordImport';
import MetricsProgress from '@/components/MetricsProgress';
import KeywordResultsTable from '@/components/KeywordResultsTable';

export default function ProjectDetailPage({ params }) {
  const [projectId, setProjectId] = useState(null);
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [metricsMap, setMetricsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  const getToken = useCallback(async () => {
    if (!getFirebaseAuth().currentUser) return null;
    return getFirebaseAuth().currentUser.getIdToken();
  }, []);

  const fetchProject = useCallback(async () => {
    if (!projectId || !getFirebaseAuth().currentUser) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.project) setProject(data.project);
      if (data.keywords) setKeywords(data.keywords);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken]);

  const fetchMetrics = useCallback(async () => {
    if (!projectId || !getFirebaseAuth().currentUser) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        if (data.metrics) {
          data.metrics.forEach((m) => {
            map[m.normalizedKeyword] = m;
          });
        }
        setMetricsMap(map);
      }
    } catch {
      // Handle silently
    }
  }, [projectId, getToken]);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      if (!u) {
        window.location.href = '/login';
      } else {
        setUser(u);
        fetchProject();
        fetchMetrics();
      }
    });
    return unsub;
  }, [fetchProject, fetchMetrics]);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    window.location.href = '/login';
  };

  const handleImportComplete = () => {
    fetchProject();
    fetchMetrics();
  };

  const handleMetricsComplete = () => {
    fetchProject();
    fetchMetrics();
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/settings/google-ads" className="text-sm text-blue-600 hover:text-blue-800">
                Google Ads Settings
              </Link>
              <span className="text-gray-700">{user?.displayName || user?.email}</span>
              <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
              <p className="mt-2 text-gray-600">{project.description || 'No description provided'}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              project.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Keywords</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{project.totalKeywords || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Unique Keywords</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{project.uniqueKeywords || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Duplicate Keywords</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{project.duplicateKeywords || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Metrics Collected</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{Object.keys(metricsMap).length}</p>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Target Country</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.targetCountryName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Language</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.languageName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Network</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.network}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Keyword Import */}
        <div className="mb-8">
          <KeywordImport projectId={projectId} onImportComplete={handleImportComplete} />
        </div>

        {/* Metrics Progress */}
        {(project.uniqueKeywords || 0) > 0 && (
          <div className="mb-8">
            <MetricsProgress projectId={projectId} onMetricsComplete={handleMetricsComplete} />
          </div>
        )}

        {/* Keywords Table with Metrics */}
        {(keywords.length > 0 || Object.keys(metricsMap).length > 0) && (
          <div className="mb-8">
            <KeywordResultsTable
              keywords={keywords}
              projectId={projectId}
              metricsMap={metricsMap}
            />
          </div>
        )}
      </main>
    </div>
  );
}
