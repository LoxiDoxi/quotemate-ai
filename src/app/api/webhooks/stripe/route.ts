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

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature failed:", error.message);

    return NextResponse.json(
      { error: "Webhook signature failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;

        if (!userId) {
          console.error("No user_id metadata found");
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            plan: "pro",
            stripe_customer_id: session.customer,
            subscription_id: session.subscription,
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Profile upgrade failed:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log("Successfully upgraded user:", userId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("profiles")
          .update({
            plan: "free",
            subscription_id: null,
          })
          .eq(
            "stripe_customer_id",
            subscription.customer
          );

        console.log("Subscription cancelled");

        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    return NextResponse.json({
      received: true,
    });

  } catch (error: any) {
    console.error("Webhook processing error:", error.message);

    return NextResponse.json(
      {
        error: error.message || "Webhook failed",
      },
      {
        status: 500,
      }
    );
  }
}