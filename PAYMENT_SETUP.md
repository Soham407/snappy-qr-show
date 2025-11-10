# Razorpay Payment Integration Setup Guide

This guide will help you complete the Razorpay payment integration for Quick QR Pro.

## ✅ What's Already Done

1. ✅ **Edge Functions Created:**
   - `create-payment-order` - Creates Razorpay orders
   - `razorpay-webhook` - Processes payment confirmations

2. ✅ **Frontend Integration:**
   - Razorpay checkout script added to `index.html`
   - Payment utilities in `src/lib/payment-utils.ts`
   - Dashboard upgrade buttons
   - Pricing page payment flow

3. ✅ **Edge Function Secrets Set:**
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

## 🚀 Next Steps to Complete Setup

### Step 1: Deploy the Edge Functions

Deploy both Edge Functions to Supabase:

```powershell
# Deploy create-payment-order function
supabase functions deploy create-payment-order

# Deploy razorpay-webhook function
supabase functions deploy razorpay-webhook
```

### Step 2: Configure Razorpay Webhook

1. **Get Your Webhook URL:**
   - After deploying, your webhook URL will be:
   - `https://<your-project-ref>.supabase.co/functions/v1/razorpay-webhook`
   - Replace `<your-project-ref>` with your actual Supabase project reference

2. **Create Webhook Secret in Razorpay Dashboard:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Navigate to **Settings** → **Webhooks**
   - Click **"+ New Webhook"**
   - Enter your webhook URL
   - Select **"payment.captured"** event
   - Click **"Generate Secret"** and copy it

3. **Add Webhook Secret to Supabase:**
   ```powershell
   supabase secrets set RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
   ```

### Step 3: Update Frontend with Razorpay Key ID

1. **Open `src/lib/payment-utils.ts`**

2. **Replace the placeholder:**
   ```typescript
   export const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID";
   ```
   
   With your actual Razorpay Key ID (this is SAFE to expose in frontend):
   ```typescript
   export const RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxx"; // or rzp_live_xxxxxxxxxxxxx
   ```

### Step 4: Test the Payment Flow

#### Test Mode (Recommended First):
1. Use test keys (starting with `rzp_test_`)
2. Use Razorpay test card: `4111 1111 1111 1111`
3. Any future CVV and expiry date

#### Testing Steps:
1. Sign in to your app
2. Create a dynamic QR code (if you don't have one)
3. Wait for trial expiry warning OR go to Pricing page
4. Click "Upgrade to Pro"
5. Select QR code from the dialog
6. Complete payment in Razorpay modal
7. Verify:
   - QR code status changed to "active"
   - `expires_at` set to 1 year from now
   - Payment logged in `payments` table

### Step 5: Verify Webhook is Working

1. **Check Supabase Function Logs:**
   ```powershell
   supabase functions logs razorpay-webhook
   ```

2. **Check Razorpay Dashboard:**
   - Go to **Webhooks** section
   - You should see successful webhook deliveries

3. **Check Database:**
   - Verify `qr_codes` table updated
   - Verify `payments` table has new record

## 🔒 Security Checklist

- ✅ `RAZORPAY_KEY_SECRET` is stored as Edge Function secret (never in frontend)
- ✅ `RAZORPAY_WEBHOOK_SECRET` is stored as Edge Function secret
- ✅ Webhook signature verification is implemented
- ✅ User ownership verification in `create-payment-order`
- ✅ Frontend only receives order_id, not sensitive data

## 🐛 Troubleshooting

### Payment doesn't complete:
- Check browser console for errors
- Verify `RAZORPAY_KEY_ID` in `payment-utils.ts` is correct
- Check that Razorpay script loaded (`index.html`)

### Webhook not firing:
- Verify webhook URL is correct in Razorpay Dashboard
- Check webhook secret matches in both places
- View function logs: `supabase functions logs razorpay-webhook`

### QR code not upgrading:
- Check webhook signature is valid
- Verify `qr_code_id` is in payment notes
- Check database permissions for `payments` table

## 📊 Testing Commands

```powershell
# View create-payment-order logs
supabase functions logs create-payment-order

# View webhook logs
supabase functions logs razorpay-webhook

# Check current secrets
supabase secrets list

# Redeploy after changes
supabase functions deploy create-payment-order
supabase functions deploy razorpay-webhook
```

## 🎉 Production Checklist

Before going live:
1. ⬜ Switch to live Razorpay keys (`rzp_live_`)
2. ⬜ Update webhook URL to production URL
3. ⬜ Test with real payment (can refund immediately)
4. ⬜ Set up email notifications for successful payments
5. ⬜ Monitor webhook logs for first week

## 💡 Next Enhancements

Consider adding:
- Email receipt after successful payment
- Payment history page for users
- Refund handling
- Failed payment retry logic
- Multiple payment methods

---

**Need Help?** Check the Razorpay docs: https://razorpay.com/docs/payments/
