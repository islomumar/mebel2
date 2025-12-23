-- Add position column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Add position column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Add SEO fields to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title_ml JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description_ml JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_keywords_ml JSONB DEFAULT '{}'::jsonb;

-- Add SEO fields to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_title_ml JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description_ml JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_keywords_ml JSONB DEFAULT '{}'::jsonb;

-- Add shop_id to stock_history for multi-shop support (nullable for now)
ALTER TABLE public.stock_history ADD COLUMN IF NOT EXISTS shop_id UUID DEFAULT NULL;

-- Create languages table for dynamic language management
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    flag TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on languages table
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Create policies for languages table
CREATE POLICY "Anyone can view active languages" ON public.languages
FOR SELECT USING (is_active = true);

CREATE POLICY "Admin roles can manage languages" ON public.languages
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Create site_settings table for logo and favicon
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on site_settings table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings table
CREATE POLICY "Anyone can view site settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admin roles can manage site settings" ON public.site_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Insert default languages
INSERT INTO public.languages (code, name, flag, is_active, is_default, position) VALUES
('uz', 'O''zbekcha', '🇺🇿', true, true, 1),
('ky', 'Кыргызча', '🇰🇬', true, false, 2),
('tj', 'Тоҷикӣ', '🇹🇯', true, false, 3),
('ru', 'Русский', '🇷🇺', true, false, 4),
('zh', '中文', '🇨🇳', true, false, 5)
ON CONFLICT (code) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
('logo_url', NULL),
('favicon_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);
CREATE INDEX IF NOT EXISTS idx_categories_position ON public.categories(position);
CREATE INDEX IF NOT EXISTS idx_languages_position ON public.languages(position);
CREATE INDEX IF NOT EXISTS idx_stock_history_timestamp ON public.stock_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_stock_history_product_timestamp ON public.stock_history(product_id, timestamp);