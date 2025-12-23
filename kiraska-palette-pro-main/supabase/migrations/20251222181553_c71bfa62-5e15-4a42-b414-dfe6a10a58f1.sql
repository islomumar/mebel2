-- Add SEO image and canonical URL fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_image_url text,
ADD COLUMN IF NOT EXISTS canonical_url text;

-- Add SEO image field to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS seo_image_url text;