import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center p-6"><form action={async formData => { "use server"; await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/dashboard" }); }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold">Welcome back</h1><p className="mt-2 text-slate-500">Sign in to manage keyword projects.</p><label className="mt-6 block text-sm font-semibold">Email</label><input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/><label className="mt-4 block text-sm font-semibold">Password</label><input name="password" type="password" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"/><button className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">Sign in</button><p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-semibold text-indigo-600" href="/register">Register</Link></p></form></main>;
}
