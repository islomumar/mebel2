import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FacebookSettings {
  pixel_id: string | null;
  domain_verification: string | null;
}

export function useFacebookMeta() {
  const [settings, setSettings] = useState<FacebookSettings>({
    pixel_id: null,
    domain_verification: null,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['facebook_pixel_id', 'facebook_domain_verification']);

      if (data) {
        const settingsMap: FacebookSettings = {
          pixel_id: null,
          domain_verification: null,
        };
        data.forEach((item) => {
          if (item.key === 'facebook_pixel_id') settingsMap.pixel_id = item.value;
          if (item.key === 'facebook_domain_verification') settingsMap.domain_verification = item.value;
        });
        setSettings(settingsMap);
      }
    };

    loadSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('facebook_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          const record = payload.new as { key: string; value: string | null } | null;
          if (record) {
            if (record.key === 'facebook_pixel_id') {
              setSettings((prev) => ({ ...prev, pixel_id: record.value }));
            }
            if (record.key === 'facebook_domain_verification') {
              setSettings((prev) => ({ ...prev, domain_verification: record.value }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add/update Facebook domain verification meta tag
  useEffect(() => {
    if (settings.domain_verification) {
      let meta = document.querySelector('meta[name="facebook-domain-verification"]') as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'facebook-domain-verification';
        document.head.appendChild(meta);
      }
      meta.content = settings.domain_verification;
    } else {
      const meta = document.querySelector('meta[name="facebook-domain-verification"]');
      if (meta) {
        meta.remove();
      }
    }
  }, [settings.domain_verification]);

  // Add/update Facebook Pixel script
  useEffect(() => {
    const existingScript = document.getElementById('facebook-pixel-script');
    const existingNoScript = document.getElementById('facebook-pixel-noscript');
    
    // Remove existing scripts if pixel ID is removed
    if (!settings.pixel_id) {
      if (existingScript) existingScript.remove();
      if (existingNoScript) existingNoScript.remove();
      return;
    }

    // Add Facebook Pixel script
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement('noscript');
      noscript.id = 'facebook-pixel-noscript';
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${settings.pixel_id}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    } else {
      // Update existing script with new pixel ID
      existingScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.pixel_id}');
        fbq('track', 'PageView');
      `;
      
      if (existingNoScript) {
        const img = existingNoScript.querySelector('img');
        if (img) {
          img.src = `https://www.facebook.com/tr?id=${settings.pixel_id}&ev=PageView&noscript=1`;
        }
      }
    }
  }, [settings.pixel_id]);

  return settings;
}
