import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Loader2, Lock, CalendarIcon, X } from 'lucide-react';
import { format, isToday, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_name?: string;
  phone?: string;
  address?: string | null;
  products?: any;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
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

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const { userRole } = useAuth();

  const isManager = userRole === 'manager';
  const canViewFullData = userRole === 'admin' || userRole === 'superadmin';

  // Fetch full orders for admin/superadmin
  const { data: fullOrders, isLoading: isLoadingFull } = useQuery({
    queryKey: ['admin-orders-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Order[];
    },
    enabled: canViewFullData,
  });

  // Fetch limited orders for manager
  const { data: limitedOrders, isLoading: isLoadingLimited } = useQuery({
    queryKey: ['admin-orders-limited'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_orders_for_manager');

      if (error) throw error;
      return (data as LimitedOrder[]).map(order => ({
        id: order.id,
        status: order.status as OrderStatus,
        total_amount: order.total_amount,
        created_at: order.created_at,
      })) as Order[];
    },
    enabled: isManager,
  });

  const orders = canViewFullData ? fullOrders : limitedOrders;
  const isLoading = canViewFullData ? isLoadingFull : isLoadingLimited;

  // Filter by date range - if no date selected, show today's orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    const fromDate = dateRange?.from || new Date();
    const toDate = dateRange?.to || fromDate;

    return orders.filter((order) => {
      // Date filter
      const orderDate = new Date(order.created_at);
      const matchesDate = isWithinInterval(orderDate, {
        start: startOfDay(fromDate),
        end: endOfDay(toDate),
      });

      // Search filter
      let matchesSearch = true;
      if (searchQuery) {
        if (canViewFullData && order.customer_name && order.phone) {
          matchesSearch =
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.phone.includes(searchQuery);
        } else {
          matchesSearch = false;
        }
      }

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [orders, dateRange, searchQuery, statusFilter, canViewFullData]);

  const clearDateFilter = () => {
    setDateRange({ from: new Date(), to: new Date() });
  };

  const isShowingToday = dateRange?.from && dateRange?.to && 
    isToday(dateRange.from) && isToday(dateRange.to);

  const getDateRangeText = () => {
    if (!dateRange?.from) return "Sana tanlang";
    
    if (isShowingToday) return "Bugun";
    
    if (!dateRange.to || format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
      return format(dateRange.from, "d MMMM yyyy", { locale: uz });
    }
    
    return `${format(dateRange.from, "d MMM", { locale: uz })} - ${format(dateRange.to, "d MMM yyyy", { locale: uz })}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buyurtmalar</h1>
          <p className="text-muted-foreground">
            {isManager 
              ? 'Buyurtmalar ro\'yxati (cheklangan ma\'lumot)' 
              : 'Barcha buyurtmalarni boshqaring'}
          </p>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <Lock className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Menejer sifatida siz faqat buyurtma status va summani ko'rishingiz mumkin. 
              Mijoz ma'lumotlari himoyalangan.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateRangeText()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {!isShowingToday && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearDateFilter}
                className="h-8 w-8"
                title="Bugunga qaytish"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={canViewFullData 
                ? "Ism yoki telefon bo'yicha qidirish..." 
                : "Qidirish..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status bo'yicha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="pending">Kutilmoqda</SelectItem>
              <SelectItem value="processing">Jarayonda</SelectItem>
              <SelectItem value="delivered">Yetkazildi</SelectItem>
              <SelectItem value="cancelled">Bekor qilindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders summary */}
        <div className="text-sm text-muted-foreground">
          {getDateRangeText()} buyurtmalar: <span className="font-semibold text-foreground">{filteredOrders.length} ta</span>
        </div>

        {/* Orders Table */}
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  {canViewFullData && <TableHead>Mijoz</TableHead>}
                  {canViewFullData && <TableHead>Telefon</TableHead>}
                  <TableHead>Summa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sana/Vaqt</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    {canViewFullData && (
                      <TableCell className="font-medium">{order.customer_name}</TableCell>
                    )}
                    {canViewFullData && (
                      <TableCell>{order.phone}</TableCell>
                    )}
                    <TableCell>{order.total_amount.toLocaleString()} so'm</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status]}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(order.created_at), 'd MMM', { locale: uz })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ko'rish
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {isShowingToday 
                ? 'Bugun buyurtmalar yo\'q' 
                : `Tanlangan sanada buyurtmalar yo'q`}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
