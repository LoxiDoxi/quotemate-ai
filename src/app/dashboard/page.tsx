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
  const [plan, setPlan] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [billingError, setBillingError] = useState("");


  async function loadDashboard() {

    setIsLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;


    if (!user) {
      console.log("NO AUTH USER FOUND");
      setError("Please refresh and login again.");
      setIsLoading(false);
      return;
    }


    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();


    console.log("PROFILE FROM DATABASE:", profile);
    console.log("PROFILE ERROR:", profileError);


    if (profile) {
      setPlan(profile.plan);
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



  useEffect(() => {
    loadDashboard();
  }, []);



  const filteredQuotes = useMemo(() => {

    const query = search.trim().toLowerCase();

    if (!query) return quotes;


    return quotes.filter((savedQuote) =>
      savedQuote.customerName.toLowerCase().includes(query) ||
      savedQuote.jobType.toLowerCase().includes(query) ||
      savedQuote.quote.title.toLowerCase().includes(query)
    );


  }, [quotes, search]);




  async function deleteQuote(id: string) {
  setDeleteId(id);
}



  async function handleLogout(){

    await supabase.auth.signOut();

    router.replace("/login");

  }



  async function upgradeToPro(){

    const {
      data:{user}
    } = await supabase.auth.getUser();


    if(!user){

      router.replace("/login");
      return;

    }


    const response = await fetch("/api/checkout",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        userId:user.id
      })

    });


    const data = await response.json();


    if(data.url){

      window.location.href=data.url;

    }else{

      alert(data.error || "Checkout failed");

    }

  }



  async function manageBilling(){

    const response = await fetch(
      "/api/customer-portal",
      {
        method:"POST"
      }
    );


    const data = await response.json();


    if(data.url){

      window.location.href=data.url;

    }else{

      setBillingError(data.error || "Billing failed");

    }

  }



  return (
    <main className="min-h-screen bg-slate-950 text-white">

<header className="border-b border-white/10">

<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

<div className="flex items-center gap-3">

<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black">
Q
</div>


<div>

<p className="font-bold">
QuoteMate AI
</p>


<p className="text-xs text-slate-400">
{plan==="pro" ? "Pro Plan ⭐":"Free Plan"}
</p>


</div>


</div>


{
plan==="pro" ?

<div className="flex gap-2">

<div className="rounded-lg bg-green-600 px-5 py-3 font-semibold">
Pro Plan ⭐
</div>


<button
onClick={manageBilling}
className="rounded-lg bg-slate-700 px-5 py-3"
>
Manage Billing
</button>


</div>

:

<button
onClick={upgradeToPro}
className="rounded-lg bg-blue-600 px-5 py-3"
>
Upgrade to Pro - $19/month
</button>

}


<button
onClick={handleLogout}
className="rounded-lg bg-red-500 px-4 py-2"
>
Log out
</button>


</div>

</header>



<section className="mx-auto max-w-6xl px-6 py-12">

<h1 className="text-4xl font-black">
Quote history
</h1>


<p className="mt-3 text-slate-300">
Quotes saved securely to your account.
</p>


<p className="mt-2 text-sm text-slate-400">
{plan==="pro"
? "Pro plan: Unlimited quotes"
: "Free plan: 5 quotes per month"}
</p>


<button
onClick={() => router.push("/")}
className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
>
Create New Quote
</button>


<input
className="mt-8 w-full rounded-2xl bg-white/5 p-4"
placeholder="Search by customer, trade or job..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>



{filteredQuotes.map((savedQuote)=>(

<article
key={savedQuote.id}
className="mt-5 rounded-3xl bg-white p-6 text-black"
>


<div className="flex justify-between">


<div>

<h2 className="text-2xl font-bold">
{savedQuote.customerName}
</h2>


<p>
{savedQuote.quote.title}
</p>


<p className="text-sm text-gray-500">
{formatDate(savedQuote.createdAt)}
</p>


</div>


<div className="flex gap-3">


<button
onClick={()=>router.push(`/quote/${savedQuote.id}`)}
className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
Open quote
</button>


<button
onClick={()=>deleteQuote(savedQuote.id)}
className="rounded-lg bg-red-500 px-4 py-2 text-white"
>
Delete
</button>


</div>


</div>


</article>


))}


</section>

        {/* Manage Billing Error Popup */}
        {billingError && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold mb-3">
                Billing Error
              </h2>

              <p className="text-gray-600 mb-4">
                {billingError}
              </p>

              <button
                onClick={() => setBillingError("")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        )}

      </main>
    );
}