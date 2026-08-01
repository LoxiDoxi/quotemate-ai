"use client";

import { useEffect, useState } from "react";
import QuoteForm from "@/components/QuoteForm";
import QuoteResult from "@/components/QuoteResult";
import { supabase } from "@/lib/supabase";
import type { JobType, Quote } from "@/lib/types";

type SavedQuote = {
  id: string;
  customer_id?: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  jobType: JobType;
  jobNotes: string;
  createdAt: string;
  quote: Quote;
};

export default function HomePage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState("");
  const [quoteCount, setQuoteCount] = useState(0);

  useEffect(() => {

async function loadQuoteInfo(){

const {
data:{
user
}
} = await supabase.auth.getUser();


if(!user) return;


// Get plan
const { data: profile } = await supabase
.from("profiles")
.select("plan")
.eq("user_id", user.id)
.single();


setPlan(profile?.plan || "free");


// Get quote count
const startOfMonth = new Date();

startOfMonth.setDate(1);
startOfMonth.setHours(0,0,0,0);


const { count } = await supabase
.from("quotes")
.select("*", { count: "exact", head: true })
.eq("user_id", user.id)
.gte("createdAt", startOfMonth.toISOString());


setQuoteCount(count || 0);

}


loadQuoteInfo();

}, []);

  async function handleGenerate(data: {
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  jobType: JobType;
  jobNotes: string;
}) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-quote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(data),
});

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Something went wrong");
      }

      const generatedQuote = json.quote as Quote;

      const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

console.log("PAGE USER:", user);
console.log("PAGE USER ERROR:", userError);

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const savedQuote: SavedQuote & { user_id: string } = {
  id: crypto.randomUUID(),

  customer_id: data.customerId,

  customerName: data.customerName,
  customerPhone: data.customerPhone,
  customerEmail: data.customerEmail,
  customerAddress: data.customerAddress,

  jobType: data.jobType,
  jobNotes: data.jobNotes,

  createdAt: new Date().toISOString(),

  quote: generatedQuote,

  user_id: user.id,
};

      const { error: cloudSaveError } = await supabase
        .from("quotes")
        .insert(savedQuote);

      if (cloudSaveError) {
        throw new Error(`Cloud save failed: ${cloudSaveError.message}`);
      }

      const existingQuotes = localStorage.getItem("quotemate-saved-quotes");
      const parsedQuotes: SavedQuote[] = existingQuotes
        ? JSON.parse(existingQuotes)
        : [];

      localStorage.setItem(
        "quotemate-saved-quotes",
        JSON.stringify([savedQuote, ...parsedQuotes]),
      );

      setCustomerName(data.customerName);
      setQuote(generatedQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quote");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setQuote(null);
    setCustomerName("");
    setError(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-900">
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img
  src="/logo.png"
  alt="QuoteMate AI"
  className="h-11 w-11 rounded-2xl object-contain"
/>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                QuoteMate AI
              </h1>
              <p className="text-xs text-slate-400">
                Built for Australian tradies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
            >
              Quote history
            </a>

            <a
              href="/settings"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
            >
              Settings
            </a>

            <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 lg:block">
              AI quote generator
            </div>
          </div>
        </div>
      </header>

      {!quote ? (
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_30%)]" />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-200">
                <span>⚡</span>
                Quote jobs in under 30 seconds
              </div>

              <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Create professional quotes.
              <span className="block text-blue-400">in under 30 seconds.</span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                QuoteMate AI turns rough job notes into professional quotes with materials, labour, pricing and terms — built specifically for Australian tradies.
              </p>

              <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
                {[
                  ["30 sec", "Average generation"],
                  ["10+", "Trade categories"],
                  ["Saved", "Quote history"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <div className="text-xl font-bold text-white">{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">

<div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">

<h3 className="text-xl font-bold text-white">
Free Plan
</h3>

<p className="mt-2 text-blue-400 font-bold">
$0/month
</p>

<ul className="mt-4 space-y-2 text-sm text-slate-300">
<li>✓ 5 AI quotes per month</li>
<li>✓ Save quote history</li>
<li>✓ All trade categories</li>
</ul>

</div>


<div className="rounded-3xl border border-blue-500/50 bg-blue-500/10 p-6 backdrop-blur">

<h3 className="text-xl font-bold text-white">
Pro Plan ⭐
</h3>

<p className="mt-2 text-blue-400 font-bold">
$19/month
</p>

<ul className="mt-4 space-y-2 text-sm text-slate-300">
<li>✓ Unlimited AI quotes</li>
<li>✓ Unlimited quote history</li>
<li>✓ Built for professional tradies</li>
</ul>

</div>

</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  New quote
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  Create a professional quote
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add the customer, choose the trade and paste your rough job
                  notes below.
                </p>
              </div>
<div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-white">

  {plan === "pro" ? (
    <>
      <p className="font-bold text-blue-400">
        Pro Plan ⭐
      </p>

      <p className="text-sm text-slate-300">
        Unlimited AI quotes
      </p>
    </>
  ) : (
    <>
      <p className="font-bold text-blue-400">
        Free Plan
      </p>

      <p className="text-sm text-slate-300">
        {quoteCount}/5 quotes used this month
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Upgrade to Pro for unlimited quotes.
      </p>
    </>
  )}

</div>
              <QuoteForm onSubmit={handleGenerate} isLoading={isLoading} />

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div><div className="mt-16 rounded-3xl bg-white p-8 text-slate-900">
  <h2 className="text-center text-3xl font-black">
    How QuoteMate works
  </h2>

  <div className="mt-8 grid gap-6 md:grid-cols-3">
    <div className="rounded-2xl border p-6">
      <h3 className="text-xl font-bold">1. Add the job</h3>
      <p className="mt-2 text-slate-600">
        Enter customer details and describe the work.
      </p>
    </div>

    <div className="rounded-2xl border p-6">
      <h3 className="text-xl font-bold">2. AI builds the quote</h3>
      <p className="mt-2 text-slate-600">
        QuoteMate creates materials, labour and pricing.
      </p>
    </div>

    <div className="rounded-2xl border p-6">
      <h3 className="text-xl font-bold">3. Send it</h3>
      <p className="mt-2 text-slate-600">
        Download a professional quote PDF for your customer.
      </p>
    </div>
  </div>
</div>
        </section>

        ) : (
        <section className="min-h-[calc(100vh-82px)] bg-slate-100">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <QuoteResult
              quote={quote}
              customerName={customerName}
              onReset={handleReset}
            />
          </div>
        </section>
      )}
    </main>
  );
}