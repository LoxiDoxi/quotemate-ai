"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CompanyProfile = {
  companyName: string;
  abn: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  hourlyRate: string;
  gstRegistered: boolean;
};

const emptyProfile: CompanyProfile = {
  companyName: "",
  abn: "",
  phone: "",
  email: "",
  address: "",
  logoUrl: "",
  hourlyRate: "",
  gstRegistered: false,
};

export default function SettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
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

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
  "company_name, abn, phone, email, address, logo_url, hourly_rate, gst_registered",
)
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
      }

      if (data) {
        setProfile({
          companyName: data.company_name ?? "",
          abn: data.abn ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          logoUrl: data.logo_url || "",
          hourlyRate:
            data.hourly_rate === null || data.hourly_rate === undefined
              ? ""
              : String(data.hourly_rate),
          gstRegistered: data.gst_registered ?? false,
        });
      }

      setIsLoading(false);
    }

    void loadProfile();
  }, [router]);

  function updateField<K extends keyof CompanyProfile>(
    field: K,
    value: CompanyProfile[K],
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { error: saveError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          company_name: profile.companyName || null,
          abn: profile.abn || null,
          phone: profile.phone || null,
          email: profile.email || null,
          address: profile.address || null,
          logo_url: profile.logoUrl || null,
          hourly_rate:
            profile.hourlyRate.trim() === ""
              ? null
              : Number(profile.hourlyRate),
          gst_registered: profile.gstRegistered,
        },
        {
          onConflict: "user_id",
        },
      );

      if (saveError) {
        throw saveError;
      }

      setMessage("Business settings saved to your account.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-300">Loading settings...</p>
      </main>
    );
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
              <p className="text-xs text-slate-400">Business settings</p>
            </div>
          </a>

          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Quote history
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

      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">
          Company profile
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Business settings
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          These details are saved securely to your QuoteMate account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Company name
              </label>

              <input
                id="companyName"
                value={profile.companyName}
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                placeholder="Example Plumbing Pty Ltd"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
<div>
  <label
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Logo URL
  </label>

  <input
    value={profile.logoUrl}
    onChange={(event) =>
      updateField("logoUrl", event.target.value)
    }
    placeholder="https://example.com/logo.png"
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
  />
</div>
            <div>
              <label
                htmlFor="abn"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                ABN
              </label>

              <input
                id="abn"
                value={profile.abn}
                onChange={(event) => updateField("abn", event.target.value)}
                placeholder="12 345 678 901"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="hourlyRate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Hourly labour rate
              </label>

              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={profile.hourlyRate}
                onChange={(event) =>
                  updateField("hourlyRate", event.target.value)
                }
                placeholder="95"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone
              </label>

              <input
                id="phone"
                value={profile.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="0400 000 000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Business email
              </label>

              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="quotes@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Business address
              </label>

              <textarea
                id="address"
                rows={3}
                value={profile.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Business address"
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  checked={profile.gstRegistered}
                  onChange={(event) =>
                    updateField("gstRegistered", event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span>
                  <span className="block font-semibold">GST registered</span>
                  <span className="text-sm text-slate-500">
                    Include GST details on generated quotes.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save business settings"}
          </button>
        </form>
      </section>
    </main>
  );
}