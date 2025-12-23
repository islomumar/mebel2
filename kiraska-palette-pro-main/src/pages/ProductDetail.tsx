import { useParams, Link } from "react-router-dom";
import { formatPrice } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Star, Check, Truck, Shield, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEditMode } from "@/contexts/EditModeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { jsonToMultiLang, getLocalizedText } from "@/components/admin/MultiLangInput";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const { currentLanguage } = useLanguage();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name || '',
      price: product.price || 0,
      image: product.image_url || '/placeholder.svg',
      brand: product.brand || '',
      volume: product.volume || '',
    });
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga qo'shildi`,
    });
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Mahsulot topilmadi</h1>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to={`${linkPrefix}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mahsulotlarga qaytish
          </Link>
        </Button>
      </div>
    );
  }

  // Get localized content
  const nameMl = jsonToMultiLang(product.name_ml);
  const shortDescMl = jsonToMultiLang(product.short_description_ml);
  const fullDescMl = jsonToMultiLang(product.full_description_ml);
  const seoTitleMl = jsonToMultiLang(product.seo_title_ml);
  const seoDescMl = jsonToMultiLang(product.seo_description_ml);
  const seoKeywordsMl = jsonToMultiLang(product.seo_keywords_ml);

  const productName = getLocalizedText(nameMl, currentLanguage) || product.name;
  const productDesc = getLocalizedText(fullDescMl, currentLanguage) || product.full_description || '';
  const seoTitle = getLocalizedText(seoTitleMl, currentLanguage) || `${productName} - Kiraska.uz`;
  const seoDescription = getLocalizedText(seoDescMl, currentLanguage) || 
    getLocalizedText(shortDescMl, currentLanguage) || 
    product.short_description || 
    `${productName} - Sifatli bo'yoq va lak mahsuloti. Kiraska.uz da eng yaxshi narxlar.`;
  const seoKeywords = getLocalizedText(seoKeywordsMl, currentLanguage) || '';
  const seoImage = product.seo_image_url || product.image_url || '';

  const breadcrumbItems = [
    { name: "Bosh sahifa", url: "/" },
    { name: "Mahsulotlar", url: "/products" },
    ...(product.categories ? [{ name: product.categories.name, url: `/catalog?category=${product.categories.slug}` }] : []),
    { name: productName, url: `/product/${product.slug}` },
  ];

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        url={`/product/${product.slug}`}
        type="product"
        canonicalUrl={product.canonical_url || undefined}
      />
      <ProductSchema
        name={productName}
        description={seoDescription}
        image={seoImage || '/placeholder.svg'}
        price={product.price || 0}
        availability={product.in_stock ? 'InStock' : 'OutOfStock'}
        brand={product.brand || undefined}
        sku={product.id}
        url={`/product/${product.slug}`}
        category={product.categories?.name}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to={`${linkPrefix}/`} className="hover:text-primary transition-colors">Bosh sahifa</Link>
            <span>/</span>
            <Link to={`${linkPrefix}/products`} className="hover:text-primary transition-colors">Mahsulotlar</Link>
            {product.categories && (
              <>
                <span>/</span>
                <Link to={`${linkPrefix}/catalog?category=${product.categories.slug}`} className="hover:text-primary transition-colors">
                  {product.categories.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{productName}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/30 p-8">
              {product.is_bestseller && (
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <Star className="h-4 w-4" />
                  Bestseller
                </span>
              )}
              {product.old_price && (
                <span className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                  -{Math.round((1 - (product.price || 0) / product.old_price) * 100)}% chegirma
                </span>
              )}
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={productName}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">{product.brand}</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{productName}</h1>
                <p className="mt-2 text-muted-foreground">{product.volume}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-foreground">{formatPrice(product.price || 0)}</span>
                {product.old_price && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.old_price)}</span>
                )}
              </div>

              {/* Colors */}
              {product.color_name && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Rang:</p>
                  <span className="px-4 py-2 bg-secondary rounded-full text-sm font-medium text-secondary-foreground">
                    {product.color_name}
                  </span>
                </div>
              )}

              {/* Description */}
              {productDesc && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Tavsif:</p>
                  <p className="text-muted-foreground leading-relaxed">{productDesc}</p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Bepul yetkazib berish</p>
                    <p className="text-xs text-muted-foreground">100,000 so'mdan oshsa</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Kafolat</p>
                    <p className="text-xs text-muted-foreground">Original mahsulot</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="flex-1 rounded-full" 
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Savatga qo'shish
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full">
                  <a href="tel:+998901234567">
                    <Phone className="h-5 w-5 mr-2" />
                    Qo'ng'iroq qilish
                  </a>
                </Button>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 text-sm">
                {product.in_stock ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">Sotuvda mavjud</span>
                  </>
                ) : (
                  <span className="text-destructive">Sotuvda mavjud emas</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
