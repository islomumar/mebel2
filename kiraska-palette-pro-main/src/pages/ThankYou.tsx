import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Phone } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="container py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-foreground">
          Rahmat!
        </h1>
        
        <p className="mt-4 text-lg text-muted-foreground">
          Sizning buyurtmangiz qabul qilindi. Tez orada operatorlarimiz siz bilan bog'lanishadi.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Savollaringiz bo'lsa, qo'ng'iroq qiling:</p>
          <a
            href="tel:+998901234567"
            className="mt-2 flex items-center justify-center gap-2 text-xl font-semibold text-primary hover:underline"
          >
            <Phone className="h-5 w-5" />
            +998 90 123 45 67
          </a>
        </div>

        <Button asChild variant="accent" size="lg" className="mt-8 rounded-full">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Bosh sahifaga qaytish
          </Link>
        </Button>
      </div>
    </div>
  );
}
