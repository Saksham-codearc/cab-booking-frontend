"use client";

let scriptPromise: Promise<boolean> | null = null;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: CheckoutResult) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckout {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export interface CheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name?: string;
  email?: string;
  contact?: string;
}

export interface CheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function payWithRazorpay(options: CheckoutOptions): Promise<CheckoutResult> {
  const loaded = await loadRazorpay();
  if (!loaded) throw new Error("Could not load Razorpay Checkout.");

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Could not load Razorpay Checkout."));
      return;
    }

    const checkout = new window.Razorpay({
      key: options.keyId,
      amount: Math.round(options.amount * 100),
      currency: options.currency,
      order_id: options.orderId,
      name: "RideFlow",
      description: "Ride payment (authorized now, captured after the trip)",
      prefill: {
        name: options.name ?? "",
        email: options.email ?? "",
        contact: options.contact ?? "",
      },
      theme: { color: "#22d3ee" },
      handler: (response: CheckoutResult) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    checkout.open();
  });
}
