import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput, isValidPhone } from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, Instagram } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";
import { MapLocationEditorInline } from "@/components/admin/MapLocationEditorInline";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const [mapCoords, setMapCoords] = useState({ lat: '41.2911', lng: '69.2033' });
  const [mapKey, setMapKey] = useState(0);

  const loadMapCoords = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['map_latitude', 'map_longitude']);

    if (data) {
      const coords = { lat: '41.2911', lng: '69.2033' };
      data.forEach(item => {
        if (item.key === 'map_latitude' && item.value) coords.lat = item.value;
        if (item.key === 'map_longitude' && item.value) coords.lng = item.value;
      });
      setMapCoords(coords);
    }
  }, []);

  useEffect(() => {
    loadMapCoords();
  }, [loadMapCoords]);

  const handleMapUpdate = () => {
    loadMapCoords();
    setMapKey(prev => prev + 1);
  };

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  const contactInfo = [
    {
      icon: Phone,
      titleKey: "contact_phone_title",
      titleFallback: "Telefon",
      details: ["+998 90 123 45 67", "+998 71 234 56 78"],
      href: "tel:+998901234567",
    },
    {
      icon: Mail,
      titleKey: "contact_email_title",
      titleFallback: "Email",
      details: ["info@kiraska.uz", "sales@kiraska.uz"],
      href: "mailto:info@kiraska.uz",
    },
    {
      icon: MapPin,
      titleKey: "contact_address_title",
      titleFallback: "Manzil",
      details: ["Toshkent sh., Chilonzor tumani,", "15-mavze, 25-uy"],
      href: "#map",
    },
    {
      icon: Clock,
      titleKey: "contact_hours_title",
      titleFallback: "Ish vaqti",
      details: ["Dushanba - Shanba: 09:00 - 18:00", "Yakshanba: Dam olish"],
      href: null,
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    
    if (!formData.name.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, ismingizni kiriting",
        variant: "destructive",
      });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setPhoneError("Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Xabar yuborildi!",
      description: "Tez orada siz bilan bog'lanamiz.",
    });
    
    setFormData({ name: "", phone: "+998", message: "" });
    setIsSubmitting(false);
  };

  const getMapEmbedUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997!2d${mapCoords.lng}!3d${mapCoords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1suz!2s!4v1`;
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl text-center">
            {renderText('contact_hero_title', 'Biz bilan bog\'laning')}
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-center max-w-xl mx-auto">
            {renderText('contact_hero_description', 'Savollaringiz bormi? Biz doimo yordam berishga tayyormiz!')}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-card rounded-3xl p-8 shadow-card">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {renderText('contact_form_title', 'Xabar yuboring')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {renderText('contact_form_name_label', 'Ismingiz *')}
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ismingizni kiriting"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      {renderText('contact_form_phone_label', 'Telefon raqam *')}
                    </label>
                    <PhoneInput
                      id="phone"
                      value={formData.phone}
                      onChange={(value) => {
                        setFormData({ ...formData, phone: value });
                        setPhoneError("");
                      }}
                      error={phoneError}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      {renderText('contact_form_message_label', 'Xabaringiz')}
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Xabaringizni yozing..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Yuborilmoqda..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        {renderText('contact_form_submit', 'Xabar yuborish')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {renderText(info.titleKey, info.titleFallback)}
                    </h3>
                    <div className="mt-2 space-y-1">
                      {info.details.map((detail, i) => (
                        info.href ? (
                          <a
                            key={i}
                            href={info.href}
                            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {detail}
                          </a>
                        ) : (
                          <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="p-6 bg-card rounded-2xl shadow-card">
                <h3 className="font-semibold text-foreground mb-4">
                  {renderText('contact_social_title', 'Ijtimoiy tarmoqlar')}
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://t.me/kiraska_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    <span className="font-medium">Telegram</span>
                  </a>
                  <a
                    href="https://instagram.com/kiraska_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="font-medium">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div id="map" className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {renderText('contact_map_title', 'Bizning joylashuvimiz')}
            </h2>
            
            {/* Map Location Editor - Only in Edit Mode */}
            {isEditMode && (
              <div className="mb-4">
                <MapLocationEditorInline onUpdate={handleMapUpdate} />
              </div>
            )}
            
            <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-secondary">
              <iframe
                key={mapKey}
                src={getMapEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kiraska.uz joylashuvi"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;