-- Add payment tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method text DEFAULT 'bank_transfer',
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_proof_url text;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false);

-- RLS policy: Users can upload their own payment proofs
CREATE POLICY "Users can upload payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can view their own payment proofs
CREATE POLICY "Users can view own payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);