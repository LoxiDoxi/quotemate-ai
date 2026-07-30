import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    console.error(err.message);

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Payment successful:", session.id);


    const customerEmail = session.customer_details?.email;

    if (customerEmail) {

      await supabase
        .from("profiles")
        .update({
          plan: "pro",
          stripe_customer_id: session.customer,
          subscription_id: session.subscription,
        })
        .eq("email", customerEmail);

      console.log("User upgraded:", customerEmail);
    }
  }


  return NextResponse.json({ received: true });
}