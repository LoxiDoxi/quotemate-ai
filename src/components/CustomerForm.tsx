"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CustomerFormProps {
  onCreated: () => void;
}

export default function CustomerForm({
  onCreated,
}: CustomerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setIsSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      const { error: insertError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          name,
          phone,
          email,
          address,
          notes,
        });

      if (insertError) {
        throw insertError;
      }

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");

      onCreated();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">

      <h3 className="text-lg font-bold text-slate-900">
        Add New Customer
      </h3>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customer name"
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
      />

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : "Save Customer"}
      </button>

    </div>
  );
}