import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

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


  let event: Stripe.Event;


  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

  } catch (err: any) {

    console.error("Webhook verification failed:", err.message);

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }



  try {

    if (event.type === "checkout.session.completed") {

      const session = event.data.object as Stripe.Checkout.Session;


      const userId = session.metadata?.user_id;


      if (!userId) {
        console.error("No user id in metadata");
        return NextResponse.json(
          { error: "Missing user id" },
          { status: 400 }
        );
      }


      const supabase = await createClient();


      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;


      await supabase
        .from("profiles")
        .update({
          plan: "pro",
          stripe_customer_id: session.customer,
          subscription_id: subscriptionId,
        })
        .eq("user_id", userId);



      console.log("User upgraded:", userId);

    }


    return NextResponse.json({
      received: true,
    });


  } catch (error: any) {

    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}