"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  async function loadCustomers() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("No user");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    console.log("CUSTOMERS:", data);
    console.log("ERROR:", error);

    if (!error && data) {
      setCustomers(data);
    }

    setLoading(false);
  }


  async function addCustomer() {

    if (!name.trim()) {
      alert("Customer name required");
      return;
    }


    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();


    if (userError || !user) {
      alert("Please log in first");
      return;
    }


    const { error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        name,
        phone,
        email,
        address,
      });


    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }


    setName("");
    setPhone("");
    setEmail("");
    setAddress("");


    await loadCustomers();
  }


  useEffect(() => {
    loadCustomers();
  }, []);



  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">


        <header className="mb-8">

          <h1 className="text-4xl font-black">
            Customers
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your customers and use them for quotes.
          </p>

        </header>



        <section className="mb-8 rounded-3xl bg-white p-6 text-slate-950">


          <h2 className="mb-4 text-2xl font-bold">
            Add Customer
          </h2>



          <div className="grid gap-3">


            <input
              className="rounded-xl border p-3"
              placeholder="Customer name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />


            <input
              className="rounded-xl border p-3"
              placeholder="Phone"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
            />


            <input
              className="rounded-xl border p-3"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />


            <input
              className="rounded-xl border p-3"
              placeholder="Address"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
            />



            <button
              onClick={addCustomer}
              className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
            >
              Save Customer
            </button>


          </div>


        </section>




        <section className="rounded-3xl bg-white p-6 text-slate-950">


          {loading ? (

            <p>
              Loading customers...
            </p>

          ) : customers.length === 0 ? (

            <p className="text-slate-500">
              No customers yet.
            </p>

          ) : (


            <div className="space-y-4">


              {customers.map((customer)=>(

                <div
                  key={customer.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >

                  <h2 className="text-xl font-bold">
                    {customer.name}
                  </h2>


                  {customer.phone && (
                    <p>📞 {customer.phone}</p>
                  )}


                  {customer.email && (
                    <p>✉️ {customer.email}</p>
                  )}


                  {customer.address && (
                    <p>📍 {customer.address}</p>
                  )}


                </div>

              ))}


            </div>

          )}


        </section>


      </div>


    </main>
  );
}