import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: Request) {
  const body = await req.text();

  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook error:", err.message);

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Payment successful:", session.id);

    // THIS IS WHERE WE WILL ADD SUPABASE UPDATE LATER
  }


  return NextResponse.json({ received: true });
}