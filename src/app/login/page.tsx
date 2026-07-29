"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          throw signupError;
        }

        setMessage(
          "Account created. Check your email and confirm your account before logging in.",
        );
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) {
          throw loginError;
        }

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setMessage("");
    setError("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md">
        <a href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/30">
            Q
          </div>

          <div>
            <p className="text-xl font-bold text-white">QuoteMate AI</p>
            <p className="text-xs text-slate-400">Built for Australian tradies</p>
          </div>
        </a>

        <section className="rounded-3xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {mode === "login"
              ? "Log in to QuoteMate"
              : "Start using QuoteMate"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "Access your quotes and continue managing your jobs."
              : "Create an account to save and manage your quotes online."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              {mode === "login"
                ? "Don’t have an account?"
                : "Already have an account?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}