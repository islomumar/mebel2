-- Add is_active column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add is_active, size, and colors columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '[]'::jsonb;

-- Update products_public view to include new columns
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
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

-- Drop existing RLS policies on categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admin roles can manage categories" ON public.categories;

-- Create new RLS policies for categories
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin roles can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Drop existing RLS policies on products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admin roles can manage products" ON public.products;

-- Create new RLS policies for products
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin roles can manage products"
ON public.products
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));