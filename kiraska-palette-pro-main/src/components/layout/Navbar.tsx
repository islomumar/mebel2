import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const { settings: siteSettings } = useSiteSettings();

  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const navLinks = [
    { key: 'nav_home', fallback: 'Bosh sahifa', path: "/" },
    { key: 'nav_catalog', fallback: 'Katalog', path: "/catalog" },
    { key: 'nav_products', fallback: 'Mahsulotlar', path: "/products" },
    { key: 'nav_about', fallback: 'Biz haqimizda', path: "/about" },
    { key: 'nav_contact', fallback: 'Aloqa', path: "/contact" },
  ];

  const phoneNumber = getText('header_phone', '+998 90 123 45 67');
  const phoneLink = `tel:${phoneNumber.replace(/\s/g, '')}`;

  const isActivePath = (path: string) => {
    const currentPath = location.pathname.replace('/admin/site-content', '');
    return currentPath === path || (currentPath === '' && path === '/');
  };

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to={`${linkPrefix}/`} className="flex items-center gap-2">
          {siteSettings.logo_url ? (
            <img 
              src={siteSettings.logo_url} 
              alt="Kiraska.uz" 
              className="h-10 w-auto"
            />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-xl font-bold text-primary-foreground">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">Kiraska<span className="text-primary">.uz</span></span>
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={`${linkPrefix}${link.path}`}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                isActivePath(link.path) 
                  ? "text-primary bg-primary/10 font-semibold" 
                  : "text-muted-foreground hover:text-primary hover:bg-secondary"
              )}
            >
              {renderText(link.key, link.fallback)}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <a href={phoneLink} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            <span>{renderText('header_phone', '+998 90 123 45 67')}</span>
          </a>
          <Button variant="outline" size="sm" className="rounded-full border-border text-foreground hover:bg-secondary" asChild>
            <a href={phoneLink}>
              <Phone className="h-4 w-4 mr-2" />
              {renderText('header_call_btn', "Qo'ng'iroq")}
            </a>
          </Button>
          <Button variant="accent" size="sm" className="rounded-full relative" asChild>
            <Link to={`${linkPrefix}/cart`}>
              <ShoppingCart className="h-4 w-4" />
              <span>{renderText('header_cart_btn', 'Savat')}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-foreground lg:hidden hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-card p-4 lg:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={`${linkPrefix}${link.path}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors rounded-lg",
                  isActivePath(link.path) ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {renderText(link.key, link.fallback)}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <a href={phoneLink} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {phoneNumber}
                </a>
                <LanguageSwitcher />
              </div>
              <Button variant="accent" className="w-full rounded-full relative" asChild>
                <Link to={`${linkPrefix}/cart`} onClick={() => setIsOpen(false)}>
                  <ShoppingCart className="h-4 w-4" />
                  {getText('header_cart_btn', 'Savat')}
                  {totalItems > 0 && (
                    <span className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
