import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { EditableText } from '../EditableText';
import { Skeleton } from "@/components/ui/skeleton";

export function BestsellersEditable() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              <EditableText contentKey="bestsellers_title" fallback="Eng ko'p sotiladigan" />
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              <EditableText contentKey="bestsellers_description" fallback="Mijozlarimiz eng ko'p sotib oladigan mahsulotlar. Sifat va narx uyg'unligi." />
            </p>
          </div>
          <Button variant="outline" className="rounded-full border-2">
            <EditableText contentKey="bestsellers_btn" fallback="Barcha mahsulotlar" />
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Product placeholders */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl bg-card p-5 shadow-card">
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
      </div>
    </section>
  );
}
