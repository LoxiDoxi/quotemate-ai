"use client";

import { useEffect, useState } from "react";
import { JOB_TYPES, type JobType } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

interface QuoteFormProps {
  onSubmit: (data: {
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
const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerEmail, setCustomerEmail] = useState("");
const [customerAddress, setCustomerAddress] = useState("");

const [jobType, setJobType] = useState<JobType>("General Handyman");
const [jobNotes, setJobNotes] = useState("");
  useEffect(() => {
    async function loadCustomers() {
      const { data, error } = await supabase
  .from("customers")
  .select("id, name, phone, email, address")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCustomers(data);
      }
    }

    loadCustomers();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

   onSubmit({
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  jobType,
  jobNotes,
});
  }

  const canSubmit =
    customerName.trim().length > 0 &&
    jobNotes.trim().length > 0 &&
    !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Select customer
        </label>

        <select
          value=""
          onChange={(e) => {
  const customer = customers.find(
    (c) => c.id === Number(e.target.value)
  );

  if (customer) {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone ?? "");
    setCustomerEmail(customer.email ?? "");
    setCustomerAddress(customer.address ?? "");
  }
}}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900"
          disabled={isLoading}
        >
          <option value="">
            Choose saved customer...
          </option>

          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>


      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Customer name
        </label>

        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. John Smith"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900"
          disabled={isLoading}
        />
      </div>


      <div>
        <label
          htmlFor="jobType"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Job type
        </label>

        <select
          id="jobType"
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value as JobType)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900"
          disabled={isLoading}
        >
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>


      <div>
        <label
          htmlFor="jobNotes"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Job notes
        </label>

        <textarea
          id="jobNotes"
          value={jobNotes}
          onChange={(e) => setJobNotes(e.target.value)}
          placeholder="Describe the job..."
          rows={5}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 resize-y"
          disabled={isLoading}
        />
      </div>


      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? "Generating quote..." : "Generate quote"}
      </button>

    </form>
  );
}