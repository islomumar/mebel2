import { Link } from "react-router-dom";
import { ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from '../EditableText';
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function NavbarEditable() {
  const { settings } = useSiteSettings();

  const navLinks = [
    { key: 'nav_home', fallback: 'Bosh sahifa', path: "/" },
    { key: 'nav_catalog', fallback: 'Katalog', path: "/catalog" },
    { key: 'nav_products', fallback: 'Mahsulotlar', path: "/products" },
    { key: 'nav_about', fallback: 'Biz haqimizda', path: "/about" },
    { key: 'nav_contact', fallback: 'Aloqa', path: "/contact" },
  ];

  return (
    <header className="relative z-[100] w-full bg-card shadow-md border-b border-border">
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/admin/site-content" className="flex items-center gap-2">
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

        {/* Desktop Navigation - with links to edit other pages */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.key}
              to={`/admin/site-content${link.path}`}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              <EditableText contentKey={link.key} fallback={link.fallback} />
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Phone className="h-4 w-4" />
            <EditableText contentKey="header_phone" fallback="+998 90 123 45 67" />
          </span>
          <Button variant="outline" size="sm" className="rounded-full border-border text-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <EditableText contentKey="header_call_btn" fallback="Qo'ng'iroq" />
          </Button>
          <Button variant="accent" size="sm" className="rounded-full">
            <ShoppingCart className="h-4 w-4" />
            <EditableText contentKey="header_cart_btn" fallback="Savat" />
          </Button>
        </div>
      </div>
    </header>
  );
}
