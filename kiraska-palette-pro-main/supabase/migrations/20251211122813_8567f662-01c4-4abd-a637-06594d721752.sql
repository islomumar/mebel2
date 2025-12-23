-- Create site_content table for CMS
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can view site content"
ON public.site_content
FOR SELECT
USING (true);

-- Only admin can manage site content
CREATE POLICY "Admin roles can manage site content"
ON public.site_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default CMS content
INSERT INTO public.site_content (key, value, description) VALUES
-- Header
('nav_home', 'Bosh sahifa', 'Header menu - Home'),
('nav_catalog', 'Katalog', 'Header menu - Catalog'),
('nav_products', 'Mahsulotlar', 'Header menu - Products'),
('nav_about', 'Biz haqimizda', 'Header menu - About'),
('nav_contact', 'Aloqa', 'Header menu - Contact'),
('header_phone', '+998 90 123 45 67', 'Header phone number'),
('header_call_btn', 'Qo''ng''iroq', 'Header call button text'),
('header_cart_btn', 'Savat', 'Header cart button text'),

-- Hero section
('hero_title_1', 'Eksklyuziv', 'Hero title line 1'),
('hero_title_2', 'Bo''yoq Mahsulotlari', 'Hero title line 2'),
('hero_description', 'O''zbekistondagi eng katta tanlash imkoniyati. Kiraska, lak, emal, gruntovka va shpaklyovka - barchasi bir joyda. Bepul yetkazib berish!', 'Hero description'),
('hero_btn_shop', 'Xarid qilish', 'Hero shop button'),
('hero_btn_catalog', 'Katalogni ko''rish', 'Hero catalog button'),
('hero_badge_delivery', 'Bepul yetkazish', 'Hero badge - delivery'),
('hero_badge_original', 'Original', 'Hero badge - original'),
('hero_badge_colors', '1000+ ranglar', 'Hero badge - colors'),

-- Categories section
('categories_title', 'Kategoriyalar', 'Categories section title'),
('categories_description', 'Sizga kerakli bo''yoq mahsulotini toping. Qulay kategoriyalar bo''yicha ajratilgan.', 'Categories section description'),

-- Bestsellers section
('bestsellers_title', 'Eng ko''p sotiladigan', 'Bestsellers section title'),
('bestsellers_description', 'Mijozlarimiz eng ko''p sotib oladigan mahsulotlar. Sifat va narx uyg''unligi.', 'Bestsellers section description'),
('bestsellers_btn', 'Barcha mahsulotlar', 'Bestsellers button text'),

-- CTA section
('cta_title', 'Buyurtma berishga tayyormisiz?', 'CTA section title'),
('cta_description', 'Biz bilan bog''laning va professional maslahat oling. Bepul yetkazib berish va qulay to''lov imkoniyatlari.', 'CTA section description'),
('cta_btn_order', 'Buyurtma berish', 'CTA order button'),
('cta_btn_call', 'Qo''ng''iroq', 'CTA call button'),
('cta_stat_products', '1000+', 'CTA stat - products count'),
('cta_stat_products_label', 'Mahsulotlar', 'CTA stat - products label'),
('cta_stat_brands', '50+', 'CTA stat - brands count'),
('cta_stat_brands_label', 'Brendlar', 'CTA stat - brands label'),
('cta_stat_customers', '5000+', 'CTA stat - customers count'),
('cta_stat_customers_label', 'Mamnun mijozlar', 'CTA stat - customers label'),
('cta_stat_experience', '10+', 'CTA stat - experience count'),
('cta_stat_experience_label', 'Yillik tajriba', 'CTA stat - experience label'),

-- Footer
('footer_description', 'O''zbekistondagi eng katta bo''yoq va lak mahsulotlari do''koni. Sifatli mahsulotlar, qulay narxlar.', 'Footer company description'),
('footer_categories_title', 'Kategoriyalar', 'Footer categories title'),
('footer_links_title', 'Tezkor havolalar', 'Footer quick links title'),
('footer_contact_title', 'Aloqa', 'Footer contact title'),
('footer_address', 'Toshkent sh., Chilonzor tumani, 15-mavze, 25-uy', 'Footer address'),
('footer_email', 'info@kiraska.uz', 'Footer email'),
('footer_hours', 'Dush-Shan: 09:00 - 18:00', 'Footer working hours'),
('footer_copyright', 'Kiraska.uz. Barcha huquqlar himoyalangan.', 'Footer copyright text');