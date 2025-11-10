import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get webhook secret
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response("Internal server error", { status: 500 });
    }

    // Get the signature from headers
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing signature header");
      return new Response("Unauthorized", { status: 401 });
    }

    // Get raw request body
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Verify signature using HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureData = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );

    const generatedSignature = Array.from(new Uint8Array(signatureData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare signatures (constant-time comparison would be better in production)
    if (generatedSignature !== signature) {
      console.error("Invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }

    // Signature is valid - process the webhook
    console.log("Valid webhook received:", body.event);

    // Only process payment.captured events
    if (body.event !== "payment.captured") {
      console.log("Ignoring event:", body.event);
      return new Response("ok", { status: 200 });
    }

    const payload = body.payload.payment.entity;
    const orderId = payload.order_id;
    const paymentId = payload.id;
    const amount = payload.amount;

    // Create admin Supabase client (service role)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get order details - we stored qr_code_id in the receipt field
    // Note: We'd need to query Razorpay API to get the receipt, or store it in our DB
    // For simplicity, we can extract from the notes if available
    const notes = payload.notes;
    const qrCodeId = notes?.qr_code_id;

    if (!qrCodeId) {
      console.error("No QR code ID found in payment notes");
      return new Response("ok", { status: 200 });
    }

    // Get the QR code to verify it exists
    const { data: qrCode, error: qrError } = await supabaseAdmin
      .from("qr_codes")
      .select("id, user_id, status")
      .eq("id", qrCodeId)
      .single();

    if (qrError || !qrCode) {
      console.error("QR code not found:", qrCodeId);
      return new Response("ok", { status: 200 });
    }

    // Calculate expiry date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update QR code to active status with new expiry
    const { error: updateError } = await supabaseAdmin
      .from("qr_codes")
      .update({
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", qrCodeId);

    if (updateError) {
      console.error("Failed to update QR code:", updateError);
      throw updateError;
    }

    // Log the payment in the payments table
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: qrCode.user_id,
        qr_code_id: qrCodeId,
        amount: amount / 100, // Convert from cents to dollars
        currency: payload.currency,
        payment_gateway: "razorpay",
        payment_id: paymentId,
        order_id: orderId,
        status: "success",
      });

    if (paymentError) {
      console.error("Failed to log payment:", paymentError);
      // Don't throw - the QR code is already updated
    }

    console.log(
      `Successfully processed payment ${paymentId} for QR code ${qrCodeId}`
    );

    // Send 200 OK to Razorpay
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to prevent Razorpay from retrying
    // Log the error for manual investigation
    return new Response("ok", { status: 200 });
  }
});
