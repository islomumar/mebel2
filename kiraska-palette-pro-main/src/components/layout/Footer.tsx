import { Link, useLocation } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

export function Footer() {
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';
  const { data: categories = [] } = useCategories();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const isActivePath = (path: string) => {
    const currentPath = location.pathname.replace('/admin/site-content', '');
    return currentPath === path || (currentPath === '' && path === '/');
  };

  const isActiveCategory = (slug: string) => {
    const currentPath = location.pathname.replace('/admin/site-content', '');
    const searchParams = new URLSearchParams(location.search);
    return currentPath === '/catalog' && searchParams.get('category') === slug;
  };

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  const quickLinks = [
    { name: getText('nav_home', 'Bosh sahifa'), path: "/" },
    { name: getText('nav_products', 'Mahsulotlar'), path: "/products" },
    { name: getText('nav_about', 'Biz haqimizda'), path: "/about" },
    { name: getText('nav_contact', 'Aloqa'), path: "/contact" },
  ];

  const phoneNumber = getText('header_phone', '+998 90 123 45 67');
  const phoneLink = `tel:${phoneNumber.replace(/\s/g, '')}`;

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to={`${linkPrefix}/`} className="flex items-center gap-2">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <span className="text-xl font-bold text-primary-foreground">K</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">Kiraska<span className="text-primary">.uz</span></span>
                </>
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {renderText('footer_description', "O'zbekistondagi eng katta bo'yoq va lak mahsulotlari do'koni. Sifatli mahsulotlar, qulay narxlar.")}
            </p>
            <div className="flex gap-3">
              <a href="https://t.me/kiraska_uz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/kiraska_uz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">{renderText('footer_categories_title', 'Kategoriyalar')}</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`${linkPrefix}/catalog?category=${category.slug}`} 
                    className={cn(
                      "text-sm transition-colors",
                      isActiveCategory(category.slug) 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">{renderText('footer_links_title', 'Tezkor havolalar')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={`${linkPrefix}${link.path}`} 
                    className={cn(
                      "text-sm transition-colors",
                      isActivePath(link.path) 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">{renderText('footer_contact_title', 'Aloqa')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{renderText('footer_address', "Toshkent sh., Chilonzor tumani, 15-mavze, 25-uy")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href={phoneLink} className="text-sm text-muted-foreground hover:text-primary transition-colors">{renderText('header_phone', '+998 90 123 45 67')}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${getText('footer_email', 'info@kiraska.uz')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{renderText('footer_email', 'info@kiraska.uz')}</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">{renderText('footer_hours', 'Dush-Shan: 09:00 - 18:00')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {renderText('footer_copyright', 'Kiraska.uz. Barcha huquqlar himoyalangan.')}</p>
        </div>
      </div>
    </footer>
  );
}
