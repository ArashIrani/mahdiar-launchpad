-- Allow customers to view their own orders by matching phone number
CREATE POLICY "Customers can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  customer_phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
);