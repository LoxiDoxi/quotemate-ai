"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Quote, QuoteLineItem } from "@/lib/types";
import { generatePDF } from "@/lib/pdf";
type BusinessProfile = {
  businessName: string;
  logoUrl?: string;
  abn: string;
  phone: string;
  email: string;
  address: string;
};

interface QuoteResultProps {
  quote: Quote;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  onReset: () => void;
}

const defaultProfile: BusinessProfile = {
  businessName: "QuoteMate AI",
  logoUrl: "/logo.png",
  abn: "15 154 226 673",
  phone: "",
  email: "quotemateai@gmail.com",
  address: "Australia",
};

function createQuoteNumber() {
  const now = new Date();

  const datePart = [
    now.getFullYear().toString().slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");

  return `QM-${datePart}-${timePart}`;
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function LineItemsTable({
  title,
  items,
}: {
  title: string;
  items: QuoteLineItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600">
                Quantity
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600">
                Unit price
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={`${item.description}-${index}`}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.description}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {item.quantity ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {item.unitPrice ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                  {item.total ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function QuoteResult({
  quote,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  onReset,
}: QuoteResultProps) {
  const [business, setBusiness] = useState<BusinessProfile>(defaultProfile);

  const quoteNumber = useMemo(() => createQuoteNumber(), []);
  const quoteDate = useMemo(() => getFormattedDate(), []);

  useEffect(() => {
    async function loadBusinessProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBusiness(defaultProfile);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("company_name, abn, phone, email, address, logo_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setBusiness(defaultProfile);
        return;
      }

      setBusiness({
        businessName: data.company_name?.trim() || defaultProfile.businessName,
        logoUrl: data.logo_url,
        abn: data.abn?.trim() || "",
        phone: data.phone?.trim() || "",
        email: data.email?.trim() || "",
        address: data.address?.trim() || "",
      });
    }

    void loadBusinessProfile();
  }, []);

  async function handleCopy() {
    const text = formatQuoteAsText(
      quote,
      customerName,
      quoteNumber,
      quoteDate,
      business,
    );

    try {
      await navigator.clipboard.writeText(text);
      alert("Quote copied to clipboard.");
    } catch {
      alert("The quote could not be copied. Please try again.");
    }
  }

  function handlePrint() {

 const materialsTotal = quote.materials.reduce(
  (sum, item) => sum + Number(String(item.total).replace("$", "") || 0),
  0
);

const labourTotal = quote.labor.reduce(
  (sum, item) => sum + Number(String(item.total).replace("$", "") || 0),
  0
);

  const subtotal = materialsTotal + labourTotal;
  const gst = subtotal * 0.1;
  const estimatedTotal = subtotal + gst;

  generatePDF({
    businessName: business.businessName,
    logoUrl: "/logo.png",
    abn: business.abn,
    phone: business.phone,
    email: business.email,
    address: business.address,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    quoteNumber,
    quoteDate,
    title: quote.title,
    scopeOfWork: quote.scopeOfWork,
    materials: quote.materials,
    labor: quote.labor,

    subtotal: `$${subtotal.toFixed(2)}`,
gst: `$${gst.toFixed(2)}`,

termsAndConditions: quote.termsAndConditions,
estimatedTotal: `$${estimatedTotal.toFixed(2)}`,
  });
}

  return (
    <div className="quote-result space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Quote generated successfully
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Ready to review and send
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Copy quote
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            New quote
          </button>
        </div>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-slate-950 px-6 py-7 text-white sm:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-48 shrink-0 items-center justify-center rounded-2xl overflow-hidden">
  <img
    src="/logo.png"
    alt="QuoteMate AI"
    className="h-full w-full object-contain"
  />
</div>

              <div>
                <h2 className="text-xl font-bold">{business.businessName}</h2>

                <div className="mt-2 space-y-0.5 text-sm text-slate-300">
                  {business.abn && <p>ABN: {business.abn}</p>}
                  {business.phone && <p>{business.phone}</p>}
                  {business.email && <p>{business.email}</p>}
                  {business.address && <p>{business.address}</p>}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                Quote
              </p>
              <p className="mt-2 text-lg font-bold">{quoteNumber}</p>
              <p className="mt-1 text-sm text-slate-300">{quoteDate}</p>
            </div>
          </div>
        </header>

        <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
          <section className="grid gap-6 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Prepared for
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">
                {customerName}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Quote status
              </p>
              <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                Estimate pending approval
              </span>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Proposed work
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
              {quote.title}
            </h2>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Scope of work
            </h3>

            <ul className="space-y-3">
              {quote.scopeOfWork.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 leading-7 text-slate-700"
                >
                  <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <LineItemsTable title="Materials" items={quote.materials} />
          <LineItemsTable title="Labour" items={quote.labor} />

          {quote.estimatedTotal && (
            <section className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Estimated project total
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Final pricing should be reviewed before sending.
                  </p>
                </div>

                <p className="text-4xl font-black tracking-tight">
                  {quote.estimatedTotal}
                </p>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-950">
              Important pricing notice
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              This quote was generated using AI and may include estimated
              materials, labour and pricing. Review every item before sending
              it to a customer.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Terms and conditions
            </h3>

            <ol className="space-y-2">
              {quote.termsAndConditions.map((term, index) => (
                <li
                  key={`${term}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-slate-600"
                >
                  <span className="font-semibold text-slate-900">
                    {index + 1}.
                  </span>
                  <span>{term}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Customer acceptance
              </p>
              <div className="mt-10 border-b border-slate-400" />
              <p className="mt-2 text-xs text-slate-500">
                Customer signature
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Acceptance date
              </p>
              <div className="mt-10 border-b border-slate-400" />
              <p className="mt-2 text-xs text-slate-500">Date</p>
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-center text-xs text-slate-500 sm:px-10">
          Generated with QuoteMate AI · Review all details before sending
        </footer>
      </article>
    </div>
  );
}

function formatQuoteAsText(
  quote: Quote,
  customerName: string,
  quoteNumber: string,
  quoteDate: string,
  business: BusinessProfile,
): string {
  const lines: string[] = [
    business.businessName,
    business.abn ? `ABN: ${business.abn}` : "",
    [business.phone, business.email].filter(Boolean).join(" | "),
    business.address,
    "",
    `QUOTE NUMBER: ${quoteNumber}`,
    `DATE: ${quoteDate}`,
    `PREPARED FOR: ${customerName}`,
    "",
    quote.title.toUpperCase(),
    "",
    "SCOPE OF WORK",
    ...quote.scopeOfWork.map((item) => `• ${item}`),
    "",
  ].filter((line) => line !== undefined);

  if (quote.materials.length > 0) {
    lines.push("MATERIALS");

    quote.materials.forEach((item) => {
      lines.push(
        `${item.description} — ${item.quantity ?? "—"} @ ${
          item.unitPrice ?? "—"
        } = ${item.total ?? "—"}`,
      );
    });

    lines.push("");
  }

  if (quote.labor.length > 0) {
    lines.push("LABOUR");

    quote.labor.forEach((item) => {
      lines.push(
        `${item.description} — ${item.quantity ?? "—"} @ ${
          item.unitPrice ?? "—"
        } = ${item.total ?? "—"}`,
      );
    });

    lines.push("");
  }

  if (quote.estimatedTotal) {
    lines.push(`ESTIMATED TOTAL: ${quote.estimatedTotal}`, "");
  }

  lines.push(
    "IMPORTANT",
    "This AI-generated quote must be reviewed before it is sent to a customer.",
    "",
    "TERMS AND CONDITIONS",
  );

  quote.termsAndConditions.forEach((term, index) => {
    lines.push(`${index + 1}. ${term}`);
  });

  return lines.join("\n");
}