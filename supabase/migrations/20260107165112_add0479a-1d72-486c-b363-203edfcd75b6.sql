-- Allow customers to view their own licenses through their orders
CREATE POLICY "Customers can view their own licenses"
ON public.licenses
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE customer_phone = (auth.jwt() ->> 'phone')
  )
);