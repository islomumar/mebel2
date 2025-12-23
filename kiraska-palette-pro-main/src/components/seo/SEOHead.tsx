import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  canonicalUrl?: string;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  canonicalUrl,
  noindex = false,
}: SEOHeadProps) {
  const { currentLanguage } = useLanguage();
  
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const ogImage = image || `${siteUrl}/logo.png`;
  const canonical = canonicalUrl || fullUrl;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // Robots
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:locale', getLocale(currentLanguage), true);
    setMeta('og:site_name', 'Kiraska.uz', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical URL
    setLink('canonical', canonical);

    // Cleanup - remove robots if not noindex
    return () => {
      if (!noindex) {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
          robotsMeta.setAttribute('content', 'index, follow');
        }
      }
    };
  }, [title, description, keywords, ogImage, fullUrl, type, canonical, noindex, currentLanguage]);

  return null;
}

function getLocale(lang: string): string {
  const locales: Record<string, string> = {
    uz: 'uz_UZ',
    ru: 'ru_RU',
    ky: 'ky_KG',
    tj: 'tg_TJ',
    zh: 'zh_CN',
  };
  return locales[lang] || 'uz_UZ';
}
