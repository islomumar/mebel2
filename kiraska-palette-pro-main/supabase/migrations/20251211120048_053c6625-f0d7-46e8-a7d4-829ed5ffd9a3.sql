-- Fix the SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  slug,
  brand,
  category_id,
  price,
  old_price,
  in_stock,
  is_featured,
  is_bestseller,
  volume,
  color_name,
  image_url,
  short_description,
  full_description,
  created_at,
  updated_at
FROM public.products;

-- Grant access to the public view
GRANT SELECT ON public.products_public TO anon, authenticated;