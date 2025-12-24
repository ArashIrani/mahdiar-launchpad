-- جدول ذخیره کدهای OTP
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- فعال‌سازی RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- ایندکس برای جستجوی سریع
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone);
CREATE INDEX idx_otp_codes_expires ON public.otp_codes(expires_at);