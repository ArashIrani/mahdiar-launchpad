-- سیاست RLS برای Edge Functions (با service role)
-- جدول otp_codes فقط توسط service role قابل مدیریت است
CREATE POLICY "Service role can manage OTP codes"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);