-- Allow admins to insert products
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update products
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete products
CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all products (including inactive)
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));