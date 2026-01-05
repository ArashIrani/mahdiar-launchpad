-- Create atomic increment function for products sales_count
CREATE OR REPLACE FUNCTION public.increment_sales_count(product_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products 
  SET sales_count = sales_count + 1 
  WHERE id = product_uuid;
END;
$$;

-- Create atomic increment function for coupons used_count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_uuid;
END;
$$;