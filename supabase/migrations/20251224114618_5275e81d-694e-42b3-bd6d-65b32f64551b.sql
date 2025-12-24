-- Allow admins to insert licenses
CREATE POLICY "Admins can insert licenses" 
ON public.licenses 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert orders (for manual license creation)
CREATE POLICY "Admins can insert orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));