-- Drop existing view
DROP VIEW IF EXISTS public.products_public;

-- Recreate view with security_invoker = true
-- This makes the view respect the RLS policies of the underlying table
CREATE VIEW public.products_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  name_ml,
  slug,
  short_description,
  short_description_ml,
  full_description,
  full_description_ml,
  price,
  old_price,
  image_url,
  category_id,
  brand,
  volume,
  size,
  color_name,
  colors,
  in_stock,
  is_featured,
  is_bestseller,
  is_active,
  created_at,
  updated_at
FROM public.products
WHERE is_active = true;