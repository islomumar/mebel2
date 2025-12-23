-- Add language column to site_content table for multi-language support
ALTER TABLE public.site_content 
ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'uz';

-- Drop the unique constraint on key if it exists and create a new one for key + lang
ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_key_key;
ALTER TABLE public.site_content ADD CONSTRAINT site_content_key_lang_unique UNIQUE (key, lang);

-- Create an index for faster language-based queries
CREATE INDEX IF NOT EXISTS idx_site_content_lang ON public.site_content(lang);
CREATE INDEX IF NOT EXISTS idx_site_content_key_lang ON public.site_content(key, lang);

-- Insert default language entries for existing content (they're already in 'uz')
-- No action needed since default is 'uz'

-- Create a view for easy content retrieval by language
CREATE OR REPLACE VIEW public.site_content_by_lang AS
SELECT key, lang, value, description, updated_at
FROM public.site_content;

-- Grant access to the view
GRANT SELECT ON public.site_content_by_lang TO anon;
GRANT SELECT ON public.site_content_by_lang TO authenticated;