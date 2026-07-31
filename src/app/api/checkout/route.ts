import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {

    const { userId } = await req.json();

    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Stripe price ID" },
        { status: 500 }
      );
    }


    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
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