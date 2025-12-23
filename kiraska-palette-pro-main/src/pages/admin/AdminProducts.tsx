import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Package, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ProductFilters, ProductFiltersState, defaultProductFilters } from '@/components/admin/ProductFilters';
import { SEOStatusBadge } from '@/components/admin/SEOStatusBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { jsonToMultiLang, MultiLangValue, getLocalizedText } from '@/components/admin/MultiLangInput';

interface Product {
  id: string;
  name: string;
  name_ml: MultiLangValue;
  brand: string | null;
  price: number;
  old_price: number | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_active: boolean;
  image_url: string | null;
  category_id: string | null;
  position: number;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  created_at: string | null;
  seo_title_ml: MultiLangValue;
  seo_description_ml: MultiLangValue;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 50;

export default function AdminProducts() {
  const { currentLanguage } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [activeLanguages, setActiveLanguages] = useState<string[]>(['uz']);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersState>(defaultProductFilters);
  const { toast } = useToast();

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      const { data } = await supabase
        .from('languages')
        .select('code')
        .eq('is_active', true);
      if (data) {
        setActiveLanguages(data.map((l) => l.code));
      }
    };
    fetchLanguages();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, name_ml, brand, price, old_price, in_stock, is_featured, is_bestseller, 
        is_active, image_url, category_id, position, stock_quantity, low_stock_threshold,
        created_at, seo_title_ml, seo_description_ml,
        categories(name)
      `)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Xatolik',
        description: 'Mahsulotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const mappedProducts = (data || []).map(p => ({
        ...p,
        name_ml: jsonToMultiLang(p.name_ml),
        seo_title_ml: jsonToMultiLang(p.seo_title_ml),
        seo_description_ml: jsonToMultiLang(p.seo_description_ml),
      }));
      setProducts(mappedProducts);
      
      // Extract unique brands
      const uniqueBrands = [...new Set(
        mappedProducts
          .map(p => p.brand)
          .filter((b): b is string => !!b)
      )].sort();
      setBrands(uniqueBrands);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: "Mahsulot muvaffaqiyatli o'chirildi",
      });
      fetchProducts();
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: "Holatni o'zgartirishda xatolik yuz berdi",
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: isActive ? 'Mahsulot faollashtirildi' : 'Mahsulot yashirildi',
      });
      fetchProducts();
    }
  };

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((p) => {
        const name = getLocalizedText(p.name_ml, currentLanguage) || p.name;
        return (
          name.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.categories?.name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((p) => 
        filters.status === 'active' ? p.is_active : !p.is_active
      );
    }

    // Stock filter
    if (filters.stock !== 'all') {
      result = result.filter((p) => {
        const qty = p.stock_quantity ?? 0;
        const threshold = p.low_stock_threshold ?? 5;
        
        if (filters.stock === 'in_stock') return p.in_stock && qty > threshold;
        if (filters.stock === 'out_of_stock') return !p.in_stock || qty === 0;
        if (filters.stock === 'low_stock') return p.in_stock && qty > 0 && qty <= threshold;
        return true;
      });
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((p) => p.category_id === filters.category);
    }

    // Brand filter
    if (filters.brand !== 'all') {
      result = result.filter((p) => p.brand === filters.brand);
    }

    // Image filter
    if (filters.image !== 'all') {
      result = result.filter((p) =>
        filters.image === 'has_image' ? !!p.image_url : !p.image_url
      );
    }

    // Translation filter
    if (filters.translation !== 'all') {
      result = result.filter((p) => {
        const translatedLangs = activeLanguages.filter((lang) => {
          const nameVal = p.name_ml[lang];
          return nameVal && nameVal.trim() !== '';
        });
        
        const totalLangs = activeLanguages.length;
        const translatedCount = translatedLangs.length;

        if (filters.translation === 'fully_translated') return translatedCount === totalLangs;
        if (filters.translation === 'partially_translated') return translatedCount > 1 && translatedCount < totalLangs;
        return translatedCount <= 1;
      });
    }

    // SEO filter
    if (filters.seo !== 'all') {
      result = result.filter((p) => {
        const hasTitle = p.seo_title_ml[currentLanguage] && p.seo_title_ml[currentLanguage].trim() !== '';
        const hasDesc = p.seo_description_ml[currentLanguage] && p.seo_description_ml[currentLanguage].trim() !== '';
        const seoComplete = hasTitle && hasDesc;
        
        return filters.seo === 'seo_complete' ? seoComplete : !seoComplete;
      });
    }

    // Featured filter
    if (filters.featured !== 'all') {
      result = result.filter((p) => {
        if (filters.featured === 'featured') return p.is_featured;
        if (filters.featured === 'bestseller') return p.is_bestseller;
        return !p.is_featured && !p.is_bestseller;
      });
    }

    // Price/Discount filter
    if (filters.price !== 'all') {
      result = result.filter((p) => {
        const hasDiscount = p.old_price && p.old_price > p.price;
        return filters.price === 'has_discount' ? hasDiscount : !hasDiscount;
      });
    }

    // Date filter
    if (filters.dateFrom) {
      result = result.filter((p) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= filters.dateFrom!;
      });
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((p) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) <= endOfDay;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'position_asc':
          return (a.position ?? 0) - (b.position ?? 0);
        case 'position_desc':
          return (b.position ?? 0) - (a.position ?? 0);
        case 'name_asc':
          return (getLocalizedText(a.name_ml, currentLanguage) || a.name).localeCompare(
            getLocalizedText(b.name_ml, currentLanguage) || b.name
          );
        case 'name_desc':
          return (getLocalizedText(b.name_ml, currentLanguage) || b.name).localeCompare(
            getLocalizedText(a.name_ml, currentLanguage) || a.name
          );
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'stock_asc':
          return (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0);
        case 'stock_desc':
          return (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0);
        case 'created_newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'created_oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [products, filters, currentLanguage, activeLanguages]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleMoveUp = async (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === 0) return;
    const currentProduct = filteredProducts[globalIndex];
    const prevProduct = filteredProducts[globalIndex - 1];
    
    await supabase.from('products').update({ position: prevProduct.position }).eq('id', currentProduct.id);
    await supabase.from('products').update({ position: currentProduct.position }).eq('id', prevProduct.id);
    fetchProducts();
  };

  const handleMoveDown = async (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === filteredProducts.length - 1) return;
    const currentProduct = filteredProducts[globalIndex];
    const nextProduct = filteredProducts[globalIndex + 1];
    
    await supabase.from('products').update({ position: nextProduct.position }).eq('id', currentProduct.id);
    await supabase.from('products').update({ position: currentProduct.position }).eq('id', nextProduct.id);
    fetchProducts();
  };

  // Translation status helper
  const getTranslationStatus = (product: Product) => {
    const translatedCount = activeLanguages.filter(
      (lang) => product.name_ml[lang] && product.name_ml[lang].trim() !== ''
    ).length;
    const total = activeLanguages.length;
    
    if (translatedCount === total) return { label: "To'liq", variant: 'default' as const };
    if (translatedCount > 1) return { label: `${translatedCount}/${total}`, variant: 'secondary' as const };
    return { label: 'Faqat UZ', variant: 'outline' as const };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mahsulotlar</h1>
            <p className="text-muted-foreground">
              Barcha mahsulotlarni boshqarish
            </p>
          </div>
          <Link to="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yangi mahsulot
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              brands={brands}
              activeLanguages={activeLanguages}
            />
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Mahsulotlar ro'yxati ({filteredProducts.length}
              {filteredProducts.length !== products.length && ` / ${products.length}`})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {products.length === 0 ? 'Mahsulotlar topilmadi' : "Filtr bo'yicha natija topilmadi"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">№</TableHead>
                        <TableHead>Rasm</TableHead>
                        <TableHead>Nomi</TableHead>
                        <TableHead>Brend</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Narxi</TableHead>
                        <TableHead className="text-center">Tarjima</TableHead>
                        <TableHead className="text-center">SEO</TableHead>
                        <TableHead>Faol</TableHead>
                        <TableHead>Holati</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product, index) => {
                        const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                        const translationStatus = getTranslationStatus(product);
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <span>{globalIndex + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {getLocalizedText(product.name_ml, currentLanguage) || product.name}
                            </TableCell>
                            <TableCell>{product.brand || '-'}</TableCell>
                            <TableCell>{product.categories?.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatPrice(Number(product.price))}</span>
                                {product.old_price && product.old_price > product.price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(Number(product.old_price))}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={translationStatus.variant}>
                                {translationStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <SEOStatusBadge
                                seoTitle={product.seo_title_ml}
                                seoDescription={product.seo_description_ml}
                                currentLanguage={currentLanguage}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={product.is_active}
                                  onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                                />
                                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                  {product.is_active ? 'Faol' : 'Nofaol'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {product.in_stock ? (
                                  <Badge variant="default" className="w-fit">Mavjud</Badge>
                                ) : (
                                  <Badge variant="destructive" className="w-fit">Tugagan</Badge>
                                )}
                                {product.is_featured && (
                                  <Badge variant="secondary" className="w-fit">Featured</Badge>
                                )}
                                {product.is_bestseller && (
                                  <Badge variant="outline" className="w-fit">Bestseller</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={globalIndex === 0}
                                  className="h-8 w-8"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={globalIndex === filteredProducts.length - 1}
                                  className="h-8 w-8"
                                >
                                  ↓
                                </Button>
                                <Link to={`/admin/products/${product.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  "O'chirish"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
