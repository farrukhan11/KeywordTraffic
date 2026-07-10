'use client';

import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const statusStyles = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PROCESSING: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  PAUSED: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  NOT_STARTED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    try {
      setError('');
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load projects');
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      if (!currentUser) return router.replace('/login');
      setUser(currentUser);
      fetchProjects();
    });
    return unsubscribe;
  }, [fetchProjects, router]);

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    router.replace('/login');
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" /></div>;
  }

  const totalKeywords = projects.reduce((sum, project) => sum + (project.uniqueKeywords || 0), 0);
  const completed = projects.filter((project) => project.metricsStatus === 'COMPLETED').length;
  const active = projects.filter((project) => project.metricsStatus === 'PROCESSING').length;
  const cached = projects.reduce((sum, project) => sum + (project.metricsCached || 0), 0);
  const stats = [
    ['Projects', projects.length, 'All research workspaces'],
    ['Keywords', totalKeywords.toLocaleString(), 'Unique imported terms'],
    ['Active runs', active, 'Currently processing'],
    ['Cached results', cached.toLocaleString(), 'API calls avoided'],
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-slate-950 text-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 font-bold">K</span>
          <div><p className="font-semibold">Keyword Traffic</p><p className="text-xs text-slate-400">Research workspace</p></div>
        </div>
        <nav className="space-y-2 p-4 text-sm">
          <Link href="/dashboard" className="block rounded-xl bg-white/10 px-4 py-3 font-medium">Overview</Link>
          <Link href="/dashboard/projects" className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white">Projects</Link>
          <Link href="/dashboard/projects/new" className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white">New project</Link>
          <Link href="/dashboard/settings/google-ads" className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white">Google Ads</Link>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            <div><p className="text-sm text-slate-500">Workspace</p><h1 className="text-xl font-semibold">Dashboard overview</h1></div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block"><p className="text-sm font-medium">{user?.displayName || 'Account'}</p><p className="text-xs text-slate-500">{user?.email}</p></div>
              <button onClick={handleSignOut} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Sign out</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <section className="flex flex-col justify-between gap-5 rounded-3xl bg-slate-950 p-7 text-white md:flex-row md:items-center">
            <div><p className="text-sm text-blue-300">Keyword research automation</p><h2 className="mt-2 text-3xl font-bold">Turn store lists into traffic reports</h2><p className="mt-2 max-w-2xl text-slate-400">Import keywords, run Google Ads historical metrics and keep every result organized by market.</p></div>
            <Link href="/dashboard/projects/new" className="shrink-0 rounded-xl bg-blue-500 px-5 py-3 text-center font-semibold hover:bg-blue-400">Create project</Link>
          </section>

          {error && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value, note]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_.7fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h3 className="font-semibold">Recent projects</h3><p className="text-sm text-slate-500">Latest keyword research activity</p></div><Link href="/dashboard/projects" className="text-sm font-medium text-blue-600">View all</Link></div>
              {projects.length === 0 ? (
                <div className="px-6 py-14 text-center"><p className="font-medium">No projects yet</p><p className="mt-1 text-sm text-slate-500">Create your first project and import a store keyword list.</p><Link href="/dashboard/projects/new" className="mt-5 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Create project</Link></div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projects.slice(0, 7).map((project) => {
                    const status = project.metricsStatus || 'NOT_STARTED';
                    const progress = project.metricsTotal ? Math.min(100, Math.round(((project.metricsProcessed || 0) / project.metricsTotal) * 100)) : 0;
                    return <Link key={project._id} href={`/dashboard/projects/${project._id}`} className="block px-6 py-4 hover:bg-slate-50"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-medium">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.uniqueKeywords || 0} keywords · {project.targetCountryName || project.targetCountryCode}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status] || statusStyles.NOT_STARTED}`}>{status.replaceAll('_', ' ')}</span></div>{status === 'PROCESSING' && <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${progress}%` }} /></div>}</Link>;
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-semibold">Setup checklist</h3><div className="mt-5 space-y-4 text-sm"><div className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">✓</span><span>Create your account</span></div><div className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs text-blue-700">2</span><Link href="/dashboard/settings/google-ads" className="hover:text-blue-600">Connect Google Ads</Link></div><div className="flex gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs text-slate-600">3</span><Link href="/dashboard/projects/new" className="hover:text-blue-600">Import your keywords</Link></div></div></div>
              <div className="rounded-2xl bg-blue-600 p-6 text-white"><p className="text-sm text-blue-100">Completed projects</p><p className="mt-2 text-4xl font-bold">{completed}</p><p className="mt-3 text-sm text-blue-100">Reports ready to review and export.</p></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
