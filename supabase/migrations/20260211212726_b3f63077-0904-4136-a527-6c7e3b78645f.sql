
-- Fix otp_codes: replace overly permissive ALL policy with restrictive ones
-- Service role bypasses RLS anyway, so we deny all access to regular users
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- Only admins can view OTP codes (for debugging), no one else needs access
CREATE POLICY "Admins can manage OTP codes"
ON public.otp_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix coupon_usages: replace overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert coupon usages" ON public.coupon_usages;

-- Only admins can insert coupon usages (edge functions use service_role which bypasses RLS)
CREATE POLICY "Admins can insert coupon usages"
ON public.coupon_usages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
