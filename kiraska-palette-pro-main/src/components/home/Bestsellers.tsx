import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";
import { Skeleton } from "@/components/ui/skeleton";
import { useBestsellers, formatPrice } from "@/hooks/useProducts";

export function Bestsellers() {
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  const { data: bestsellers = [], isLoading } = useBestsellers();

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              {renderText('bestsellers_title', "Eng ko'p sotiladigan")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              {renderText('bestsellers_description', "Mijozlarimiz eng ko'p sotib oladigan mahsulotlar. Sifat va narx uyg'unligi.")}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full border-2">
            <Link to={`${linkPrefix}/products`}>
              {renderText('bestsellers_btn', 'Barcha mahsulotlar')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-card p-5">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="mt-4 h-4 w-20" />
                <Skeleton className="mt-2 h-6 w-full" />
                <Skeleton className="mt-2 h-4 w-16" />
                <div className="mt-4 flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((product, index) => (
              <div key={product.id} className="group relative overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                  {product.is_bestseller && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Star className="h-3 w-3" />Bestseller
                    </span>
                  )}
                  {product.old_price && (
                    <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                      -{Math.round((1 - (product.price || 0) / product.old_price) * 100)}%
                    </span>
                  )}
                </div>

                <Link to={`${linkPrefix}/products/${product.slug}`} className="block aspect-square overflow-hidden bg-secondary/50 p-4">
                  <img src={product.image_url || '/placeholder.svg'} alt={product.name || ''} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </Link>

                <div className="p-5">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide">{product.brand}</p>
                  <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`${linkPrefix}/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.volume}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatPrice(product.price || 0)}</p>
                      {product.old_price && <p className="text-sm text-muted-foreground line-through">{formatPrice(product.old_price)}</p>}
                    </div>
                    <Button size="icon" variant="accent" className="rounded-full h-10 w-10">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
