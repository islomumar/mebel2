import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { EditableText } from '../EditableText';

export function CTASectionEditable() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-12 lg:p-16">
          {/* Decorative drips */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                <EditableText contentKey="cta_title" fallback="Buyurtma berishga tayyormisiz?" />
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-lg mx-auto lg:mx-0">
                <EditableText contentKey="cta_description" fallback="Biz bilan bog'laning va professional maslahat oling. Bepul yetkazib berish va qulay to'lov imkoniyatlari." />
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button size="xl" className="rounded-full bg-card text-foreground hover:bg-card/90 shadow-lg">
                <EditableText contentKey="cta_btn_order" fallback="Buyurtma berish" />
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
              <Button size="xl" variant="outline" className="rounded-full border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Phone className="h-5 w-5 mr-2" />
                <EditableText contentKey="cta_btn_call" fallback="Qo'ng'iroq" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-primary-foreground/20 pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">
                <EditableText contentKey="cta_stat_products" fallback="1000+" />
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                <EditableText contentKey="cta_stat_products_label" fallback="Mahsulotlar" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">
                <EditableText contentKey="cta_stat_brands" fallback="50+" />
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                <EditableText contentKey="cta_stat_brands_label" fallback="Brendlar" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">
                <EditableText contentKey="cta_stat_customers" fallback="5000+" />
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                <EditableText contentKey="cta_stat_customers_label" fallback="Mamnun mijozlar" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">
                <EditableText contentKey="cta_stat_experience" fallback="10+" />
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                <EditableText contentKey="cta_stat_experience_label" fallback="Yillik tajriba" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
