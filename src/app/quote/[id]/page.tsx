"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuoteResult from "@/components/QuoteResult";
import { supabase } from "@/lib/supabase";
import type { JobType, Quote } from "@/lib/types";

type SavedQuote = {
  id: string;
  customerName: string;
  jobType: JobType;
  jobNotes: string;
  createdAt: string;
  quote: Quote;
  user_id: string;
};

export default function SavedQuotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuote() {
      setIsLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (quoteError) {
        setError(quoteError.message);
        setSavedQuote(null);
      } else {
        setSavedQuote(data as SavedQuote | null);
      }

      setIsLoading(false);
    }

    void loadQuote();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading quote…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-3xl font-black">Could not load quote</h1>

          <p className="mt-3 leading-7 text-slate-400">{error}</p>

          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            Back to quote history
          </a>
        </div>
      </main>
    );
  }

  if (!savedQuote) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-3xl">
            📄
          </div>

          <h1 className="mt-6 text-3xl font-black">Quote not found</h1>

          <p className="mt-3 leading-7 text-slate-400">
            This quote may have been deleted, or it does not belong to your
            account.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            Back to quote history
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-950 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black">
              Q
            </div>

            <div>
              <p className="font-bold">QuoteMate AI</p>
              <p className="text-xs text-slate-400">Saved cloud quote</p>
            </div>
          </a>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to history
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <QuoteResult
          quote={savedQuote.quote}
          customerName={savedQuote.customerName}
          onReset={() => {
            window.location.href = "/";
          }}
        />
      </section>
    </main>
  );
}