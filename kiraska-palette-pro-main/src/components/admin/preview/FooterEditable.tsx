import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";
import { EditableText } from '../EditableText';
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function FooterEditable() {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
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
              <EditableText contentKey="footer_description" fallback="O'zbekistondagi eng katta bo'yoq va lak mahsulotlari do'koni. Sifatli mahsulotlar, qulay narxlar." />
            </p>
            <div className="flex gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Send className="h-5 w-5" />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">
              <EditableText contentKey="footer_categories_title" fallback="Kategoriyalar" />
            </h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">Kiraska</span></li>
              <li><span className="text-sm text-muted-foreground">Lak</span></li>
              <li><span className="text-sm text-muted-foreground">Emal</span></li>
              <li><span className="text-sm text-muted-foreground">Gruntovka</span></li>
              <li><span className="text-sm text-muted-foreground">Shpaklyovka</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">
              <EditableText contentKey="footer_links_title" fallback="Tezkor havolalar" />
            </h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">Bosh sahifa</span></li>
              <li><span className="text-sm text-muted-foreground">Mahsulotlar</span></li>
              <li><span className="text-sm text-muted-foreground">Biz haqimizda</span></li>
              <li><span className="text-sm text-muted-foreground">Aloqa</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">
              <EditableText contentKey="footer_contact_title" fallback="Aloqa" />
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  <EditableText contentKey="footer_address" fallback="Toshkent sh., Chilonzor tumani, 15-mavze, 25-uy" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  <EditableText contentKey="header_phone" fallback="+998 90 123 45 67" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  <EditableText contentKey="footer_email" fallback="info@kiraska.uz" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  <EditableText contentKey="footer_hours" fallback="Dush-Shan: 09:00 - 18:00" />
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} <EditableText contentKey="footer_copyright" fallback="Kiraska.uz. Barcha huquqlar himoyalangan." />
          </p>
        </div>
      </div>
    </footer>
  );
}
