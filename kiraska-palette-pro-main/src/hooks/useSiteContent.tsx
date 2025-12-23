import { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface SiteContent {
  [key: string]: string;
}

interface SiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
  getText: (key: string, fallback?: string) => string;
  refetch: () => void;
  currentLanguage: Language;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { currentLanguage } = useLanguage();

  const { data: content = {}, isLoading, refetch } = useQuery({
    queryKey: ['site-content', currentLanguage],
    queryFn: async () => {
      // First try to get content in the current language
      const { data: langData, error: langError } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('lang', currentLanguage);

      if (langError) throw langError;

      // Also get fallback content in Uzbek (default language)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('lang', 'uz');

      if (fallbackError) throw fallbackError;

      // Build content map with fallback to Uzbek
      const contentMap: SiteContent = {};
      
      // First add all Uzbek content as fallback
      fallbackData?.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      
      // Override with current language content where available
      langData?.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      
      return contentMap;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-content'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getText = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return (
    <SiteContentContext.Provider value={{ content, isLoading, getText, refetch, currentLanguage }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
