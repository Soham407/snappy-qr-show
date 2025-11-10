# 🚀 Quick Start: Deploy Payment System

Follow these steps IN ORDER to activate the Razorpay payment integration.

## Step 1: Deploy Edge Functions (2 minutes)

```powershell
# Deploy the payment order creation function
supabase functions deploy create-payment-order

# Deploy the webhook handler
supabase functions deploy razorpay-webhook
```

## Step 2: Configure Razorpay Webhook (3 minutes)

1. **Get your webhook URL** (after deploying above):
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/razorpay-webhook
   ```
   Find your project ref in Supabase Dashboard → Settings → API

2. **Set up webhook in Razorpay:**
   - Go to https://dashboard.razorpay.com/app/webhooks
   - Click **"+ Create New Webhook"**
   - Paste your webhook URL
   - Check **"payment.captured"** event
   - Click **"Create Webhook"**
   - **COPY THE SECRET** shown on screen

3. **Add webhook secret to Supabase:**
   ```powershell
   supabase secrets set RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
   ```

## Step 3: Update Frontend with Public Key (1 minute)

1. Open `src/lib/payment-utils.ts`
2. Find line 9:
   ```typescript
   export const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID";
   ```
3. Replace with your Razorpay Key ID:
   ```typescript
   export const RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxx";
   ```
   *(Get this from Razorpay Dashboard → Settings → API Keys)*

## Step 4: Test Payment (5 minutes)

1. **Start your dev server:**
   ```powershell
   npm run dev
   ```

2. **Create a test dynamic QR code:**
   - Sign in to your app
   - Click "Create New QR"
   - Select "Dynamic"
   - Save

3. **Test the upgrade flow:**
   - You should see a trial expiry warning after 30 days
   - OR go to `/pricing` page
   - Click "Upgrade to Pro"
   - Select your QR code
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry, any CVV

4. **Verify success:**
   - Payment completes
   - You're redirected to dashboard
   - QR code shows "active" status
   - Check `payments` table in Supabase

## ✅ Verification Checklist

- [ ] Edge functions deployed successfully
- [ ] Webhook URL configured in Razorpay Dashboard
- [ ] Webhook secret set in Supabase
- [ ] `RAZORPAY_KEY_ID` updated in `payment-utils.ts`
- [ ] Test payment completed successfully
- [ ] QR code upgraded to active
- [ ] Payment recorded in database

## 🐛 Quick Troubleshooting

**Payment modal doesn't open?**
```
Check browser console → Verify RAZORPAY_KEY_ID is correct
```

**Payment succeeds but QR not upgraded?**
```powershell
# Check webhook logs
supabase functions logs razorpay-webhook --tail
```

**"No authorization header" error?**
```
Make sure you're signed in when clicking Upgrade
```

## 📞 Need Help?

1. Check `PAYMENT_SETUP.md` for detailed guide
2. Check `supabase/functions/README.md` for function docs
3. View logs: `supabase functions logs [function-name]`

## 🎉 Going Live

When ready for production:
1. Get live Razorpay keys (replace `rzp_test_` with `rzp_live_`)
2. Update all 3 places:
   - Supabase secrets: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Frontend: `src/lib/payment-utils.ts`
   - Razorpay webhook URL (keep same, just update keys)
3. Test with small real payment
4. Monitor for first few transactions

---

**Estimated Total Setup Time:** ~10 minutes
