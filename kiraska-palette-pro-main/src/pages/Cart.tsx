import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput, isValidPhone } from '@/components/ui/phone-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '+998',
    address: '',
    notes: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    
    if (!formData.customerName.trim() || !formData.address.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Iltimos, barcha maydonlarni to\'ldiring',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setPhoneError("Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          customerName: formData.customerName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          notes: formData.notes.trim(),
          products: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image,
          })),
          totalAmount,
        },
      });

      if (error) throw error;

      clearCart();
      navigate('/thank-you');
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: 'Xatolik',
        description: 'Buyurtma yuborishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !showOrderForm) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/30" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Savat bo'sh</h1>
        <p className="mt-2 text-muted-foreground">Mahsulotlarni qo'shish uchun katalogga o'ting</p>
        <Button asChild className="mt-6 rounded-full" variant="accent">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mahsulotlarga qaytish
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Savat</h1>

      {!showOrderForm ? (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover bg-secondary"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  {item.brand && (
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  )}
                  <p className="mt-1 text-lg font-bold text-primary">
                    {item.price.toLocaleString()} so'm
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {(item.price * item.quantity).toLocaleString()} so'm
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    O'chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">Jami:</span>
              <span className="text-2xl font-bold text-foreground">
                {totalAmount.toLocaleString()} so'm
              </span>
            </div>
            <Button
              variant="accent"
              size="xl"
              className="mt-6 w-full rounded-full"
              onClick={() => setShowOrderForm(true)}
            >
              Buyurtma berish
            </Button>
          </div>
        </>
      ) : (
        /* Order Form */
        <div className="mx-auto max-w-lg">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setShowOrderForm(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Savatga qaytish
          </Button>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">Buyurtma ma'lumotlari</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Ism *</Label>
                <Input
                  id="customerName"
                  placeholder="To'liq ismingiz"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam *</Label>
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(value) => {
                    setFormData({ ...formData, phone: value });
                    setPhoneError('');
                  }}
                  error={phoneError}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Manzil *</Label>
                <Textarea
                  id="address"
                  placeholder="Yetkazib berish manzili"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Qo'shimcha izoh</Label>
                <Textarea
                  id="notes"
                  placeholder="Qo'shimcha ma'lumotlar (ixtiyoriy)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="rounded-xl bg-secondary p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mahsulotlar:</span>
                  <span>{items.length} ta</span>
                </div>
                <div className="mt-2 flex justify-between font-semibold">
                  <span>Jami summa:</span>
                  <span className="text-primary">{totalAmount.toLocaleString()} so'm</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="xl"
                className="w-full rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  'Buyurtmani yuborish'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
