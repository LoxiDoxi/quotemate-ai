import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error: "Missing Stripe price ID",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "User not logged in",
        },
        {
          status: 401,
        }
      );
    }


    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        user_id: user.id,
      },

      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },

      success_url:
        "https://quotemate-ai.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://quotemate-ai.vercel.app/dashboard?cancelled=true",
    });


    return NextResponse.json({
      url: session.url,
    });


  } catch (error: any) {

    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error: error.message || "Stripe checkout failed",
      },
      {
        status: 500,
      }
    );
  }
}