-- Drop the security definer view and recreate with security_invoker
DROP VIEW IF EXISTS public.site_content_by_lang;

CREATE VIEW public.site_content_by_lang 
WITH (security_invoker = true)
AS
SELECT key, lang, value, description, updated_at
FROM public.site_content;

-- Grant access to the view
GRANT SELECT ON public.site_content_by_lang TO anon;
GRANT SELECT ON public.site_content_by_lang TO authenticated;