-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category text;

-- Add sales_count column to products table for feature 4
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sales_count integer NOT NULL DEFAULT 0;

-- Add ratings columns to products table for feature 4
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS average_rating decimal(3,2);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ratings_count integer NOT NULL DEFAULT 0;

-- Create coupons table for feature 3
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL,
  min_purchase integer DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can view all coupons" ON public.coupons
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert coupons" ON public.coupons
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons" ON public.coupons
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons" ON public.coupons
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can validate coupons (read only active coupons)
CREATE POLICY "Anyone can validate active coupons" ON public.coupons
FOR SELECT USING (is_active = true);

-- Create coupon_usages table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_email text,
  discount_amount integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on coupon_usages table
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Only admins can view coupon usages
CREATE POLICY "Admins can view coupon usages" ON public.coupon_usages
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create product_ratings table for feature 4
CREATE TABLE IF NOT EXISTS public.product_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  license_id uuid NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(license_id)
);

-- Enable RLS on product_ratings table
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings" ON public.product_ratings
FOR SELECT USING (true);

-- Add coupon columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_amount integer DEFAULT 0;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS original_amount integer;