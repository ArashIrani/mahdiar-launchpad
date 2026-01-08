-- 1. به‌روزرسانی policy برای coupon_usages - اجازه insert توسط سیستم
DROP POLICY IF EXISTS "System can insert coupon usages" ON public.coupon_usages;
CREATE POLICY "System can insert coupon usages" 
ON public.coupon_usages FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. اضافه کردن policies برای product_ratings
DROP POLICY IF EXISTS "License holders can insert ratings" ON public.product_ratings;
CREATE POLICY "License holders can insert ratings" 
ON public.product_ratings FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.licenses l 
    JOIN public.orders o ON l.order_id = o.id 
    WHERE o.customer_phone = (auth.jwt() ->> 'phone') 
    AND l.product_id = product_ratings.product_id
  )
);

DROP POLICY IF EXISTS "Users can update own ratings" ON public.product_ratings;
CREATE POLICY "Users can update own ratings" 
ON public.product_ratings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.licenses l 
    JOIN public.orders o ON l.order_id = o.id 
    WHERE o.customer_phone = (auth.jwt() ->> 'phone') 
    AND l.product_id = product_ratings.product_id
  )
);

DROP POLICY IF EXISTS "Admins can delete ratings" ON public.product_ratings;
CREATE POLICY "Admins can delete ratings" 
ON public.product_ratings FOR DELETE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- 3. اضافه کردن policy برای UPDATE orders
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. اضافه کردن policies برای user_roles INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" 
ON public.user_roles FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" 
ON public.user_roles FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" 
ON public.user_roles FOR DELETE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'));