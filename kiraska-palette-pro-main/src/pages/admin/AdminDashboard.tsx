import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, TrendingUp, Clock, ShoppingCart, CheckCircle, XCircle, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  featuredCount: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface DailyOrderData {
  date: string;
  count: number;
}

interface CategoryStockData {
  category: string;
  stock: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    featuredCount: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dailyOrders, setDailyOrders] = useState<DailyOrderData[]>([]);
  const [categoryStock, setCategoryStock] = useState<CategoryStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        // Fetch featured products count
        const { count: featuredCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true);

        // Fetch order statistics
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: deliveredOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'delivered');

        const { count: cancelledOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled');

        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .neq('status', 'cancelled');
        
        const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        // Fetch stock statistics
        const { count: inStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('in_stock', true);

        const { count: outOfStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('in_stock', false);

        // Fetch low stock products
        const { data: lowStockData } = await supabase
          .from('products')
          .select('stock_quantity, low_stock_threshold')
          .eq('in_stock', true);
        
        const lowStockProducts = lowStockData?.filter(p => 
          (p.stock_quantity || 0) <= (p.low_stock_threshold || 5)
        ).length || 0;

        setStats({
          productsCount: productsCount || 0,
          categoriesCount: categoriesCount || 0,
          featuredCount: featuredCount || 0,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          deliveredOrders: deliveredOrders || 0,
          cancelledOrders: cancelledOrders || 0,
          totalRevenue,
          inStockProducts: inStockProducts || 0,
          outOfStockProducts: outOfStockProducts || 0,
          lowStockProducts,
        });

        // Fetch recent orders
        const { data: recent } = await supabase
          .from('orders')
          .select('id, customer_name, total_amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders((recent as RecentOrder[]) || []);

        // Fetch daily orders for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push(date.toISOString().split('T')[0]);
        }

        const { data: ordersData } = await supabase
          .from('orders')
          .select('created_at')
          .gte('created_at', last7Days[0])
          .lte('created_at', last7Days[6] + 'T23:59:59');

        const dailyOrdersMap: Record<string, number> = {};
        last7Days.forEach(date => { dailyOrdersMap[date] = 0; });
        
        ordersData?.forEach(order => {
          const orderDate = order.created_at?.split('T')[0];
          if (orderDate && dailyOrdersMap[orderDate] !== undefined) {
            dailyOrdersMap[orderDate]++;
          }
        });

        setDailyOrders(last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' }),
          count: dailyOrdersMap[date]
        })));

        // Fetch stock by category
        const { data: categoryStockData } = await supabase
          .from('products')
          .select('stock_quantity, category_id, categories(name)')
          .not('category_id', 'is', null);

        const stockByCategory: Record<string, number> = {};
        categoryStockData?.forEach((p: any) => {
          const catName = p.categories?.name || 'Boshqa';
          stockByCategory[catName] = (stockByCategory[catName] || 0) + (p.stock_quantity || 0);
        });

        setCategoryStock(Object.entries(stockByCategory).map(([category, stock]) => ({
          category,
          stock
        })));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderStatCards = [
    { title: 'Jami buyurtmalar', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-primary/10 text-primary' },
    { title: 'Kutilmoqda', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-500/10 text-yellow-500' },
    { title: 'Yetkazilgan', value: stats.deliveredOrders, icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
    { title: 'Bekor qilingan', value: stats.cancelledOrders, icon: XCircle, color: 'bg-red-500/10 text-red-500' },
  ];

  const inventoryStatCards = [
    { title: 'Jami mahsulotlar', value: stats.productsCount, icon: Package, color: 'bg-primary/10 text-primary' },
    { title: 'Mavjud', value: stats.inStockProducts, icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
    { title: 'Mavjud emas', value: stats.outOfStockProducts, icon: XCircle, color: 'bg-red-500/10 text-red-500' },
    { title: 'Kam qolgan', value: stats.lowStockProducts, icon: AlertTriangle, color: 'bg-orange-500/10 text-orange-500' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlangan',
    shipped: 'Yo\'lda',
    delivered: 'Yetkazilgan',
    cancelled: 'Bekor qilingan',
  };

  const chartColors = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308'];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Admin panel umumiy ko'rinishi</p>
        </div>

        {/* Revenue Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jami daromad</p>
              <p className="text-4xl font-bold text-primary">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="rounded-full bg-primary/20 p-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Buyurtmalar statistikasi</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {orderStatCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Kunlik buyurtmalar (so'nggi 7 kun)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stock by Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                Kategoriya bo'yicha zaxira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStock}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                      {categoryStock.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Statistics */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Ombor statistikasi</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {inventoryStatCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              So'nggi buyurtmalar
            </CardTitle>
            <CardDescription>
              Eng so'nggi 5 ta buyurtma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatPrice(Number(order.total_amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
