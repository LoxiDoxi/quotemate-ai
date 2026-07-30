import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url:
        "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "http://localhost:3000/dashboard?cancelled=true",

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