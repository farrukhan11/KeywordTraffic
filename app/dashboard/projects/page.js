'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function ProjectsPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
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
        window.location.href = '/login';
      } else {
        setUser(u);
        fetchProjects();
      }
    });
    return unsub;
  }, [fetchProjects]);

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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
            <p className="mt-2 text-gray-600">Manage your keyword research projects</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/settings/google-ads"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Google Ads Settings
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Project
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Project List</h3>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900 truncate">{project.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          project.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        {project.metricsStatus === 'PROCESSING' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Fetching Metrics
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{project.targetCountryName}</span>
                        <span>{project.languageName}</span>
                        <span>{project.network}</span>
                        <span>{project.uniqueKeywords || 0} keywords</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-400">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/projects/${project._id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
