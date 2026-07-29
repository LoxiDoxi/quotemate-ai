"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function DashboardPage() {
  const router = useRouter();

  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuotes() {
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

      const { data, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (quotesError) {
        setError(quotesError.message);
        setQuotes([]);
      } else {
        setQuotes((data ?? []) as SavedQuote[]);
      }

      setIsLoading(false);
    }

    void loadQuotes();
  }, [router]);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return quotes;

    return quotes.filter((savedQuote) => {
      return (
        savedQuote.customerName.toLowerCase().includes(query) ||
        savedQuote.jobType.toLowerCase().includes(query) ||
        savedQuote.quote.title.toLowerCase().includes(query)
      );
    });
  }, [quotes, search]);

  async function deleteQuote(id: string) {
    const confirmed = window.confirm(
      "Delete this quote? This cannot be undone.",
    );

    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setQuotes((current) => current.filter((quote) => quote.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black shadow-lg shadow-blue-600/30">
              Q
            </div>

            <div>
              <p className="font-bold">QuoteMate AI</p>
              <p className="text-xs text-slate-400">Cloud quote history</p>
            </div>
          </a>

          <div className="flex flex-wrap gap-2">
            <a
              href="/settings"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Settings
            </a>

            <a
              href="/"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
            >
              New quote
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">
              Saved quotes
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Quote history
            </h1>

            <p className="mt-3 text-slate-300">
              Quotes saved securely to your account.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total saved
            </p>
            <p className="mt-1 text-3xl font-black">{quotes.length}</p>
          </div>
        </div>

        <div className="mt-8">
          <label htmlFor="search" className="sr-only">
            Search quotes
          </label>

          <input
            id="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, trade or job..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <p className="text-slate-300">Loading your quotes...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/15 text-3xl">
              📄
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              {quotes.length === 0 ? "No saved quotes yet" : "No quotes found"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              {quotes.length === 0
                ? "Generate your first quote and it will appear here automatically."
                : "Try searching with a different customer name, trade or job title."}
            </p>

            {quotes.length === 0 && (
              <a
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
              >
                Create first quote
              </a>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {filteredQuotes.map((savedQuote) => (
              <article
                key={savedQuote.id}
                className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl shadow-black/10"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {savedQuote.jobType}
                      </span>

                      <span className="text-xs text-slate-500">
                        {formatDate(savedQuote.createdAt)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold">
                      {savedQuote.customerName}
                    </h2>

                    <p className="mt-2 font-semibold text-slate-700">
                      {savedQuote.quote.title}
                    </p>

                    <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {savedQuote.jobNotes}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-4 sm:items-end">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Estimated total
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {savedQuote.quote.estimatedTotal || "Not provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/quote/${savedQuote.id}`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open quote
                      </a>

                      <button
                        type="button"
                        onClick={() => deleteQuote(savedQuote.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}