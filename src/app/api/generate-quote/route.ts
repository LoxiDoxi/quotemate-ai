import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildQuotePrompt } from "@/lib/prompt";
import type { GenerateQuoteResponse, Quote, QuoteRequest } from "@/lib/types";
import { JOB_TYPES } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function validateRequest(body: unknown): QuoteRequest | null {
  if (!body || typeof body !== "object") return null;

  const { customerName, jobType, jobNotes } = body as Record<string, unknown>;

  if (typeof customerName !== "string" || !customerName.trim()) return null;
  if (typeof jobType !== "string" || !JOB_TYPES.includes(jobType as (typeof JOB_TYPES)[number])) return null;
  if (typeof jobNotes !== "string" || !jobNotes.trim()) return null;

  return {
    customerName: customerName.trim(),
    jobType: jobType as QuoteRequest["jobType"],
    jobNotes: jobNotes.trim(),
  };
}

function parseQuote(content: string): Quote {
  const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(cleaned) as Quote;

  if (!parsed.title || !Array.isArray(parsed.scopeOfWork)) {
    throw new Error("Invalid quote structure");
  }

  return {
    title: parsed.title,
    scopeOfWork: parsed.scopeOfWork,
    materials: parsed.materials ?? [],
    labor: parsed.labor ?? [],
    termsAndConditions: parsed.termsAndConditions ?? [],
    estimatedTotal: parsed.estimatedTotal,
  };
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = validateRequest(body);
  if (!input) {
    return NextResponse.json(
      { error: "Missing or invalid fields: customerName, jobType, jobNotes" },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate professional tradesperson quotes. Always respond with valid JSON only.",
        },
        { role: "user", content: buildQuotePrompt(input) },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    const quote = parseQuote(content);
    const response: GenerateQuoteResponse = { quote };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Quote generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate quote. Please try again." },
      { status: 500 }
    );
  }
}
