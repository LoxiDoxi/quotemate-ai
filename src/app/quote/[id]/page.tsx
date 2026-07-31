"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuote() {
      setIsLoading(true);
      setError("");

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let user = session?.user ?? null;


      // Give Supabase time to restore session
      if (!user) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession();

        user = retrySession?.user ?? null;
      }


      if (!user) {
        setError(
          "Your session could not be loaded. Please refresh and try again."
        );
        setIsLoading(false);
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


    if (params.id) {
      loadQuote();
    }

  }, [params.id]);


  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Loading quote…
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">

          <h1 className="mt-6 text-3xl font-black">
            Could not load quote
          </h1>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold"
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

        <div className="text-center">

          <h1 className="text-3xl font-black">
            Quote not found
          </h1>

          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold"
          >
            Back to history
          </a>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-100">

      <header className="border-b border-slate-200 bg-slate-950">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <div className="text-white">
            <p className="font-bold">
              QuoteMate AI
            </p>

            <p className="text-xs text-slate-400">
              Saved cloud quote
            </p>
          </div>


          <a
            href="/dashboard"
            className="rounded-xl bg-white/10 px-4 py-2 text-white"
          >
            Back to history
          </a>

        </div>

      </header>


      <section className="mx-auto max-w-5xl px-6 py-12">

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