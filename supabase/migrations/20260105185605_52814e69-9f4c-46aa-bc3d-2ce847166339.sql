-- Remove overly permissive license validation policy
-- The license-validate Edge Function uses service_role which bypasses RLS
-- so this public SELECT policy is unnecessary and exposes all license data

DROP POLICY IF EXISTS "Validate license by key" ON public.licenses;

-- Clean up old OTP codes (verified or expired)
DELETE FROM public.otp_codes WHERE verified = true OR expires_at < NOW();