-- Add missing columns to payments table for Razorpay integration
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_gateway text DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS order_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);