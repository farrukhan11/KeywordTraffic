"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter(); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setLoading(true);setError("");const form=new FormData(e.currentTarget);const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(form))});const data=await res.json();setLoading(false);if(!res.ok)return setError(data.error);router.push("/login");}
  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold">Create account</h1><p className="mt-2 text-slate-500">MongoDB-backed account with secure password hashing.</p>{error&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="mt-6 block text-sm font-semibold">Name</label><input name="name" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/><label className="mt-4 block text-sm font-semibold">Email</label><input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/><label className="mt-4 block text-sm font-semibold">Password</label><input name="password" type="password" minLength="8" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/><button disabled={loading} className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-60">{loading?"Creating...":"Create account"}</button><p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-indigo-600" href="/login">Login</Link></p></form></main>;
}
