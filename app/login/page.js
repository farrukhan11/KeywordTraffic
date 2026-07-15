import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import SiteHeader from "../components/SiteHeader";

async function loginAction(formData) {
  "use server";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid-credentials");
    }
    throw error;
  }
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "invalid-credentials";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center p-6">
        <form action={loginAction} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-slate-500">Sign in to manage keyword projects.</p>

          {hasError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Email ya password galat hai. Admin account ke liye .env.local credentials check karein.
            </div>
          )}

          <label className="mt-6 block text-sm font-semibold text-slate-800">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <label className="mt-4 block text-sm font-semibold text-slate-800">Password</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">
            Sign in
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            No account?{" "}
            <Link className="font-semibold text-indigo-600" href="/register">
              Register
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
