'use client';

import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!getFirebaseAuth().currentUser) return;
    try {
      const token = await getFirebaseAuth().currentUser.getIdToken();
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        fetchStats();
      }
    });
    return unsub;
  }, [router, fetchStats]);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalKeywords = projects.reduce((sum, p) => sum + (p.uniqueKeywords || 0), 0);
  const completedProjects = projects.filter((p) => p.metricsStatus === 'COMPLETED').length;
  const processingProjects = projects.filter((p) => p.metricsStatus === 'PROCESSING').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Keyword Research Platform</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Welcome to your keyword research dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Projects</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{projects.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Keywords</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{totalKeywords}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Processing</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{processingProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Completed Metrics</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{completedProjects}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/projects/new"
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Project
              </Link>
              <Link
                href="/dashboard/settings/google-ads"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Connect Google Ads
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-500">No projects yet. Create your first project to get started!</p>
            ) : (
              <ul className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <li key={project._id}>
                    <Link
                      href={`/dashboard/projects/${project._id}`}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.uniqueKeywords || 0} keywords</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        project.metricsStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        project.metricsStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {project.metricsStatus?.replace(/_/g, ' ') || 'No Metrics'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
