import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  History, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatNumberWithSpaces } from '@/components/ui/formatted-number-input';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { uz } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  in_stock: boolean;
  image_url: string | null;
  category?: {
    name: string;
  };
}

interface WarehouseMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  created_at: string;
  created_by: string | null;
}

const ITEMS_PER_PAGE = 50;

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<WarehouseMovement[]>([]);
  const [allMovements, setAllMovements] = useState<WarehouseMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const [stockForm, setStockForm] = useState({
    action: 'IN' as 'IN' | 'OUT',
    quantity: 1,
    reason: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        stock_quantity,
        low_stock_threshold,
        in_stock,
        image_url,
        categories:category_id (name)
      `)
      .order('name');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Mahsulotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        category: item.categories,
      }));
      setProducts(mappedData);
    }
    setIsLoading(false);
  };

  const fetchAllMovements = async () => {
    setIsLoadingChart(true);
    // Get last 6 months of data
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    
    const { data, error } = await supabase
      .from('warehouse_movements')
      .select('*')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAllMovements(data as WarehouseMovement[]);
    }
    setIsLoadingChart(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchAllMovements();

    // Real-time subscription for products (stock updates)
    const productsChannel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Products change:', payload);
          fetchProducts();
        }
      )
      .subscribe();

    // Real-time subscription for warehouse movements
    const movementsChannel = supabase
      .channel('movements-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'warehouse_movements'
        },
        (payload) => {
          console.log('New movement:', payload);
          fetchAllMovements();
          // If history dialog is open, refresh it
          if (selectedProduct) {
            fetchMovementHistory(selectedProduct.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(movementsChannel);
    };
  }, [selectedProduct]);

  const fetchMovementHistory = async (productId: string) => {
    setIsLoadingHistory(true);
    
    let query = supabase
      .from('warehouse_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00`);
    }
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59`);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Tarixni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setMovements((data as WarehouseMovement[]) || []);
    }
    setIsLoadingHistory(false);
  };

  const handleOpenStockDialog = (product: Product, action: 'IN' | 'OUT') => {
    setSelectedProduct(product);
    setStockForm({ 
      action, 
      quantity: 1, 
      reason: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsStockDialogOpen(true);
  };

  const handleOpenHistoryDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
    fetchMovementHistory(product.id);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!stockForm.reason.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Sabab kiritish majburiy',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const change = stockForm.action === 'IN' ? stockForm.quantity : -stockForm.quantity;
    const newQuantity = Math.max(0, selectedProduct.stock_quantity + change);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert movement record
      const { error: movementError } = await supabase
        .from('warehouse_movements')
        .insert({
          product_id: selectedProduct.id,
          type: stockForm.action,
          quantity: stockForm.quantity,
          reason: stockForm.reason.trim(),
          created_by: user?.id || null,
          created_at: `${stockForm.date}T${format(new Date(), 'HH:mm:ss')}`,
        });

      if (movementError) throw movementError;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0,
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      toast({
        title: 'Muvaffaqiyat',
        description: stockForm.action === 'IN' ? 'Kirim muvaffaqiyatli saqlandi' : 'Chiqim muvaffaqiyatli saqlandi',
      });

      setIsStockDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (filterStatus === 'in_stock') {
        matchesFilter = product.in_stock && product.stock_quantity > product.low_stock_threshold;
      } else if (filterStatus === 'out_of_stock') {
        matchesFilter = !product.in_stock || product.stock_quantity === 0;
      } else if (filterStatus === 'low_stock') {
        matchesFilter = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filterStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.in_stock && p.stock_quantity > 0).length;
    const outOfStock = products.filter(p => !p.in_stock || p.stock_quantity === 0).length;
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

    return { total, inStock, outOfStock, lowStock, totalValue };
  }, [products]);

  // Monthly chart data
  const monthlyChartData = useMemo(() => {
    const months: { [key: string]: { name: string; kirim: number; chiqim: number } } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const key = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM', { locale: uz });
      months[key] = { name: monthName, kirim: 0, chiqim: 0 };
    }
    
    // Aggregate movements
    allMovements.forEach(movement => {
      const key = format(new Date(movement.created_at), 'yyyy-MM');
      if (months[key]) {
        if (movement.type === 'IN') {
          months[key].kirim += movement.quantity;
        } else {
          months[key].chiqim += movement.quantity;
        }
      }
    });
    
    return Object.values(months);
  }, [allMovements]);

  // Pie chart data for stock status
  const pieChartData = useMemo(() => {
    return [
      { name: 'Mavjud', value: stats.inStock, color: '#22c55e' },
      { name: 'Kam qoldi', value: stats.lowStock, color: '#eab308' },
      { name: 'Mavjud emas', value: stats.outOfStock, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Total movements stats
  const movementStats = useMemo(() => {
    const totalIn = allMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = allMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);
    return { totalIn, totalOut };
  }, [allMovements]);

  const getStatusText = (product: Product) => {
    if (!product.in_stock || product.stock_quantity === 0) return 'Mavjud emas';
    if (product.stock_quantity <= product.low_stock_threshold) return 'Kam qoldi';
    return 'Mavjud';
  };

  const exportToExcel = () => {
    const data = filteredProducts.map(product => ({
      'Mahsulot': product.name,
      'Kategoriya': product.category?.name || '-',
      'Joriy zaxira': product.stock_quantity,
      'Minimal chegara': product.low_stock_threshold,
      'Narx': product.price,
      'Umumiy qiymat': product.price * product.stock_quantity,
      'Status': getStatusText(product),
    }));

    // Add summary row
    data.push({
      'Mahsulot': 'JAMI',
      'Kategoriya': '',
      'Joriy zaxira': filteredProducts.reduce((sum, p) => sum + p.stock_quantity, 0),
      'Minimal chegara': 0,
      'Narx': 0,
      'Umumiy qiymat': stats.totalValue,
      'Status': '',
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ombor hisoboti');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Mahsulot
      { wch: 20 }, // Kategoriya
      { wch: 15 }, // Joriy zaxira
      { wch: 15 }, // Minimal chegara
      { wch: 15 }, // Narx
      { wch: 18 }, // Umumiy qiymat
      { wch: 15 }, // Status
    ];

    XLSX.writeFile(wb, `ombor-hisoboti-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: 'Muvaffaqiyat',
      description: 'Excel fayl yuklab olindi',
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Ombor Hisoboti', 14, 22);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Sana: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 30);
    
    // Stats summary
    doc.setFontSize(11);
    doc.text(`Jami mahsulotlar: ${stats.total}`, 14, 40);
    doc.text(`Mavjud: ${stats.inStock}`, 14, 46);
    doc.text(`Mavjud emas: ${stats.outOfStock}`, 80, 40);
    doc.text(`Kam qoldi: ${stats.lowStock}`, 80, 46);
    doc.text(`Jami qiymat: ${formatNumberWithSpaces(stats.totalValue)} so'm`, 14, 54);

    // Table data
    const tableData = filteredProducts.map(product => [
      product.name,
      product.category?.name || '-',
      formatNumberWithSpaces(product.stock_quantity),
      formatNumberWithSpaces(product.low_stock_threshold),
      formatNumberWithSpaces(product.price),
      getStatusText(product),
    ]);

    autoTable(doc, {
      startY: 62,
      head: [['Mahsulot', 'Kategoriya', 'Zaxira', 'Chegara', 'Narx', 'Status']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`ombor-hisoboti-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: 'Muvaffaqiyat',
      description: 'PDF fayl yuklab olindi',
    });
  };

  const getStockStatus = (product: Product) => {
    if (!product.in_stock || product.stock_quantity === 0) {
      return { label: 'Mavjud emas', color: 'text-destructive', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: XCircle };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Kam qoldi', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertTriangle };
    }
    return { label: 'Mavjud', color: 'text-green-600', bgColor: '', icon: CheckCircle };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ombor</h1>
            <p className="text-muted-foreground">Mahsulotlar zaxirasini boshqaring</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Eksport
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami mahsulotlar</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mavjud</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mavjud emas</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kam qoldi</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami qiymat</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatNumberWithSpaces(stats.totalValue)} so'm
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Oylik kirim/chiqim
              </CardTitle>
              <CardDescription>Oxirgi 6 oy statistikasi</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : monthlyChartData.every(d => d.kirim === 0 && d.chiqim === 0) ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                  <Package className="h-10 w-10 mb-2" />
                  <p>Hali harakatlar yo'q</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatNumberWithSpaces(value)}
                    />
                    <Legend />
                    <Bar dataKey="kirim" name="Kirim" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="chiqim" name="Chiqim" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart & Movement Stats */}
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Zaxira holati</CardTitle>
              </CardHeader>
              <CardContent>
                {pieChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-[120px] text-muted-foreground">
                    <p>Ma'lumot yo'q</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatNumberWithSpaces(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {pieChartData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Oxirgi 6 oy jami</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Jami kirim</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatNumberWithSpaces(movementStats.totalIn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Jami chiqim</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatNumberWithSpaces(movementStats.totalOut)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="in_stock">Mavjud</SelectItem>
                  <SelectItem value="out_of_stock">Mavjud emas</SelectItem>
                  <SelectItem value="low_stock">Kam qoldi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mahsulotlar zaxirasi</CardTitle>
            <CardDescription>
              {filteredProducts.length} ta mahsulot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">Mahsulotlar topilmadi</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahsulot</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead className="text-center">Joriy zaxira</TableHead>
                        <TableHead className="text-center">Minimal chegara</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => {
                        const status = getStockStatus(product);
                        const StatusIcon = status.icon;
                        
                        return (
                          <TableRow 
                            key={product.id}
                            className={status.bgColor}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {product.category?.name || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${status.color}`}>
                                {formatNumberWithSpaces(product.stock_quantity)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {formatNumberWithSpaces(product.low_stock_threshold)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className={`inline-flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="h-4 w-4" />
                                <span className="text-sm">{status.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenStockDialog(product, 'IN')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenStockDialog(product, 'OUT')}
                                  disabled={product.stock_quantity === 0}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenHistoryDialog(product)}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock Dialog (Kirim/Chiqim) */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {stockForm.action === 'IN' ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Kirim
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Chiqim
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct?.name} - Joriy zaxira: {formatNumberWithSpaces(selectedProduct?.stock_quantity || 0)}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStockSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Miqdor *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={stockForm.action === 'OUT' ? selectedProduct?.stock_quantity : undefined}
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Sabab *</Label>
                  <Textarea
                    id="reason"
                    placeholder={stockForm.action === 'IN' ? 'Masalan: Yetkazib beruvchidan keldi' : 'Masalan: Buyurtma uchun chiqarildi'}
                    value={stockForm.reason}
                    onChange={(e) => setStockForm((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Sana</Label>
                  <Input
                    id="date"
                    type="date"
                    value={stockForm.date}
                    onChange={(e) => setStockForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className={stockForm.action === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {stockForm.action === 'IN' ? 'Kirim saqlash' : 'Chiqim saqlash'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Harakatlar tarixi
              </DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            
            {/* Date filters */}
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="dateFrom">Sanadan</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="dateTo">Sanagacha</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => selectedProduct && fetchMovementHistory(selectedProduct.id)}
              >
                <Search className="h-4 w-4 mr-2" />
                Qidirish
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Tarix topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Turi</TableHead>
                      <TableHead className="text-center">Miqdor</TableHead>
                      <TableHead>Sabab</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(movement.created_at), 'dd.MM.yyyy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            movement.type === 'IN' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {movement.type === 'IN' ? (
                              <>
                                <TrendingUp className="h-3 w-3" />
                                Kirim
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3" />
                                Chiqim
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          <span className={movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                            {movement.type === 'IN' ? '+' : '-'}{formatNumberWithSpaces(movement.quantity)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {movement.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                Yopish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
