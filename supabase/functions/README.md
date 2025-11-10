# Supabase Edge Functions

This directory contains the Supabase Edge Functions for the Quick QR application.

## Functions Overview

### 1. `qr-redirect`
Handles QR code redirects and tracks analytics for dynamic QR codes.

### 2. `qr-report`
Processes user reports for malicious or inappropriate QR codes.

### 3. `qr-expiry-cron`
Scheduled function that checks for expired QR codes and updates their status.

### 4. `create-payment-order` ✨ NEW
Creates Razorpay payment orders for upgrading dynamic QR codes to Pro.

**What it does:**
- Validates user authentication
- Verifies user owns the QR code
- Creates a Razorpay order with $10.00 amount
- Returns order_id to frontend for payment

**Required Secrets:**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### 5. `razorpay-webhook` ✨ NEW
Webhook handler for Razorpay payment confirmations.

**What it does:**
- Verifies webhook signature (CRITICAL for security)
- Processes `payment.captured` events
- Updates QR code to active status
- Sets expiry to 1 year from payment
- Logs payment in database

**Required Secrets:**
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (auto-provided)

## Deployment

### Deploy All Functions
```powershell
supabase functions deploy
```

### Deploy Specific Function
```powershell
supabase functions deploy create-payment-order
supabase functions deploy razorpay-webhook
```

## Secrets Management

### List Current Secrets
```powershell
supabase secrets list
```

### Set a Secret
```powershell
supabase secrets set SECRET_NAME="value"
```

### Required Secrets for Payment System
```powershell
supabase secrets set RAZORPAY_KEY_ID="rzp_test_xxxxx"
supabase secrets set RAZORPAY_KEY_SECRET="your_secret_key"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="webhook_secret_from_dashboard"
```

## Testing

### View Function Logs
```powershell
# Real-time logs
supabase functions logs create-payment-order --tail

# Webhook logs
supabase functions logs razorpay-webhook --tail
```

### Test Locally
```powershell
supabase functions serve create-payment-order
```

## Security Notes

1. **Never commit secrets** - They should only exist in Supabase secrets
2. **Webhook signature verification** - Always verify in `razorpay-webhook`
3. **User ownership checks** - Validate in `create-payment-order`
4. **Service role key** - Only use in webhook (never expose to frontend)

## API Endpoints

After deployment, functions are available at:
```
https://<your-project-ref>.supabase.co/functions/v1/<function-name>
```

Example:
```
https://abcdefghij.supabase.co/functions/v1/create-payment-order
https://abcdefghij.supabase.co/functions/v1/razorpay-webhook
```

## Environment Variables

Functions automatically have access to:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (use carefully!)

## Monitoring

1. **Check function health:**
   - Go to Supabase Dashboard → Edge Functions
   - View invocation count and errors

2. **Set up alerts:**
   - Configure error notifications in Supabase Dashboard
   - Monitor webhook delivery failures in Razorpay Dashboard

## Common Issues

### Function not found (404)
- Ensure function is deployed: `supabase functions deploy`
- Check function name in URL matches folder name

### Unauthorized errors
- Verify Authorization header is sent from frontend
- Check user session is valid

### Webhook signature mismatch
- Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay Dashboard
- Check you're not modifying the raw request body

### Payment created but QR not upgraded
- Check webhook logs: `supabase functions logs razorpay-webhook`
- Verify webhook URL is correct in Razorpay Dashboard
- Ensure webhook secret is set correctly

## Development Workflow

1. Make changes to function code
2. Test locally (optional): `supabase functions serve`
3. Deploy: `supabase functions deploy <function-name>`
4. Test in staging environment
5. Monitor logs for errors
6. Deploy to production

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Deno Runtime Docs](https://deno.land/manual)
