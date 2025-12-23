-- Update categories table for multi-language support
-- Change name column to JSONB for multi-language
ALTER TABLE public.categories
  ADD COLUMN name_ml JSONB DEFAULT '{}';

-- Migrate existing data to new format
UPDATE public.categories
SET name_ml = jsonb_build_object('uz', name);

-- Change description column to JSONB for multi-language  
ALTER TABLE public.categories
  ADD COLUMN description_ml JSONB DEFAULT '{}';

-- Migrate existing description data
UPDATE public.categories
SET description_ml = CASE 
  WHEN description IS NOT NULL THEN jsonb_build_object('uz', description)
  ELSE '{}'
END;

-- Update products table for multi-language support
ALTER TABLE public.products
  ADD COLUMN name_ml JSONB DEFAULT '{}';

-- Migrate existing product names
UPDATE public.products
SET name_ml = jsonb_build_object('uz', name);

-- Add multi-language description columns
ALTER TABLE public.products
  ADD COLUMN short_description_ml JSONB DEFAULT '{}';

ALTER TABLE public.products
  ADD COLUMN full_description_ml JSONB DEFAULT '{}';

-- Migrate existing descriptions
UPDATE public.products
SET short_description_ml = CASE 
  WHEN short_description IS NOT NULL THEN jsonb_build_object('uz', short_description)
  ELSE '{}'
END,
full_description_ml = CASE 
  WHEN full_description IS NOT NULL THEN jsonb_build_object('uz', full_description)
  ELSE '{}'
END;

-- Update products_public view to include multi-language fields
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public WITH (security_invoker = true) AS
SELECT 
  id,
  category_id,
  name,
  name_ml,
  slug,
  price,
  old_price,
  brand,
  volume,
  color_name,
  in_stock,
  is_featured,
  is_bestseller,
  is_active,
  image_url,
  short_description,
  short_description_ml,
  full_description,
  full_description_ml,
  created_at,
  updated_at,
  size,
  colors
FROM public.products
WHERE is_active = true;