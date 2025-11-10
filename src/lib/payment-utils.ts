import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; // TODO: Replace with your actual Razorpay Key ID from dashboard

export interface PaymentOptions {
  qrCodeId: string;
  qrCodeName: string;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

export const initiatePayment = async ({
  qrCodeId,
  qrCodeName,
  onSuccess,
  onFailure,
}: PaymentOptions) => {
  try {
    // Get the session token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Please sign in to continue");
      return;
    }

    // Call the create-payment-order Edge Function
    const { data, error } = await supabase.functions.invoke(
      "create-payment-order",
      {
        body: { qr_code_id: qrCodeId },
      }
    );

    if (error) {
      console.error("Error creating payment order:", error);
      toast.error("Failed to initiate payment");
      onFailure?.(error);
      return;
    }

    const { order_id, amount, currency } = data;

    // Initialize Razorpay
    const options = {
      key: RAZORPAY_KEY_ID,
      order_id: order_id,
      amount: amount,
      currency: currency,
      name: "Quick QR Pro",
      description: `Upgrade "${qrCodeName}" to Pro`,
      image: "/logo.png", // Optional: Add your logo
      handler: function (response: any) {
        // Payment successful
        console.log("Payment successful:", response);
        toast.success("Payment successful! Your QR code is now upgraded.");
        onSuccess?.();
      },
      prefill: {
        email: session.user.email,
      },
      theme: {
        color: "#8B5CF6", // Your primary color
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      toast.error("Payment failed. Please try again.");
      onFailure?.(response.error);
    });

    razorpay.open();
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    toast.error("An error occurred. Please try again.");
    onFailure?.(error);
  }
};
