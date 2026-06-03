"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfcfd] px-4 text-zinc-900 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 glow-mesh pointer-events-none z-0" />
      <div className="absolute inset-0 mesh-grid opacity-[0.4] pointer-events-none z-0" />

      <div className="w-full max-w-md card-premium p-8 rounded-2xl relative z-10 shadow-xl border border-zinc-200 bg-white">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black tracking-tight text-zinc-900 inline-block">
            StudyMikey<span className="text-blue-600">.</span>
          </Link>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Authentication Vault
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Corporate / Academic Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="input-premium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-premium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-2"
          >
            {loading ? "Signing in..." : "Access Credentials Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white px-3.5 text-zinc-400">
              Or OAuth Secure
            </span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Cloud Authenticate
        </button>

        <p className="mt-8 text-center text-sm text-zinc-500 font-semibold">
          Don&apos;t have credentials?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 hover:underline">
            Register Account
          </Link>
        </p>

        {/* Demo Mode credentials checklist */}
        <div className="mt-6 border-t border-zinc-100 pt-5 text-[10px] font-bold text-zinc-400">
          <div className="uppercase tracking-widest text-zinc-500 mb-2">Demo Credentials:</div>
          <div className="space-y-1.5 font-mono text-zinc-400">
            <div>
              🧑‍🎓 Student: <span className="text-zinc-600">student@studymikey.com</span> (pass: <span className="text-zinc-600">password123</span>)
            </div>
            <div>
              🧑‍🏫 Teacher: <span className="text-zinc-600">teacher@nu.edu.pk</span> (pass: <span className="text-zinc-600">password123</span>)
            </div>
            <div>
              💼 Recruiter: <span className="text-zinc-600">recruiter@studymikey.com</span> (pass: <span className="text-zinc-600">password123</span>)
            </div>
            <div>
              🛡️ Admin: <span className="text-zinc-600">admin@studymikey.com</span> (pass: <span className="text-zinc-600">admin123</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
