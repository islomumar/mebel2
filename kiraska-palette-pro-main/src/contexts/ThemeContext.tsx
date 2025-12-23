import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { predefinedThemes, getThemeById, DEFAULT_THEME_ID, Theme, ThemeColors } from '@/data/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  setCustomTheme: (theme: Theme) => void;
  themes: Theme[];
  customThemes: Theme[];
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshCustomThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeColors = (colors: ThemeColors) => {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--popover', colors.popover);
  root.style.setProperty('--popover-foreground', colors.popoverForeground);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--muted-foreground', colors.mutedForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
  
  // Custom status colors
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--success-foreground', colors.successForeground);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--warning-foreground', colors.warningForeground);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(DEFAULT_THEME_ID)!);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme colors when theme or dark mode changes
  useEffect(() => {
    const colors = isDarkMode ? currentTheme.colors.dark : currentTheme.colors.light;
    applyThemeColors(colors);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, isDarkMode]);

  // Load custom themes from database
  const refreshCustomThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .like('key', 'custom_theme_%');

      if (!error && data) {
        const themes: Theme[] = [];
        data.forEach(item => {
          try {
            const theme = JSON.parse(item.value || '{}') as Theme;
            if (theme.id && theme.name) {
              themes.push(theme);
            }
          } catch (e) {
            console.error('Error parsing custom theme:', e);
          }
        });
        setCustomThemes(themes);
      }
    } catch (err) {
      console.error('Error loading custom themes:', err);
    }
  }, []);

  // Load theme from database on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First load custom themes
        await refreshCustomThemes();

        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'theme_id')
          .maybeSingle();

        if (!error && data?.value) {
          // Check predefined themes first
          let theme = getThemeById(data.value);
          
          // If not found in predefined, check custom themes
          if (!theme) {
            const { data: customData } = await supabase
              .from('site_settings')
              .select('value')
              .eq('key', `custom_theme_${data.value}`)
              .maybeSingle();
            
            if (customData?.value) {
              try {
                theme = JSON.parse(customData.value) as Theme;
              } catch (e) {
                console.error('Error parsing saved custom theme:', e);
              }
            }
          }
          
          if (theme) {
            setCurrentTheme(theme);
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [refreshCustomThemes]);

  const setTheme = useCallback(async (themeId: string) => {
    // Check predefined themes first
    let theme = getThemeById(themeId);
    
    // If not found, check custom themes
    if (!theme) {
      theme = customThemes.find(t => t.id === themeId);
    }
    
    if (!theme) return;

    setCurrentTheme(theme);

    // Save to database
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'theme_id')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_settings')
          .update({ value: themeId, updated_at: new Date().toISOString() })
          .eq('key', 'theme_id');
      } else {
        await supabase
          .from('site_settings')
          .insert({ key: 'theme_id', value: themeId });
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  }, [customThemes]);

  const setCustomTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        setCustomTheme,
        themes: predefinedThemes,
        customThemes,
        isLoading,
        isDarkMode,
        toggleDarkMode,
        refreshCustomThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
