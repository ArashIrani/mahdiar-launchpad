CREATE POLICY "Admins can update licenses" 
ON public.licenses 
FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));