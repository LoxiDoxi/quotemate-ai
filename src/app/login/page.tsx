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
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        console.log("FULL LOGIN RESPONSE:", data);

        if (loginError) {
          throw loginError;
        }

        window.location.href = "/";
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
          <img
            src="/logo.png"
            alt="QuoteMate AI"
            className="h-12 w-12 rounded-2xl object-contain"
          />

          <div>
            <p className="text-xl font-bold text-white">
              QuoteMate AI
            </p>
            <p className="text-xs text-slate-400">
              Built for Australian tradies
            </p>
          </div>
        </a>

        <section className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            {mode === "login"
              ? "Log in to QuoteMate"
              : "Start using QuoteMate"}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {mode === "login"
              ? "Access your quotes and continue managing your jobs."
              : "Create an account to save and manage your quotes online."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full rounded-xl border px-4 py-3 text-slate-950"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                disabled={isLoading}
                className="w-full rounded-xl border px-4 py-3 text-slate-950"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Log in"
                : "Create account"}
            </button>

          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm font-bold text-blue-600"
            >
              {mode === "login"
                ? "Create an account"
                : "Log in instead"}
            </button>
          </div>

        </section>
      </div>
    </main>
  );
}