import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Theme, ThemeColors } from '@/data/themes';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CustomThemeCreatorProps {
  customThemes: Theme[];
  onThemeCreated: () => void;
  onThemeDeleted: () => void;
  onThemeSelect: (themeId: string) => void;
  currentThemeId: string;
}

interface ColorInput {
  key: keyof ThemeColors;
  label: string;
  description: string;
}

const colorInputs: ColorInput[] = [
  { key: 'primary', label: 'Asosiy rang', description: 'Tugmalar va asosiy elementlar' },
  { key: 'secondary', label: 'Ikkinchi rang', description: 'Ikkinchi darajali elementlar' },
  { key: 'accent', label: 'Urg\'u rangi', description: 'E\'tibor tortish uchun' },
  { key: 'background', label: 'Orqa fon', description: 'Sahifa orqa foni' },
  { key: 'foreground', label: 'Matn rangi', description: 'Asosiy matn' },
  { key: 'muted', label: 'Xiralashgan', description: 'Xiralashgan fon' },
  { key: 'border', label: 'Chegara', description: 'Chegara rangi' },
];

// Convert HEX to HSL string (e.g., "210 100% 50%")
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert HSL string to HEX
function hslToHex(hslStr: string): string {
  const parts = hslStr.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return '#808080';

  const h = parseInt(parts[1]) / 360;
  const s = parseInt(parts[2]) / 100;
  const l = parseInt(parts[3]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate contrast ratio between two colors
function getContrastRatio(hsl1: string, hsl2: string): number {
  const getLuminance = (hslStr: string): number => {
    const parts = hslStr.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!parts) return 0.5;
    return parseInt(parts[3]) / 100;
  };
  
  const l1 = getLuminance(hsl1);
  const l2 = getLuminance(hsl2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Check color harmony
function checkColorHarmony(colors: Record<string, string>): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check text contrast on background
  const bgLightness = parseInt(colors.background?.match(/(\d+)%$/)?.[1] || '50');
  const fgLightness = parseInt(colors.foreground?.match(/(\d+)%$/)?.[1] || '50');
  
  if (Math.abs(bgLightness - fgLightness) < 40) {
    warnings.push('Matn va orqa fon orasida yetarli kontrast yo\'q');
  }
  
  // Check primary contrast
  const primaryLightness = parseInt(colors.primary?.match(/(\d+)%$/)?.[1] || '50');
  if (Math.abs(bgLightness - primaryLightness) < 20) {
    warnings.push('Asosiy rang orqa fonga juda yaqin');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

// Generate auto foreground colors based on background
function generateForegroundColor(bgHsl: string): string {
  const parts = bgHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return '0 0% 15%';
  
  const l = parseInt(parts[3]);
  // If background is light, use dark foreground and vice versa
  return l > 50 ? `${parts[1]} 30% 15%` : `${parts[1]} 20% 98%`;
}

export function CustomThemeCreator({ 
  customThemes, 
  onThemeCreated, 
  onThemeDeleted,
  onThemeSelect,
  currentThemeId 
}: CustomThemeCreatorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [colors, setColors] = useState<Record<string, string>>({
    primary: '#3b82f6',
    secondary: '#f1f5f9',
    accent: '#8b5cf6',
    background: '#ffffff',
    foreground: '#1e293b',
    muted: '#f1f5f9',
    border: '#e2e8f0',
  });
  const [harmony, setHarmony] = useState<{ isValid: boolean; warnings: string[] }>({ isValid: true, warnings: [] });

  // Check harmony when colors change
  useEffect(() => {
    const hslColors: Record<string, string> = {};
    Object.entries(colors).forEach(([key, value]) => {
      hslColors[key] = hexToHsl(value);
    });
    setHarmony(checkColorHarmony(hslColors));
  }, [colors]);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!themeName.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Mavzu nomini kiriting',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert hex colors to HSL
      const primaryHsl = hexToHsl(colors.primary);
      const secondaryHsl = hexToHsl(colors.secondary);
      const accentHsl = hexToHsl(colors.accent);
      const backgroundHsl = hexToHsl(colors.background);
      const foregroundHsl = hexToHsl(colors.foreground);
      const mutedHsl = hexToHsl(colors.muted);
      const borderHsl = hexToHsl(colors.border);
      
      // Generate complementary colors
      const primaryFg = generateForegroundColor(primaryHsl);
      const secondaryFg = generateForegroundColor(secondaryHsl);
      const accentFg = generateForegroundColor(accentHsl);
      const mutedFg = generateForegroundColor(mutedHsl);

      const themeId = `custom-${Date.now()}`;
      const customTheme: Theme = {
        id: themeId,
        name: themeName.trim(),
        description: themeDescription.trim() || 'Maxsus mavzu',
        colors: {
          light: {
            primary: primaryHsl,
            primaryForeground: primaryFg,
            secondary: secondaryHsl,
            secondaryForeground: secondaryFg,
            accent: accentHsl,
            accentForeground: accentFg,
            background: backgroundHsl,
            foreground: foregroundHsl,
            card: '0 0% 100%',
            cardForeground: foregroundHsl,
            popover: '0 0% 100%',
            popoverForeground: foregroundHsl,
            muted: mutedHsl,
            mutedForeground: mutedFg,
            border: borderHsl,
            input: borderHsl,
            ring: primaryHsl,
            destructive: '0 84% 60%',
            destructiveForeground: '0 0% 100%',
            success: '142 76% 36%',
            successForeground: '0 0% 100%',
            warning: '38 92% 50%',
            warningForeground: '0 0% 100%',
          },
          dark: {
            primary: primaryHsl,
            primaryForeground: primaryFg,
            secondary: `${secondaryHsl.split(' ')[0]} 20% 18%`,
            secondaryForeground: `${secondaryHsl.split(' ')[0]} 20% 90%`,
            accent: accentHsl,
            accentForeground: accentFg,
            background: `${backgroundHsl.split(' ')[0]} 25% 8%`,
            foreground: `${foregroundHsl.split(' ')[0]} 20% 98%`,
            card: `${backgroundHsl.split(' ')[0]} 25% 12%`,
            cardForeground: `${foregroundHsl.split(' ')[0]} 20% 98%`,
            popover: `${backgroundHsl.split(' ')[0]} 25% 12%`,
            popoverForeground: `${foregroundHsl.split(' ')[0]} 20% 98%`,
            muted: `${mutedHsl.split(' ')[0]} 20% 18%`,
            mutedForeground: `${mutedHsl.split(' ')[0]} 15% 60%`,
            border: `${borderHsl.split(' ')[0]} 20% 20%`,
            input: `${borderHsl.split(' ')[0]} 20% 20%`,
            ring: primaryHsl,
            destructive: '0 62% 50%',
            destructiveForeground: '0 0% 100%',
            success: '142 76% 36%',
            successForeground: '0 0% 100%',
            warning: '38 92% 50%',
            warningForeground: '0 0% 100%',
          },
        },
        previewColors: [
          `hsl(${primaryHsl})`,
          `hsl(${backgroundHsl})`,
          `hsl(${accentHsl})`,
          `hsl(${secondaryHsl})`,
        ],
      };

      // Save to database
      const { error } = await supabase
        .from('site_settings')
        .insert({
          key: `custom_theme_${themeId}`,
          value: JSON.stringify(customTheme),
        });

      if (error) throw error;

      toast({
        title: 'Muvaffaqiyat',
        description: `"${themeName}" mavzusi yaratildi`,
      });

      setIsOpen(false);
      setThemeName('');
      setThemeDescription('');
      setColors({
        primary: '#3b82f6',
        secondary: '#f1f5f9',
        accent: '#8b5cf6',
        background: '#ffffff',
        foreground: '#1e293b',
        muted: '#f1f5f9',
        border: '#e2e8f0',
      });
      onThemeCreated();
    } catch (err) {
      console.error('Error saving custom theme:', err);
      toast({
        title: 'Xatolik',
        description: 'Mavzuni saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', `custom_theme_${themeId}`);

      if (error) throw error;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Mavzu o\'chirildi',
      });
      onThemeDeleted();
    } catch (err) {
      console.error('Error deleting theme:', err);
      toast({
        title: 'Xatolik',
        description: 'Mavzuni o\'chirishda xatolik',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Maxsus mavzular</CardTitle>
            <CardDescription>O'zingizning rang palitrangizni yarating</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Yangi mavzu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yangi maxsus mavzu yaratish</DialogTitle>
                <DialogDescription>
                  Ranglarni tanlang va mavzungizni nomlang
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-name">Mavzu nomi *</Label>
                    <Input
                      id="theme-name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="Masalan: Mening mavzum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme-desc">Tavsif</Label>
                    <Input
                      id="theme-desc"
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder="Qisqacha tavsif"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Ranglar</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {colorInputs.map((input) => (
                      <div key={input.key} className="space-y-2">
                        <Label className="text-xs">{input.label}</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={colors[input.key]}
                            onChange={(e) => handleColorChange(input.key, e.target.value)}
                            className="w-10 h-10 rounded-md border border-border cursor-pointer"
                          />
                          <Input
                            value={colors[input.key]}
                            onChange={(e) => handleColorChange(input.key, e.target.value)}
                            className="flex-1 text-xs font-mono"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{input.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Harmony warnings */}
                {harmony.warnings.length > 0 && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium text-sm">Ogohlantirish</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {harmony.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {harmony.isValid && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Ranglar mos keladi</span>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Ko'rinish</Label>
                  <div 
                    className="rounded-lg p-4 border"
                    style={{ backgroundColor: colors.background }}
                  >
                    <div className="space-y-3">
                      <h3 
                        className="font-bold"
                        style={{ color: colors.foreground }}
                      >
                        Namuna sarlavha
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: colors.foreground }}
                      >
                        Bu matn asosiy rangda ko'rsatiladi
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 rounded-md text-sm font-medium text-white"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Asosiy tugma
                        </button>
                        <button
                          className="px-4 py-2 rounded-md text-sm font-medium"
                          style={{ 
                            backgroundColor: colors.secondary,
                            color: colors.foreground 
                          }}
                        >
                          Ikkinchi tugma
                        </button>
                        <button
                          className="px-4 py-2 rounded-md text-sm font-medium text-white"
                          style={{ backgroundColor: colors.accent }}
                        >
                          Urg'u
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {customThemes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Hali maxsus mavzular yo'q</p>
            <p className="text-sm">Yangi mavzu yaratish tugmasini bosing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {customThemes.map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  className={cn(
                    "relative flex flex-col rounded-xl border-2 p-3 transition-all",
                    isSelected
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <button
                    onClick={() => onThemeSelect(theme.id)}
                    className="flex-1"
                  >
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
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mavzuni o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{theme.name}" mavzusini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          O'chirish
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
