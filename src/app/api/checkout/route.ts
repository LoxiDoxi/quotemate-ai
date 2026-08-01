import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase.auth.admin.getUserById(
      userId
    );

    if (error || !user.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      );
    }


    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Stripe price ID" },
        { status: 500 }
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

      customer_email: user.user.email!,

      metadata: {
        user_id: userId,
      },

      subscription_data: {
        metadata: {
          user_id: userId,
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