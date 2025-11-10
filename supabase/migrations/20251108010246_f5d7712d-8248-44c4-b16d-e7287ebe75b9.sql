-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- 1. Drop the old constraint
ALTER TABLE public.qr_codes
DROP CONSTRAINT qr_codes_status_check;

-- 2. Add the new constraint with 'blocked'
ALTER TABLE public.qr_codes
ADD CONSTRAINT qr_codes_status_check
CHECK (status IN ('active', 'trial_expired', 'paid_expired', 'reported', 'blocked'));