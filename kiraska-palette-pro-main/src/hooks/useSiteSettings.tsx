import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedItem, setCachedItem } from '@/lib/indexedDB';

interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: null,
    favicon_url: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateFavicon = useCallback((url: string | null) => {
    if (url) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
    }
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      // First, try to load from IndexedDB cache
      const cachedLogo = await getCachedItem('logo_url');
      const cachedFavicon = await getCachedItem('favicon_url');

      if (cachedLogo !== null || cachedFavicon !== null) {
        setSettings({
          logo_url: cachedLogo,
          favicon_url: cachedFavicon,
        });
        updateFavicon(cachedFavicon);
        setIsLoading(false);
      }

      // Then fetch from backend to get latest data
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['logo_url', 'favicon_url']);

      if (data) {
        const settingsMap: SiteSettings = {
          logo_url: null,
          favicon_url: null,
        };
        data.forEach((item) => {
          if (item.key === 'logo_url') settingsMap.logo_url = item.value;
          if (item.key === 'favicon_url') settingsMap.favicon_url = item.value;
        });

        // Update state and cache if different from cached
        const logoChanged = settingsMap.logo_url !== cachedLogo;
        const faviconChanged = settingsMap.favicon_url !== cachedFavicon;

        if (logoChanged || faviconChanged) {
          setSettings(settingsMap);
          
          // Update IndexedDB cache
          if (logoChanged) {
            await setCachedItem('logo_url', settingsMap.logo_url);
          }
          if (faviconChanged) {
            await setCachedItem('favicon_url', settingsMap.favicon_url);
            updateFavicon(settingsMap.favicon_url);
          }
        }
      }
      setIsLoading(false);
    };

    loadSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        async (payload) => {
          const record = payload.new as { key: string; value: string | null } | null;
          if (record) {
            if (record.key === 'logo_url') {
              setSettings((prev) => ({ ...prev, logo_url: record.value }));
              await setCachedItem('logo_url', record.value);
            }
            if (record.key === 'favicon_url') {
              setSettings((prev) => ({ ...prev, favicon_url: record.value }));
              await setCachedItem('favicon_url', record.value);
              updateFavicon(record.value);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateFavicon]);

  return { settings, isLoading };
}
