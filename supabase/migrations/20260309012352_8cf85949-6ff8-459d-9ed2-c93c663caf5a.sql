
-- Create store_settings table (idempotent)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage settings" ON public.store_settings;
CREATE POLICY "Admins can manage settings"
ON public.store_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view settings" ON public.store_settings;
CREATE POLICY "Anyone can view settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults (skip on conflict)
INSERT INTO public.store_settings (key, value) VALUES
(
  'bank_details',
  '{"bank_name": "First National Bank (FNB)", "account_name": "Mamello''s Kitchen", "account_number": "62 8765 4321 0", "branch_code": "250655", "reference_prefix": "ORDER"}'::jsonb
),
(
  'business_hours',
  '{"monday": {"open": "08:00", "close": "20:00", "is_open": true}, "tuesday": {"open": "08:00", "close": "20:00", "is_open": true}, "wednesday": {"open": "08:00", "close": "20:00", "is_open": true}, "thursday": {"open": "08:00", "close": "20:00", "is_open": true}, "friday": {"open": "08:00", "close": "20:00", "is_open": true}, "saturday": {"open": "09:00", "close": "17:00", "is_open": true}, "sunday": {"open": "10:00", "close": "15:00", "is_open": false}}'::jsonb
),
(
  'notification_preferences',
  '{"send_order_confirmation": true, "send_payment_verification": true, "admin_email": "", "from_name": "Mamello''s Kitchen", "from_email": "orders@resend.dev", "support_email": "support@mamelloskitchen.com"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
