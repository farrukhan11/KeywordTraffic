"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setError(data.error);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-950">Create account</h1>
          <p className="mt-2 text-slate-500">MongoDB-backed account with secure password hashing.</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <label className="mt-6 block text-sm font-semibold text-slate-800">Name</label>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <label className="mt-4 block text-sm font-semibold text-slate-800">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <label className="mt-4 block text-sm font-semibold text-slate-800">Password</label>
          <input
            name="password"
            type="password"
            minLength="8"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link className="font-semibold text-indigo-600" href="/login">
              Login
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
