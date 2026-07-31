import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildQuotePrompt } from "@/lib/prompt";
import type { GenerateQuoteResponse, Quote, QuoteRequest } from "@/lib/types";
import { JOB_TYPES } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function validateRequest(body: unknown): QuoteRequest | null {
  if (!body || typeof body !== "object") return null;

  const { customerName, jobType, jobNotes } =
    body as Record<string, unknown>;

  if (typeof customerName !== "string" || !customerName.trim()) {
    return null;
  }

  if (
    typeof jobType !== "string" ||
    !JOB_TYPES.includes(jobType as (typeof JOB_TYPES)[number])
  ) {
    return null;
  }

  if (typeof jobNotes !== "string" || !jobNotes.trim()) {
    return null;
  }

  return {
    customerName: customerName.trim(),
    jobType: jobType as QuoteRequest["jobType"],
    jobNotes: jobNotes.trim(),
  };
}

function parseQuote(content: string): Quote {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Quote;

  return {
    title: parsed.title,
    scopeOfWork: parsed.scopeOfWork ?? [],
    materials: parsed.materials ?? [],
    labor: parsed.labor ?? [],
    termsAndConditions: parsed.termsAndConditions ?? [],
    estimatedTotal: parsed.estimatedTotal,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }


    // PLAN + FREE QUOTE LIMIT CHECK

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("plan")
  .eq("user_id", user.id)
  .maybeSingle();


if (profileError) {
  console.error("Profile check failed:", profileError);
}


const isPro = profile?.plan === "pro";


const { count, error: countError } = await supabase
  .from("quotes")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);


if (countError) {
  console.error("Limit check failed:", countError);
}


// Only block FREE users
if (!isPro && (count ?? 0) >= 5) {
  return NextResponse.json(
    {
      error:
        "You have reached your free quote limit. Upgrade to Pro to create unlimited quotes.",
    },
    {
      status: 403,
    }
  );
}


    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }


    const body = await request.json();

    const input = validateRequest(body);

    if (!input) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate professional tradesperson quotes. Return valid JSON only.",
        },
        {
          role: "user",
          content: buildQuotePrompt(input),
        },
      ],
      temperature: 0.4,
      response_format: {
        type: "json_object",
      },
    });


    const content = completion.choices[0]?.message?.content;


    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }


    const quote = parseQuote(content);


    const { error: saveError } = await supabase
      .from("quotes")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        customerName: input.customerName,
        jobType: input.jobType,
        jobNotes: input.jobNotes,
        quote,
        createdAt: new Date().toISOString(),
      });


    if (saveError) {
      console.error("Failed to save quote:", saveError);
    }


    const response: GenerateQuoteResponse = {
      quote,
    };


    return NextResponse.json(response);


  } catch (err) {
    console.error("Quote generation failed:", err);

    return NextResponse.json(
      {
        error: "Failed to generate quote. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}