-- Drop the insecure policy that references user_metadata
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

-- Create a secure policy using auth.jwt() phone claim from verified OTP
-- Since OTP verification stores the phone in raw_user_meta_data during signup,
-- we need to use a different approach - match against the phone stored at signup time
-- The phone claim comes from the authenticated session after OTP verification
CREATE POLICY "Customers can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  customer_phone = (auth.jwt() ->> 'phone')
);