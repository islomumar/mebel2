import { useEffect } from 'react';

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  url: string;
  category?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'UZS',
  availability,
  brand,
  sku,
  url,
  category,
}: ProductSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      url: `${window.location.origin}${url}`,
      ...(brand && {
        brand: {
          '@type': 'Brand',
          name: brand,
        },
      }),
      ...(sku && { sku }),
      ...(category && { category }),
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: `${window.location.origin}${url}`,
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-schema';
    script.text = JSON.stringify(schema);

    // Remove existing script if any
    const existing = document.getElementById('product-schema');
    if (existing) existing.remove();

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-schema');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, image, price, currency, availability, brand, sku, url, category]);

  return null;
}
