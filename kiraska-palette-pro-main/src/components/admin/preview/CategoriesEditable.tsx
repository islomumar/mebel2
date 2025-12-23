import { ArrowRight } from "lucide-react";
import { EditableText } from '../EditableText';
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

export function CategoriesEditable() {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto mt-3" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              <EditableText contentKey="categories_title" fallback="Kategoriyalar" />
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              <EditableText contentKey="categories_description" fallback="Sizga kerakli bo'yoq mahsulotini toping. Qulay kategoriyalar bo'yicha ajratilgan." />
            </p>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Kategoriyalar topilmadi. Admin panelda kategoriya qo'shing.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            <EditableText contentKey="categories_title" fallback="Kategoriyalar" />
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            <EditableText contentKey="categories_description" fallback="Sizga kerakli bo'yoq mahsulotini toping. Qulay kategoriyalar bo'yicha ajratilgan." />
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-500"
            >
              <div className="flex items-center gap-4 p-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description || ''}</p>
                  <div className="mt-2 flex items-center gap-2 text-primary font-medium text-sm opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Ko'rish <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
