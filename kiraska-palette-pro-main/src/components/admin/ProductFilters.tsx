import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  X,
  CalendarIcon,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export type StatusFilter = 'all' | 'active' | 'inactive';
export type StockFilter = 'all' | 'in_stock' | 'out_of_stock' | 'low_stock';
export type ImageFilter = 'all' | 'has_image' | 'no_image';
export type TranslationFilter = 'all' | 'fully_translated' | 'partially_translated' | 'not_translated';
export type SeoFilter = 'all' | 'seo_complete' | 'seo_missing';
export type FeaturedFilter = 'all' | 'featured' | 'bestseller' | 'regular';
export type PriceFilter = 'all' | 'has_discount' | 'no_discount';
export type SortOption = 'position_asc' | 'position_desc' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_newest' | 'created_oldest' | 'stock_asc' | 'stock_desc';

export interface ProductFiltersState {
  search: string;
  status: StatusFilter;
  stock: StockFilter;
  category: string;
  brand: string;
  image: ImageFilter;
  translation: TranslationFilter;
  seo: SeoFilter;
  featured: FeaturedFilter;
  price: PriceFilter;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sort: SortOption;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  categories: Category[];
  brands: string[];
  activeLanguages: string[];
}

export const defaultProductFilters: ProductFiltersState = {
  search: '',
  status: 'all',
  stock: 'all',
  category: 'all',
  brand: 'all',
  image: 'all',
  translation: 'all',
  seo: 'all',
  featured: 'all',
  price: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  sort: 'position_asc',
};

export function ProductFilters({ filters, onFiltersChange, categories, brands, activeLanguages }: ProductFiltersProps) {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const updateFilter = <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange(defaultProductFilters);
  };

  const setQuickDate = (days: number) => {
    onFiltersChange({ 
      ...filters, 
      dateFrom: subDays(new Date(), days),
      dateTo: new Date()
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.stock !== 'all' ||
    filters.category !== 'all' ||
    filters.brand !== 'all' ||
    filters.image !== 'all' ||
    filters.translation !== 'all' ||
    filters.seo !== 'all' ||
    filters.featured !== 'all' ||
    filters.price !== 'all' ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.sort !== 'position_asc';

  const activeFilterChips: { label: string; key: keyof ProductFiltersState }[] = [];
  
  if (filters.search) activeFilterChips.push({ label: `Qidiruv: "${filters.search}"`, key: 'search' });
  if (filters.status !== 'all') activeFilterChips.push({ label: filters.status === 'active' ? 'Faol' : 'Nofaol', key: 'status' });
  if (filters.stock !== 'all') {
    const stockLabels: Record<string, string> = { in_stock: 'Mavjud', out_of_stock: 'Tugagan', low_stock: 'Kam qolgan' };
    activeFilterChips.push({ label: stockLabels[filters.stock], key: 'stock' });
  }
  if (filters.category !== 'all') {
    const cat = categories.find(c => c.id === filters.category);
    activeFilterChips.push({ label: `Kategoriya: ${cat?.name || filters.category}`, key: 'category' });
  }
  if (filters.brand !== 'all') activeFilterChips.push({ label: `Brend: ${filters.brand}`, key: 'brand' });
  if (filters.image !== 'all') activeFilterChips.push({ label: filters.image === 'has_image' ? 'Rasmli' : 'Rasmsiz', key: 'image' });
  if (filters.translation !== 'all') {
    const labels: Record<string, string> = { fully_translated: "To'liq tarjima", partially_translated: 'Qisman tarjima', not_translated: 'Tarjimasiz' };
    activeFilterChips.push({ label: labels[filters.translation], key: 'translation' });
  }
  if (filters.seo !== 'all') activeFilterChips.push({ label: filters.seo === 'seo_complete' ? "SEO to'liq" : "SEO yo'q", key: 'seo' });
  if (filters.featured !== 'all') {
    const labels: Record<string, string> = { featured: 'Featured', bestseller: 'Bestseller', regular: 'Oddiy' };
    activeFilterChips.push({ label: labels[filters.featured], key: 'featured' });
  }
  if (filters.price !== 'all') activeFilterChips.push({ label: filters.price === 'has_discount' ? 'Chegirmali' : 'Chegirmasiz', key: 'price' });
  if (filters.dateFrom) activeFilterChips.push({ label: `Dan: ${format(filters.dateFrom, 'dd.MM.yyyy')}`, key: 'dateFrom' });
  if (filters.dateTo) activeFilterChips.push({ label: `Gacha: ${format(filters.dateTo, 'dd.MM.yyyy')}`, key: 'dateTo' });

  const clearFilter = (key: keyof ProductFiltersState) => {
    if (key === 'search') updateFilter('search', '');
    else if (key === 'status') updateFilter('status', 'all');
    else if (key === 'stock') updateFilter('stock', 'all');
    else if (key === 'category') updateFilter('category', 'all');
    else if (key === 'brand') updateFilter('brand', 'all');
    else if (key === 'image') updateFilter('image', 'all');
    else if (key === 'translation') updateFilter('translation', 'all');
    else if (key === 'seo') updateFilter('seo', 'all');
    else if (key === 'featured') updateFilter('featured', 'all');
    else if (key === 'price') updateFilter('price', 'all');
    else if (key === 'dateFrom') updateFilter('dateFrom', undefined);
    else if (key === 'dateTo') updateFilter('dateTo', undefined);
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Search + Main Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => updateFilter('search', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v as StatusFilter)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Holati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Faol</SelectItem>
            <SelectItem value="inactive">Nofaol</SelectItem>
          </SelectContent>
        </Select>

        {/* Stock Filter */}
        <Select value={filters.stock} onValueChange={(v) => updateFilter('stock', v as StockFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Zaxira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="in_stock">Mavjud</SelectItem>
            <SelectItem value="out_of_stock">Tugagan</SelectItem>
            <SelectItem value="low_stock">Kam qolgan</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select value={filters.brand} onValueChange={(v) => updateFilter('brand', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Brend" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha brendlar</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Additional Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Image Filter */}
        <Select value={filters.image} onValueChange={(v) => updateFilter('image', v as ImageFilter)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Rasm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="has_image">Rasmli</SelectItem>
            <SelectItem value="no_image">Rasmsiz</SelectItem>
          </SelectContent>
        </Select>

        {/* Translation Filter */}
        <Select value={filters.translation} onValueChange={(v) => updateFilter('translation', v as TranslationFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tarjima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="fully_translated">To'liq tarjima</SelectItem>
            <SelectItem value="partially_translated">Qisman tarjima</SelectItem>
            <SelectItem value="not_translated">Tarjimasiz</SelectItem>
          </SelectContent>
        </Select>

        {/* SEO Filter */}
        <Select value={filters.seo} onValueChange={(v) => updateFilter('seo', v as SeoFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="SEO" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="seo_complete">SEO to'liq</SelectItem>
            <SelectItem value="seo_missing">SEO yo'q</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select value={filters.featured} onValueChange={(v) => updateFilter('featured', v as FeaturedFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="bestseller">Bestseller</SelectItem>
            <SelectItem value="regular">Oddiy</SelectItem>
          </SelectContent>
        </Select>

        {/* Price/Discount Filter */}
        <Select value={filters.price} onValueChange={(v) => updateFilter('price', v as PriceFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Chegirma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="has_discount">Chegirmali</SelectItem>
            <SelectItem value="no_discount">Chegirmasiz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 3: Date and Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date From */}
        <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "dd.MM.yyyy") : "Dan"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => {
                updateFilter('dateFrom', date);
                setIsDateFromOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "dd.MM.yyyy") : "Gacha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => {
                updateFilter('dateTo', date);
                setIsDateToOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Quick Date Options */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setQuickDate(7)}>
            7 kun
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setQuickDate(30)}>
            30 kun
          </Button>
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Saralash" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="position_asc">Pozitsiya (o'sish)</SelectItem>
            <SelectItem value="position_desc">Pozitsiya (kamayish)</SelectItem>
            <SelectItem value="name_asc">Nomi (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nomi (Z-A)</SelectItem>
            <SelectItem value="price_asc">Narx (arzon)</SelectItem>
            <SelectItem value="price_desc">Narx (qimmat)</SelectItem>
            <SelectItem value="stock_asc">Zaxira (kam)</SelectItem>
            <SelectItem value="stock_desc">Zaxira (ko'p)</SelectItem>
            <SelectItem value="created_newest">Yangi</SelectItem>
            <SelectItem value="created_oldest">Eski</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Tozalash
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 text-muted-foreground mt-1" />
          {activeFilterChips.map((chip, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => clearFilter(chip.key)}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
