"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
};

type Quote = {
  id: string;
  customerName: string;
  jobType: string;
  jobNotes: string;
  createdAt: string;
};

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();

  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadCustomer() {

      setLoading(true);


      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();


      const user = session?.user;


      if (!user) {
        console.log("No session found");
        setLoading(false);
        return;
      }


      const { data: customerData, error: customerError } =
        await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .eq("user_id", user.id)
          .single();


      if (customerError) {

        console.error(customerError);
        setLoading(false);
        return;

      }


      setCustomer(customerData);



      const { data: quoteData, error: quoteError } =
        await supabase
          .from("quotes")
          .select("*")
          .eq("customer_id", customerId)
          .eq("user_id", user.id)
          .order("createdAt", {
            ascending: false,
          });


      if (quoteError) {
        console.error(quoteError);
      }


      if (quoteData) {
        setQuotes(quoteData);
      }


      setLoading(false);

    }


    if (customerId) {
      loadCustomer();
    }


  }, [customerId]);



  if (loading) {

    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading...
      </main>
    );

  }



  if (!customer) {

    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Customer not found.
      </main>
    );

  }



  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">

        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-400"
        >
          ← Back
        </button>


        <section className="rounded-3xl bg-white p-8 text-slate-950">

          <h1 className="text-4xl font-black">
            {customer.name}
          </h1>


          <div className="mt-5 space-y-2">

            {customer.phone && <p>📞 {customer.phone}</p>}
            {customer.email && <p>✉️ {customer.email}</p>}
            {customer.address && <p>📍 {customer.address}</p>}

          </div>

        </section>



        <section className="mt-8 rounded-3xl bg-white p-8 text-slate-950">

          <h2 className="text-2xl font-black">
            Quote History
          </h2>


          {quotes.length === 0 ? (

            <p className="mt-4 text-slate-500">
              No quotes yet.
            </p>

          ) : (

            <div className="mt-5 space-y-4">

              {quotes.map((quote) => (

                <div
                  key={quote.id}
                  className="rounded-2xl border p-4"
                >

                  <h3 className="font-bold">
                    {quote.jobType}
                  </h3>

                  <p>
                    {quote.jobNotes}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(
                      quote.createdAt
                    ).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}