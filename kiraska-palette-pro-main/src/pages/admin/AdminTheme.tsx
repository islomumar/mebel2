import { AdminLayout } from '@/components/admin/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Moon, Sun, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CustomThemeCreator } from '@/components/admin/CustomThemeCreator';

export default function AdminTheme() {
  const { 
    currentTheme, 
    setTheme, 
    themes, 
    customThemes, 
    isDarkMode, 
    toggleDarkMode,
    refreshCustomThemes 
  } = useTheme();
  const { toast } = useToast();

  const handleThemeSelect = async (themeId: string) => {
    await setTheme(themeId);
    const allThemes = [...themes, ...customThemes];
    toast({
      title: "Mavzu o'zgartirildi",
      description: `"${allThemes.find(t => t.id === themeId)?.name}" mavzusi qo'llanildi`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Mavzu sozlamalari
            </h1>
            <p className="text-muted-foreground mt-1">
              Sayt va admin panel uchun rang mavzusini tanlang
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="gap-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDarkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
          </Button>
        </div>

        {/* Custom Theme Creator */}
        <CustomThemeCreator
          customThemes={customThemes}
          onThemeCreated={refreshCustomThemes}
          onThemeDeleted={refreshCustomThemes}
          onThemeSelect={handleThemeSelect}
          currentThemeId={currentTheme.id}
        />

        <Card>
          <CardHeader>
            <CardTitle>Tayyor mavzular ({themes.length} ta)</CardTitle>
            <CardDescription>
              Tanlangan mavzu sayt va admin panelga darhol qo'llaniladi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {themes.map((theme) => {
                const isSelected = currentTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={cn(
                      "relative flex flex-col rounded-xl border-2 p-3 transition-all hover:shadow-lg",
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    {/* Color preview swatches */}
                    <div className="flex gap-1 mb-2">
                      {theme.previewColors.map((color, i) => (
                        <div
                          key={i}
                          className="h-8 flex-1 rounded-md first:rounded-l-lg last:rounded-r-lg"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground truncate">
                        {theme.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hozirgi mavzu: {currentTheme.name}</CardTitle>
            <CardDescription>{currentTheme.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Primary</p>
                <div className="h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-xs text-primary-foreground">Primary</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Secondary</p>
                <div className="h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-xs text-secondary-foreground">Secondary</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Accent</p>
                <div className="h-12 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-xs text-accent-foreground">Accent</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Muted</p>
                <div className="h-12 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Muted</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Success</p>
                <div className="h-12 rounded-lg bg-success flex items-center justify-center">
                  <span className="text-xs text-success-foreground">Success</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Warning</p>
                <div className="h-12 rounded-lg bg-warning flex items-center justify-center">
                  <span className="text-xs text-warning-foreground">Warning</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
