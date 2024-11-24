import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/libs/stripe";
import {
  upsertPriceRecord,
  upsertProductRecord,
  manageSubscriptionStatusChange,
  createOrRetrieveCustomer,
} from "@/libs/supabaseAdmin";

// 定义一个Set，包含以下事件：
const relevantEvents = new Set([
  // 产品创建事件
  "product.created",
  // 产品更新事件
  "product.updated",
  // 价格创建事件
  "price.created",
  // 价格更新事件
  "price.updated",
  // 结算会话完成事件
  "checkout.session.completed",
  // 客户订阅创建事件
  "customer.subscription.created",
  // 客户订阅更新事件
  // 客户订阅删除事件
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get("Stripe-Signature");

  const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webHookSecret) return;
    event = stripe.webhooks.constructEvent(body, sig, webHookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      return new NextResponse(
        'Webhook error: "Webhook handler failed. View logs."',
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
