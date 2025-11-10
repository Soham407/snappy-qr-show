-- Create QR Codes table
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('static', 'dynamic')),
  short_url TEXT UNIQUE,
  destination_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial_expired', 'paid_expired', 'reported')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create QR Design table
CREATE TABLE public.qr_design (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  frame_text TEXT,
  logo_url TEXT,
  dot_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(qr_code_id)
);

-- Create QR Analytics table
CREATE TABLE public.qr_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  country TEXT,
  city TEXT,
  device_type TEXT
);

-- Create Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX idx_qr_codes_short_url ON public.qr_codes(short_url);
CREATE INDEX idx_qr_codes_status ON public.qr_codes(status);
CREATE INDEX idx_qr_analytics_qr_code_id ON public.qr_analytics(qr_code_id);
CREATE INDEX idx_qr_analytics_scanned_at ON public.qr_analytics(scanned_at);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_design ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_codes
CREATE POLICY "Users can view their own QR codes"
  ON public.qr_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes"
  ON public.qr_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes"
  ON public.qr_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes"
  ON public.qr_codes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for qr_design
CREATE POLICY "Users can view designs for their QR codes"
  ON public.qr_design FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_design.qr_code_id
    AND qr_codes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create designs for their QR codes"
  ON public.qr_design FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_design.qr_code_id
    AND qr_codes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update designs for their QR codes"
  ON public.qr_design FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_design.qr_code_id
    AND qr_codes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete designs for their QR codes"
  ON public.qr_design FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_design.qr_code_id
    AND qr_codes.user_id = auth.uid()
  ));

-- RLS Policies for qr_analytics
CREATE POLICY "Users can view analytics for their QR codes"
  ON public.qr_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_analytics.qr_code_id
    AND qr_codes.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert analytics (for scan tracking)"
  ON public.qr_analytics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qr_design_updated_at
  BEFORE UPDATE ON public.qr_design
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for QR code logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-logos', 'qr-logos', true);

-- Storage policies for qr-logos bucket
CREATE POLICY "Users can view all logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'qr-logos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'qr-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'qr-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );