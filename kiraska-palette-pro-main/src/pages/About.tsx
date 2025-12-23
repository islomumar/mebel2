import { Check, Users, Award, Clock, ThumbsUp, Target, Shield, Truck } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";

const About = () => {
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  const stats = [
    { icon: Clock, valueKey: "about_stat_years_value", labelKey: "about_stat_years_label", valueFallback: "10+", labelFallback: "Yillik tajriba" },
    { icon: Users, valueKey: "about_stat_clients_value", labelKey: "about_stat_clients_label", valueFallback: "5000+", labelFallback: "Mamnun mijozlar" },
    { icon: Award, valueKey: "about_stat_brands_value", labelKey: "about_stat_brands_label", valueFallback: "50+", labelFallback: "Brendlar" },
    { icon: ThumbsUp, valueKey: "about_stat_reviews_value", labelKey: "about_stat_reviews_label", valueFallback: "99%", labelFallback: "Ijobiy fikrlar" },
  ];

  const principles = [
    {
      icon: Target,
      titleKey: "about_principle_1_title",
      descKey: "about_principle_1_desc",
      titleFallback: "Sifat birinchi",
      descFallback: "Faqat original va yuqori sifatli mahsulotlarni taklif qilamiz.",
    },
    {
      icon: Shield,
      titleKey: "about_principle_2_title",
      descKey: "about_principle_2_desc",
      titleFallback: "Kafolat",
      descFallback: "Barcha mahsulotlarimiz ishlab chiqaruvchi kafolati bilan.",
    },
    {
      icon: Truck,
      titleKey: "about_principle_3_title",
      descKey: "about_principle_3_desc",
      titleFallback: "Tez yetkazib berish",
      descFallback: "Toshkent bo'ylab 24 soat ichida bepul yetkazib beramiz.",
    },
    {
      icon: Users,
      titleKey: "about_principle_4_title",
      descKey: "about_principle_4_desc",
      titleFallback: "Professional maslahat",
      descFallback: "Mutaxassislarimiz sizga eng to'g'ri tanlovni qilishda yordam beradi.",
    },
  ];

  const reasons = [
    { key: "about_reason_1", fallback: "1000+ dan ortiq mahsulotlar tanlovi" },
    { key: "about_reason_2", fallback: "Eng past narxlar kafolati" },
    { key: "about_reason_3", fallback: "Bepul yetkazib berish (100,000 so'mdan)" },
    { key: "about_reason_4", fallback: "Professional maslahat xizmati" },
    { key: "about_reason_5", fallback: "Original mahsulotlar kafolati" },
    { key: "about_reason_6", fallback: "Qulay to'lov usullari" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">
              {renderText('about_hero_title', 'Biz haqimizda')}
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
              {renderText('about_hero_description', "Kiraska.uz — O'zbekistondagi eng ishonchli bo'yoq va lak mahsulotlari do'koni. Biz 10 yildan ortiq tajribaga ega bo'lib, minglab mijozlarimizga sifatli mahsulotlar va professional xizmat ko'rsatib kelmoqdamiz.")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background -mt-8 relative z-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {renderText(stat.valueKey, stat.valueFallback)}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {renderText(stat.labelKey, stat.labelFallback)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                {renderText('about_story_title', 'Bizning hikoyamiz')}
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {renderText('about_story_p1', "2014-yilda kichik bir do'kon sifatida boshlagan yo'limiz, bugun O'zbekistonning eng yirik bo'yoq va lak mahsulotlari distributorlaridan biriga aylandi.")}
                </p>
                <p>
                  {renderText('about_story_p2', "Biz har doim sifat va mijozlar ehtiyojini birinchi o'ringa qo'yamiz. Dunyo brendlarining eng yaxshi mahsulotlarini O'zbekiston bozoriga olib kelish — bizning asosiy maqsadimiz.")}
                </p>
                <p>
                  {renderText('about_story_p3', "Professional jamoamiz sizga har qanday loyiha uchun — uyni ta'mirlash, avtomobilni bo'yash yoki sanoat ishlarida kerakli mahsulotlarni tanlashda yordam beradi.")}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=450&fit=crop"
                  alt="Bizning jamoa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-card-hover max-w-xs hidden md:block">
                <p className="text-2xl font-bold text-primary">
                  {renderText('about_experience_badge_value', '10+ yil')}
                </p>
                <p className="text-muted-foreground mt-1">
                  {renderText('about_experience_badge_label', 'Bozordagi tajribamiz')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {renderText('about_whyus_title', 'Nega aynan biz?')}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {renderText('about_whyus_description', 'Mijozlarimiz bizni tanlashining asosiy sabablari')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-5 w-5 text-accent" />
                </div>
                <span className="font-medium text-foreground">
                  {renderText(reason.key, reason.fallback)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {renderText('about_principles_title', 'Ishlash tamoyillarimiz')}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {renderText('about_principles_description', "Har bir mijoz uchun eng yaxshi xizmatni ko'rsatish — bizning asosiy maqsadimiz")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                  <principle.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {renderText(principle.titleKey, principle.titleFallback)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {renderText(principle.descKey, principle.descFallback)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;