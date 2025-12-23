import { ReactNode, useEffect, useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { EditContentModal } from './EditContentModal';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AdminSiteContentLayoutProps {
  children: ReactNode;
}

export function AdminSiteContentLayout({ children }: AdminSiteContentLayoutProps) {
  const { setEditMode } = useEditMode();
  const location = useLocation();
  const [firstProductSlug, setFirstProductSlug] = useState<string | null>(null);

  useEffect(() => {
    setEditMode(true);
    return () => setEditMode(false);
  }, [setEditMode]);

  useEffect(() => {
    const fetchFirstProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('slug')
        .eq('is_active', true)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setFirstProductSlug(data.slug);
      }
    };
    fetchFirstProduct();
  }, []);

  const pageLinks = [
    { path: '/admin/site-content', label: 'Bosh sahifa' },
    { path: '/admin/site-content/catalog', label: 'Katalog' },
    { path: '/admin/site-content/products', label: 'Mahsulotlar' },
    ...(firstProductSlug ? [{ path: `/admin/site-content/products/${firstProductSlug}`, label: 'Mahsulot (namuna)' }] : []),
    { path: '/admin/site-content/about', label: 'Biz haqimizda' },
    { path: '/admin/site-content/contact', label: 'Aloqa' },
  ];

  const isActivePath = (path: string) => {
    // For product detail, check if it starts with the products path
    if (path.includes('/products/') && location.pathname.includes('/admin/site-content/products/')) {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header Bar */}
      <div className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin panel
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <span className="font-semibold text-foreground">Sayt kontentini tahrirlash</span>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Eye className="h-4 w-4" />
            Tahrirlash rejimi
          </Badge>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-card/50 border-b border-border">
        <div className="container">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto">
            {pageLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  isActivePath(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Site Preview */}
      <div className="min-h-[calc(100vh-112px)]">
        {children}
      </div>

      {/* Edit Modal */}
      <EditContentModal />

      {/* Help Tooltip */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <div className="bg-card/95 backdrop-blur border border-border rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">
            💡 Matn ustiga kursorni olib boring va <Pencil className="h-3 w-3 inline text-primary" /> tugmasini bosing yoki yuqoridagi "Kontentni tahrirlash" tugmasini bosing
          </p>
        </div>
      </div>
    </div>
  );
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
