import { useEffect } from 'react';

interface CategorySchemaProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  productCount?: number;
}

export function CategorySchema({
  name,
  description,
  image,
  url,
  productCount,
}: CategorySchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      ...(image && { image }),
      url: `${window.location.origin}${url}`,
      ...(productCount && {
        numberOfItems: productCount,
      }),
      mainEntity: {
        '@type': 'ItemList',
        name,
        description,
        numberOfItems: productCount || 0,
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'category-schema';
    script.text = JSON.stringify(schema);

    // Remove existing script if any
    const existing = document.getElementById('category-schema');
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('category-schema');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, image, url, productCount]);

  return null;
}
