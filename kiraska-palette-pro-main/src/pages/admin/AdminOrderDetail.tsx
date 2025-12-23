import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Loader2, User, Phone, MapPin, Package, Calendar, Lock, Shield } from 'lucide-react';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  products: OrderProduct[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

interface LimitedOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Kutilmoqda',
  processing: 'Jarayonda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

  const isManager = userRole === 'manager';
  const canViewFullData = userRole === 'admin' || userRole === 'superadmin';
  const canUpdateStatus = userRole === 'admin' || userRole === 'superadmin';

  // Fetch full order for admin/superadmin
  const { data: fullOrder, isLoading: isLoadingFull } = useQuery({
    queryKey: ['admin-order-full', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Order not found');
      return data as unknown as Order;
    },
    enabled: !!id && canViewFullData,
  });

  // Fetch limited order for manager
  const { data: limitedOrderData, isLoading: isLoadingLimited } = useQuery({
    queryKey: ['admin-order-limited', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_orders_for_manager');

      if (error) throw error;
      const order = (data as LimitedOrder[]).find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    },
    enabled: !!id && isManager,
  });

  const order = canViewFullData ? fullOrder : (limitedOrderData ? {
    id: limitedOrderData.id,
    status: limitedOrderData.status as OrderStatus,
    total_amount: limitedOrderData.total_amount,
    created_at: limitedOrderData.created_at,
    updated_at: limitedOrderData.updated_at,
    customer_name: '***',
    phone: '***',
    address: null,
    products: [],
  } as Order : null);

  const isLoading = canViewFullData ? isLoadingFull : isLoadingLimited;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const { error } = await supabase
        .from('orders' as any)
        .update({ status: newStatus } as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-full', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-limited', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-limited'] });
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Buyurtma statusi yangilandi',
      });
    },
    onError: () => {
      toast({
        title: 'Xatolik',
        description: 'Statusni yangilashda xatolik yuz berdi',
        variant: 'destructive',
      });
    },
  });

  const handleSaveStatus = () => {
    if (selectedStatus && selectedStatus !== order?.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Buyurtma topilmadi</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentStatus = selectedStatus || order.status;
  const products = Array.isArray(order.products) ? order.products : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Buyurtma #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground">
                <Calendar className="mr-1 inline h-4 w-4" />
                {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <Shield className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Menejer sifatida siz faqat buyurtma ID, status va summani ko'rishingiz mumkin. 
              Mijoz ma'lumotlari va mahsulotlar ro'yxati himoyalangan.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Info - Only for admin/superadmin */}
          {canViewFullData ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mijoz ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ism</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                </div>
                {order.address && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Manzil</p>
                      <p className="font-medium">{order.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Mijoz ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Mijoz ma'lumotlari faqat admin va superadmin uchun ko'rinadi
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Update - Only for admin/superadmin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {canUpdateStatus ? "Statusni o'zgartirish" : "Buyurtma statusi"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canUpdateStatus ? (
                <>
                  <Select
                    value={currentStatus}
                    onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="processing">Jarayonda</SelectItem>
                      <SelectItem value="delivered">Yetkazildi</SelectItem>
                      <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    onClick={handleSaveStatus}
                    disabled={!selectedStatus || selectedStatus === order.status || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      'Saqlash'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <Badge variant="outline" className={`${statusColors[order.status]} text-base px-4 py-2`}>
                    {statusLabels[order.status]}
                  </Badge>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Statusni o'zgartirish faqat admin va superadmin uchun
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buyurtma summasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {order.total_amount.toLocaleString()} so'm
              </div>
              {canViewFullData && (
                <p className="text-sm text-muted-foreground mt-1">
                  {products.length} ta mahsulot
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products - Only for admin/superadmin */}
        {canViewFullData ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.length > 0 ? (
                  products.map((product: OrderProduct, index: number) => (
                    <div
                      key={product.id || index}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.price.toLocaleString()} so'm × {product.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {(product.price * product.quantity).toLocaleString()} so'm
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Mahsulotlar ma'lumoti mavjud emas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5" />
                Mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Mahsulotlar ro'yxati faqat admin va superadmin uchun ko'rinadi
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
