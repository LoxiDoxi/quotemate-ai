import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }


    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();


    if (profileError || !profile?.stripe_customer_id) {
      console.error("Profile error:", profileError);

      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }


    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: "https://quotemate-ai.vercel.app/dashboard",
    });


    return NextResponse.json({
      url: session.url,
    });


  } catch (error: any) {
    console.error("Customer portal error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to open customer portal",
      },
      {
        status: 500,
      }
    );
  }
}