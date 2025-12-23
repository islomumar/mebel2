import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart,
  Users,
  LogOut,
  ChevronRight,
  Loader2,
  Warehouse,
  FileText,
  Languages,
  Settings,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, userRole, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: siteSettings } = useSiteSettings();

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const allLinks = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'manager'] },
      { name: 'Buyurtmalar', path: '/admin/orders', icon: ShoppingCart, roles: ['superadmin', 'admin', 'manager'] },
      { name: 'Mahsulotlar', path: '/admin/products', icon: Package, roles: ['superadmin', 'admin'] },
      { name: 'Ombor', path: '/admin/inventory', icon: Warehouse, roles: ['superadmin', 'admin'] },
      { name: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree, roles: ['superadmin', 'admin'] },
      { name: 'Sayt kontenti', path: '/admin/site-content', icon: FileText, roles: ['superadmin', 'admin'] },
      { name: 'Tillar', path: '/admin/languages', icon: Languages, roles: ['superadmin', 'admin'] },
      { name: 'Mavzu', path: '/admin/theme', icon: Palette, roles: ['superadmin', 'admin'] },
      { name: 'Foydalanuvchilar', path: '/admin/users', icon: Users, roles: ['superadmin'] },
      { name: 'Sozlamalar', path: '/admin/settings', icon: Settings, roles: ['superadmin', 'admin'] },
    ];

    if (!userRole) return [];
    
    return allLinks.filter(link => link.roles.includes(userRole));
  };

  const sidebarLinks = getSidebarLinks();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Role labels - hide "Super Admin" label from display for security
  const getRoleLabel = (role: string | null) => {
    const labels: Record<string, string> = {
      superadmin: 'Administrator', // Don't expose "Super Admin" terminology
      admin: 'Admin',
      manager: 'Menejer',
    };
    return role ? (labels[role] || role) : '';
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            {siteSettings.logo_url ? (
              <img 
                src={siteSettings.logo_url} 
                alt="Kiraska.uz" 
                className="h-8 w-auto"
              />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">K</span>
                </div>
                <span className="font-bold text-foreground">Admin</span>
              </>
            )}
          </div>

          {/* Navigation - scrollable */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer - fixed at bottom */}
          <div className="shrink-0 border-t border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs text-muted-foreground">
                  {user.email}
                </div>
                {userRole && (
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-1">
                    {getRoleLabel(userRole)}
                  </span>
                )}
              </div>
              <LanguageSwitcher />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-center gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </Button>
              <Link to="/" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Saytga
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
