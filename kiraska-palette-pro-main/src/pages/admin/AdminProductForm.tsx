import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { MultiLangValue, jsonToMultiLang } from '@/components/admin/MultiLangInput';
import { GlobalLangTabs } from '@/components/admin/GlobalLangTabs';
import { SingleLangInput } from '@/components/admin/SingleLangInput';
import { SEOFieldsCard } from '@/components/admin/SEOFieldsCard';
import { Language } from '@/contexts/LanguageContext';
import { Json } from '@/integrations/supabase/types';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name_ml: MultiLangValue;
  slug: string;
  price: number;
  old_price: number | null;
  brand: string | null;
  volume: string | null;
  color_name: string | null;
  in_stock: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  image_url: string | null;
  short_description_ml: MultiLangValue;
  full_description_ml: MultiLangValue;
  category_id: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  size: string | null;
  colors: string[] | null;
  // SEO fields
  seo_title_ml: MultiLangValue;
  seo_description_ml: MultiLangValue;
  seo_keywords_ml: MultiLangValue;
  seo_image_url: string | null;
  canonical_url: string | null;
}

const volumeOptions = ['1L', '3L', '5L', '10L', '15L', '20L'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [formLanguage, setFormLanguage] = useState<Language>('uz');

  const [formData, setFormData] = useState<ProductFormData>({
    name_ml: {},
    slug: '',
    price: 0,
    old_price: null,
    brand: '',
    volume: '',
    color_name: '',
    in_stock: true,
    is_featured: false,
    is_bestseller: false,
    is_active: true,
    image_url: '',
    short_description_ml: {},
    full_description_ml: {},
    category_id: null,
    stock_quantity: 0,
    low_stock_threshold: 5,
    size: '',
    colors: [],
    seo_title_ml: {},
    seo_description_ml: {},
    seo_keywords_ml: {},
    seo_image_url: null,
    canonical_url: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          toast({
            title: t('common.error'),
            description: t('admin.products.notFound'),
            variant: 'destructive',
          });
          navigate('/admin/products');
        } else {
          setFormData({
            name_ml: jsonToMultiLang(data.name_ml) || { uz: data.name },
            slug: data.slug,
            price: Number(data.price),
            old_price: data.old_price ? Number(data.old_price) : null,
            brand: data.brand || '',
            volume: data.volume || '',
            color_name: data.color_name || '',
            in_stock: data.in_stock ?? true,
            is_featured: data.is_featured ?? false,
            is_bestseller: data.is_bestseller ?? false,
            is_active: data.is_active ?? true,
            image_url: data.image_url || '',
            short_description_ml: jsonToMultiLang(data.short_description_ml) || { uz: data.short_description || '' },
            full_description_ml: jsonToMultiLang(data.full_description_ml) || { uz: data.full_description || '' },
            category_id: data.category_id,
            stock_quantity: data.stock_quantity ?? 0,
            low_stock_threshold: data.low_stock_threshold ?? 5,
            size: data.size || '',
            colors: Array.isArray(data.colors) ? data.colors as string[] : [],
            seo_title_ml: jsonToMultiLang(data.seo_title_ml) || {},
            seo_description_ml: jsonToMultiLang(data.seo_description_ml) || {},
            seo_keywords_ml: jsonToMultiLang(data.seo_keywords_ml) || {},
            seo_image_url: data.seo_image_url || null,
            canonical_url: data.canonical_url || null,
          });
        }
        setIsLoading(false);
      };

      fetchProduct();
    }
  }, [id, isEditing, navigate, toast]);

  const handleNameChange = (value: MultiLangValue) => {
    setFormData((prev) => ({
      ...prev,
      name_ml: value,
    }));
  };

  const handleStockQuantityChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      stock_quantity: value,
      in_stock: value > 0,
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('common.error'),
        description: t('image.typeError'),
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('image.sizeError'),
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: t('common.success'),
        description: t('image.uploadSuccess'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('common.error'),
        description: t('image.uploadError'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name_ml.uz) {
      setErrors({ name: t('hint.nameRequired') });
      return;
    }
    if (!formData.slug) {
      setErrors({ slug: t('hint.slugRequired') });
      return;
    }
    if (formData.price < 0) {
      setErrors({ price: t('hint.priceRequired') });
      return;
    }

    setIsSaving(true);

    const productData = {
      name: formData.name_ml.uz || '',
      name_ml: formData.name_ml as Json,
      slug: formData.slug,
      price: formData.price,
      old_price: formData.old_price,
      brand: formData.brand || null,
      volume: formData.volume || null,
      color_name: formData.color_name || null,
      in_stock: formData.in_stock,
      is_featured: formData.is_featured,
      is_bestseller: formData.is_bestseller,
      is_active: formData.is_active,
      image_url: formData.image_url || null,
      short_description: formData.short_description_ml.uz || null,
      short_description_ml: formData.short_description_ml as Json,
      full_description: formData.full_description_ml.uz || null,
      full_description_ml: formData.full_description_ml as Json,
      category_id: formData.category_id,
      stock_quantity: formData.stock_quantity,
      low_stock_threshold: formData.low_stock_threshold,
      size: formData.size || null,
      colors: formData.colors || [],
      seo_title_ml: formData.seo_title_ml as Json,
      seo_description_ml: formData.seo_description_ml as Json,
      seo_keywords_ml: formData.seo_keywords_ml as Json,
      seo_image_url: formData.seo_image_url || null,
      canonical_url: formData.canonical_url || null,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id));
    } else {
      ({ error } = await supabase.from('products').insert([productData]));
    }

    if (error) {
      toast({
        title: t('common.error'),
        description: t('admin.products.saveError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: isEditing ? t('admin.products.updated') : t('admin.products.created'),
      });
      navigate('/admin/products');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? t('admin.products.edit') : t('admin.products.new')}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? t('admin.products.edit') : t('admin.products.new')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Language Selector */}
          <GlobalLangTabs activeLanguage={formLanguage} onLanguageChange={setFormLanguage} />
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('section.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SingleLangInput
                  label={t('form.name')}
                  value={formData.name_ml}
                  activeLanguage={formLanguage}
                  onChange={handleNameChange}
                  type="input"
                  placeholder={t('placeholder.enterName')}
                  required
                  error={errors.name}
                />

                <div className="space-y-2">
                  <Label htmlFor="slug">{t('form.slug')} *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('form.category')}</Label>
                  <Select
                    value={formData.category_id || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: value === 'none' ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.notSelected')}</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">{t('form.brand')}</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>{t('section.pricing')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('form.price')} *</Label>
                  <FormattedNumberInput
                    id="price"
                    value={formData.price}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, price: value }))
                    }
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="old_price">{t('form.oldPrice')}</Label>
                  <FormattedNumberInput
                    id="old_price"
                    value={formData.old_price || 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        old_price: value > 0 ? value : null,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">{t('form.volume')}</Label>
                  <Select
                    value={formData.volume || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        volume: value === 'none' ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.notSelected')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.notSelected')}</SelectItem>
                      {volumeOptions.map((vol) => (
                        <SelectItem key={vol} value={vol}>
                          {vol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color_name">{t('form.colorName')}</Label>
                  <Input
                    id="color_name"
                    value={formData.color_name || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color_name: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Management */}
            <Card>
              <CardHeader>
                <CardTitle>{t('section.stockManagement')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">{t('form.stockQuantity')} *</Label>
                  <FormattedNumberInput
                    id="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={(value) => handleStockQuantityChange(value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">{t('form.lowStockThreshold')}</Label>
                  <FormattedNumberInput
                    id="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, low_stock_threshold: value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('hint.lowStockWarning')}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="in_stock">{t('form.inStock')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.in_stock ? t('hint.inStockActive') : t('hint.inStockInactive')}
                    </p>
                  </div>
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, in_stock: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="is_featured">{t('form.featured')}</Label>
                    <p className="text-xs text-muted-foreground">{t('hint.featuredHint')}</p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_featured: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="is_bestseller">{t('form.bestseller')}</Label>
                    <p className="text-xs text-muted-foreground">{t('hint.bestsellerHint')}</p>
                  </div>
                  <Switch
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_bestseller: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="is_active">{t('form.activeStatus')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_active ? t('hint.activeOnSite') : t('hint.inactiveOnSite')}
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>{t('section.image')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageInputMode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('common.upload')}
                  </Button>
                  <Button
                    type="button"
                    variant={imageInputMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('url')}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {t('common.url')}
                  </Button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.uploading')}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {t('common.selectImage')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="image_url">{t('form.imageUrl')}</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder={t('placeholder.enterUrl')}
                    />
                  </div>
                )}

                {formData.image_url ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t('common.noImage')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('section.description')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <SingleLangInput
                  label={t('form.shortDescription')}
                  value={formData.short_description_ml}
                  activeLanguage={formLanguage}
                  onChange={(value) => setFormData((prev) => ({ ...prev, short_description_ml: value }))}
                  type="textarea"
                  placeholder={t('placeholder.enterDescription')}
                  rows={3}
                />

                <SingleLangInput
                  label={t('form.fullDescription')}
                  value={formData.full_description_ml}
                  activeLanguage={formLanguage}
                  onChange={(value) => setFormData((prev) => ({ ...prev, full_description_ml: value }))}
                  type="textarea"
                  placeholder={t('placeholder.enterDescription')}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <div className="md:col-span-2">
              <SEOFieldsCard
                seoTitle={formData.seo_title_ml}
                seoDescription={formData.seo_description_ml}
                seoKeywords={formData.seo_keywords_ml}
                seoImageUrl={formData.seo_image_url || ''}
                canonicalUrl={formData.canonical_url || ''}
                slug={formData.slug}
                activeLanguage={formLanguage}
                onSeoTitleChange={(value) => setFormData((prev) => ({ ...prev, seo_title_ml: value }))}
                onSeoDescriptionChange={(value) => setFormData((prev) => ({ ...prev, seo_description_ml: value }))}
                onSeoKeywordsChange={(value) => setFormData((prev) => ({ ...prev, seo_keywords_ml: value }))}
                onSeoImageUrlChange={(value) => setFormData((prev) => ({ ...prev, seo_image_url: value || null }))}
                onCanonicalUrlChange={(value) => setFormData((prev) => ({ ...prev, canonical_url: value || null }))}
                urlPrefix="/product"
                showCanonical={true}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
