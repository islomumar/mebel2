import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Truck, Award, Sparkles } from "lucide-react";
import heroInterior from "@/assets/hero-interior.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";

export function HeroBanner() {
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroInterior}
          alt="Interior Design"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-secondary/20 blur-2xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Premium Interior Solutions</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            {renderText('hero_title_1', 'Eksklyuziv')}
            <span className="block text-primary drop-shadow-lg">
              {renderText('hero_title_2', "Bo'yoq Mahsulotlari")}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            {renderText('hero_description', "O'zbekistondagi eng katta tanlash imkoniyati. Kiraska, lak, emal, gruntovka va shpaklyovka - barchasi bir joyda. Bepul yetkazib berish!")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild variant="accent" size="xl" className="rounded-full shadow-glow text-lg px-8">
              <Link to={`${linkPrefix}/products`}>
                {renderText('hero_btn_shop', 'Xarid qilish')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-full border-2 backdrop-blur-sm bg-background/50 text-lg px-8">
              <Link to={`${linkPrefix}/catalog`}>
                {renderText('hero_btn_catalog', "Katalogni ko'rish")}
              </Link>
            </Button>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-8 pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground">
                  {renderText('hero_badge_delivery', 'Bepul yetkazish')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {renderText('hero_badge_delivery_desc', "Toshkent bo'ylab")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground">
                  {renderText('hero_badge_original', 'Original')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {renderText('hero_badge_original_desc', 'Sifat kafolati')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground">
                  {renderText('hero_badge_colors', '1000+ ranglar')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {renderText('hero_badge_colors_desc', 'Keng tanlov')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
