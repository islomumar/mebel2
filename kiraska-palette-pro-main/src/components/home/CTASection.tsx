import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";

export function CTASection() {
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
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-12 lg:p-16">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                {renderText('cta_title', 'Buyurtma berishga tayyormisiz?')}
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-lg mx-auto lg:mx-0">
                {renderText('cta_description', "Biz bilan bog'laning va professional maslahat oling. Bepul yetkazib berish va qulay to'lov imkoniyatlari.")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button asChild size="xl" className="rounded-full bg-card text-foreground hover:bg-card/90 shadow-lg">
                <Link to={`${linkPrefix}/products`}>
                  {renderText('cta_btn_order', 'Buyurtma berish')}
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button asChild size="xl" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg border-2 border-primary-foreground">
                <a href="tel:+998901234567">
                  <Phone className="h-5 w-5 mr-2" />
                  {renderText('cta_btn_call', "Qo'ng'iroq")}
                </a>
              </Button>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-primary-foreground/20 pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">{renderText('cta_stat_products', '1000+')}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{renderText('cta_stat_products_label', 'Mahsulotlar')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">{renderText('cta_stat_brands', '50+')}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{renderText('cta_stat_brands_label', 'Brendlar')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">{renderText('cta_stat_customers', '5000+')}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{renderText('cta_stat_customers_label', 'Mamnun mijozlar')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">{renderText('cta_stat_experience', '10+')}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{renderText('cta_stat_experience_label', 'Yillik tajriba')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
