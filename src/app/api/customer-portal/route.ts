import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );


    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();


    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Not logged in",
        },
        {
          status: 401,
        }
      );
    }


    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();


    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "No Stripe customer found",
        },
        {
          status: 400,
        }
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
        error: error.message || "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}