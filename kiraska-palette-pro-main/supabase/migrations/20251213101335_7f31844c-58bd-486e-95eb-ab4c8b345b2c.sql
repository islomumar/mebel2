-- Fix: Drop and recreate products_public view without security definer
DROP VIEW IF EXISTS public.products_public;

CREATE OR REPLACE VIEW public.products_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  slug,
  brand,
  price,
  old_price,
  volume,
  short_description,
  full_description,
  image_url,
  color_name,
  is_bestseller,
  is_featured,
  in_stock,
  category_id,
  is_active,
  size,
  colors,
  created_at,
  updated_at
FROM public.products
WHERE is_active = true;