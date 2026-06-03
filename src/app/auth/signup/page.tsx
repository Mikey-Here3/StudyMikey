"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUserAction } from "@/lib/actions/auth-actions";
import { signIn } from "next-auth/react";

type PlatformRole = "STUDENT" | "TEACHER" | "RECRUITER";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformRole>("STUDENT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerUserAction({
        username,
        email,
        passwordHash: password,
        role,
      });

      if (!res.success) {
        setError(res.error || "Failed to register account.");
      } else {
        setSuccess(true);
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (!loginRes?.error) {
          router.push("/");
          router.refresh();
        } else {
          router.push("/auth/login");
        }
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
      <div className="absolute inset-0 mesh-grid opacity-[0.2] pointer-events-none z-0" />

      <div className="w-full max-w-md card-premium p-8 rounded-2xl relative z-10 shadow-xl border border-zinc-200 bg-white">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black tracking-tight text-zinc-900 inline-block">
            StudyMikey<span className="text-blue-600">.</span>
          </Link>
          <p className="mt-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Registration Core
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-3.5 text-xs font-bold text-green-600">
            ✓ Registration successful! Synchronizing session...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Select Profile Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["STUDENT", "TEACHER", "RECRUITER"] as PlatformRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border py-2.5 text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                    role === r
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {r.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Username (URL-friendly Slug)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. janesmith"
              className="input-premium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Email Address
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
            disabled={loading || success}
            className="btn-primary w-full py-3.5 mt-4"
          >
            {loading ? "Creating..." : "Build Platform Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 font-semibold">
          Already registered?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 hover:underline">
            Access Vault
          </Link>
        </p>
      </div>
    </div>
  );
}
