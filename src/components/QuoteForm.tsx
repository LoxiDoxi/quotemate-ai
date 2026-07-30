"use client";

import { useEffect, useState } from "react";
import { JOB_TYPES, type JobType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import CustomerForm from "./CustomerForm";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

interface QuoteFormProps {
  onSubmit: (data: {
    customerId?: number;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    jobType: JobType;
    jobNotes: string;
  }) => void;

  isLoading: boolean;
}


export default function QuoteForm({
  onSubmit,
  isLoading,
}: QuoteFormProps) {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const [jobType, setJobType] =
    useState<JobType>("General Handyman");

  const [jobNotes, setJobNotes] = useState("");


  async function loadCustomers() {

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email, address")
      .order("created_at", {
        ascending: false,
      });


    if (!error && data) {
      setCustomers(data);
    }
  }


  useEffect(() => {
    loadCustomers();
  }, []);



  function handleCustomerChange(value: string) {

    setSelectedCustomer(value);


    const customer = customers.find(
      (item) => item.id === Number(value)
    );


    if (!customer) return;


    setCustomerName(customer.name);
    setCustomerPhone(customer.phone ?? "");
    setCustomerEmail(customer.email ?? "");
    setCustomerAddress(customer.address ?? "");
  }



  function handleSubmit(event: React.FormEvent) {

    event.preventDefault();


    onSubmit({

      customerId: selectedCustomer
        ? Number(selectedCustomer)
        : undefined,

      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      jobType,
      jobNotes,

    });
  }



  const canSubmit =
    customerName.trim() !== "" &&
    jobNotes.trim() !== "" &&
    !isLoading;



  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >


      <div>

        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Select customer
        </label>


        <select
          value={selectedCustomer}
          onChange={(e) =>
            handleCustomerChange(e.target.value)
          }
          className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
        >

          <option value="">
            Choose saved customer...
          </option>


          {customers.map((customer)=>(

            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>

          ))}


        </select>



        <button
          type="button"
          onClick={() =>
            setShowCustomerForm(!showCustomerForm)
          }
          className="mt-2 text-sm font-semibold text-blue-600"
        >
          + Add new customer
        </button>



        {showCustomerForm && (

          <CustomerForm
            onCreated={()=>{
              setShowCustomerForm(false);
              loadCustomers();
            }}
          />

        )}


      </div>



      <input
        value={customerName}
        onChange={(e)=>setCustomerName(e.target.value)}
        placeholder="Customer name"
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      />


      <input
        value={customerPhone}
        onChange={(e)=>setCustomerPhone(e.target.value)}
        placeholder="Phone"
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      />


      <input
        value={customerEmail}
        onChange={(e)=>setCustomerEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      />


      <input
        value={customerAddress}
        onChange={(e)=>setCustomerAddress(e.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      />



      <select
        value={jobType}
        onChange={(e)=>
          setJobType(e.target.value as JobType)
        }
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      >

        {JOB_TYPES.map((type)=>(

          <option
            key={type}
            value={type}
          >
            {type}
          </option>

        ))}

      </select>



      <textarea
        value={jobNotes}
        onChange={(e)=>setJobNotes(e.target.value)}
        placeholder="Describe the job..."
        rows={5}
        className="w-full rounded-lg border px-4 py-2.5 text-slate-900"
      />



      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >

        {isLoading
          ? "Generating quote..."
          : "Generate quote"}

      </button>


    </form>

  );
}