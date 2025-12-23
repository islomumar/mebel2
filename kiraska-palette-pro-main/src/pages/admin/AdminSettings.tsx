import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Loader2, Link as LinkIcon, Save, Trash2, Facebook, Globe, MapPin, ExternalLink, Copy, Check, Send, Eye, EyeOff, Download, Database, Package, ShoppingCart, FolderTree, HardDrive, FileJson, ImageIcon as ImagesIcon, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';

interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
  facebook_pixel_id: string | null;
  facebook_domain_verification: string | null;
  sitemap_domain: string | null;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: null,
    favicon_url: null,
    facebook_pixel_id: null,
    facebook_domain_verification: null,
    sitemap_domain: null,
    telegram_bot_token: null,
    telegram_chat_id: null,
  });
  const [showBotToken, setShowBotToken] = useState(false);
  const [isTelegramTesting, setIsTelegramTesting] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState<string | null>(null);
  const [sitemapCopied, setSitemapCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [faviconInputMode, setFaviconInputMode] = useState<'upload' | 'url'>('upload');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();

  // Check if user is superadmin - only superadmin can see backup/export features
  const isSuperAdmin = userRole === 'superadmin';

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Sozlamalarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const settingsMap: SiteSettings = {
        logo_url: null,
        favicon_url: null,
        facebook_pixel_id: null,
        facebook_domain_verification: null,
        sitemap_domain: null,
        telegram_bot_token: null,
        telegram_chat_id: null,
      };
      data?.forEach((item) => {
        if (item.key === 'logo_url') settingsMap.logo_url = item.value;
        if (item.key === 'favicon_url') settingsMap.favicon_url = item.value;
        if (item.key === 'facebook_pixel_id') settingsMap.facebook_pixel_id = item.value;
        if (item.key === 'facebook_domain_verification') settingsMap.facebook_domain_verification = item.value;
        if (item.key === 'sitemap_domain') settingsMap.sitemap_domain = item.value;
        if (item.key === 'telegram_bot_token') settingsMap.telegram_bot_token = item.value;
        if (item.key === 'telegram_chat_id') settingsMap.telegram_chat_id = item.value;
      });
      setSettings(settingsMap);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'favicon'
  ) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Xatolik',
        description: 'Faqat rasm fayllarini yuklash mumkin',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Xatolik',
        description: 'Fayl hajmi 5MB dan oshmasligi kerak',
        variant: 'destructive',
      });
      return;
    }

    const setUploading = type === 'logo' ? setIsUploadingLogo : setIsUploadingFavicon;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update in database
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: publicUrl })
        .eq('key', key);

      if (updateError) throw updateError;

      setSettings((prev) => ({
        ...prev,
        [key]: publicUrl,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} yuklandi`,
      });

      // Update favicon in document if it's favicon
      if (type === 'favicon') {
        updateFavicon(publicUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Xatolik',
        description: 'Faylni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = async (url: string, type: 'logo' | 'favicon') => {
    setIsSaving(true);
    try {
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error } = await supabase
        .from('site_settings')
        .update({ value: url || null })
        .eq('key', key);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: url || null,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} saqlandi`,
      });

      if (type === 'favicon' && url) {
        updateFavicon(url);
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (type: 'logo' | 'favicon') => {
    setIsSaving(true);
    try {
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error } = await supabase
        .from('site_settings')
        .update({ value: null })
        .eq('key', key);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: null,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} o'chirildi`,
      });
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'O\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFacebookSave = async () => {
    setIsSaving(true);
    try {
      // Upsert facebook_pixel_id
      const { error: pixelError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'facebook_pixel_id', 
          value: settings.facebook_pixel_id 
        }, { onConflict: 'key' });

      if (pixelError) throw pixelError;

      // Upsert facebook_domain_verification
      const { error: domainError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'facebook_domain_verification', 
          value: settings.facebook_domain_verification 
        }, { onConflict: 'key' });

      if (domainError) throw domainError;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Facebook sozlamalari saqlandi',
      });
    } catch (error) {
      console.error('Facebook save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSitemapSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'sitemap_domain', 
          value: settings.sitemap_domain 
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Sitemap sozlamalari saqlandi',
      });
    } catch (error) {
      console.error('Sitemap save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTelegramSave = async () => {
    setIsSaving(true);
    try {
      // Upsert telegram_bot_token
      const { error: tokenError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'telegram_bot_token', 
          value: settings.telegram_bot_token 
        }, { onConflict: 'key' });

      if (tokenError) throw tokenError;

      // Upsert telegram_chat_id
      const { error: chatError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'telegram_chat_id', 
          value: settings.telegram_chat_id 
        }, { onConflict: 'key' });

      if (chatError) throw chatError;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Telegram sozlamalari saqlandi',
      });
    } catch (error) {
      console.error('Telegram save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTelegramTest = async () => {
    if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
      toast({
        title: 'Xatolik',
        description: 'Avval Bot Token va Chat ID kiriting',
        variant: 'destructive',
      });
      return;
    }

    setIsTelegramTesting(true);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegram_chat_id,
            text: '✅ *Test xabar*\n\nTelegram integratsiyasi muvaffaqiyatli sozlandi!',
            parse_mode: 'Markdown',
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: 'Test xabar Telegramga yuborildi',
        });
      } else {
        const error = await response.json();
        throw new Error(error.description || 'Xatolik');
      }
    } catch (error: any) {
      console.error('Telegram test error:', error);
      toast({
        title: 'Xatolik',
        description: error.message || 'Telegram ga ulanishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setIsTelegramTesting(false);
    }
  };

  const exportToExcel = async (tableName: 'products' | 'orders' | 'categories') => {
    setIsExporting(tableName);
    try {
      let data: any[] = [];
      let fileName = '';

      if (tableName === 'products') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        data = (products || []).map((p: any) => ({
          'Nomi': p.name,
          'Kategoriya': p.categories?.name || '',
          'Narxi': p.price,
          'Eski narxi': p.old_price || '',
          'Brend': p.brand || '',
          'Hajmi': p.volume || '',
          'O\'lchami': p.size || '',
          'Rangi': p.color_name || '',
          'Omborda': p.stock_quantity || 0,
          'Faol': p.is_active ? 'Ha' : 'Yo\'q',
          'Bestseller': p.is_bestseller ? 'Ha' : 'Yo\'q',
          'Yaratilgan': new Date(p.created_at).toLocaleDateString('uz-UZ'),
        }));
        fileName = `mahsulotlar_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else if (tableName === 'orders') {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        data = (orders || []).map((o: any) => ({
          'ID': o.id.slice(0, 8),
          'Mijoz': o.customer_name,
          'Telefon': o.phone,
          'Manzil': o.address || '',
          'Izoh': o.notes || '',
          'Mahsulotlar': Array.isArray(o.products) 
            ? o.products.map((p: any) => `${p.name} x${p.quantity}`).join(', ')
            : '',
          'Jami summa': o.total_amount,
          'Status': o.status === 'pending' ? 'Kutilmoqda' 
            : o.status === 'confirmed' ? 'Tasdiqlangan'
            : o.status === 'delivered' ? 'Yetkazildi'
            : o.status === 'cancelled' ? 'Bekor qilindi'
            : o.status,
          'Sana': new Date(o.created_at).toLocaleDateString('uz-UZ'),
        }));
        fileName = `buyurtmalar_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else if (tableName === 'categories') {
        const { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;

        data = (categories || []).map((c: any) => ({
          'Nomi': c.name,
          'Slug': c.slug,
          'Tavsifi': c.description || '',
          'Pozitsiya': c.position || 0,
          'Faol': c.is_active ? 'Ha' : 'Yo\'q',
          'Yaratilgan': new Date(c.created_at).toLocaleDateString('uz-UZ'),
        }));
        fileName = `kategoriyalar_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      if (data.length === 0) {
        toast({
          title: 'Ma\'lumot yo\'q',
          description: 'Export qilish uchun ma\'lumot topilmadi',
          variant: 'destructive',
        });
        return;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, tableName);
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Muvaffaqiyat',
        description: `${data.length} ta yozuv export qilindi`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni export qilishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const sitemapUrl = `https://pfcqwwbhzyuabttjzcqi.supabase.co/functions/v1/sitemap`;

  const copySitemapUrl = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setSitemapCopied(true);
    setTimeout(() => setSitemapCopied(false), 2000);
    toast({
      title: 'Nusxalandi',
      description: 'Sitemap URL nusxalandi',
    });
  };

  // Full database backup function
  const downloadFullBackup = async (type: 'database' | 'images' | 'all') => {
    setIsBackingUp(type);
    try {
      const backup: any = {
        exportedAt: new Date().toISOString(),
        projectId: 'pfcqwwbhzyuabttjzcqi',
        type: type,
      };

      if (type === 'database' || type === 'all') {
        // Fetch all tables data
        const [productsRes, categoriesRes, ordersRes, siteContentRes, siteSettingsRes, languagesRes, stockHistoryRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('position', { ascending: true }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('site_content').select('*'),
          supabase.from('site_settings').select('*'),
          supabase.from('languages').select('*').order('position', { ascending: true }),
          supabase.from('stock_history').select('*').order('timestamp', { ascending: false }).limit(1000),
        ]);

        backup.tables = {
          products: {
            count: productsRes.data?.length || 0,
            data: productsRes.data || [],
          },
          categories: {
            count: categoriesRes.data?.length || 0,
            data: categoriesRes.data || [],
          },
          orders: {
            count: ordersRes.data?.length || 0,
            data: ordersRes.data || [],
          },
          site_content: {
            count: siteContentRes.data?.length || 0,
            data: siteContentRes.data || [],
          },
          site_settings: {
            count: siteSettingsRes.data?.length || 0,
            data: siteSettingsRes.data || [],
          },
          languages: {
            count: languagesRes.data?.length || 0,
            data: languagesRes.data || [],
          },
          stock_history: {
            count: stockHistoryRes.data?.length || 0,
            data: stockHistoryRes.data || [],
          },
        };
      }

      if (type === 'images' || type === 'all') {
        // Fetch storage bucket files list
        const { data: files, error: storageError } = await supabase.storage
          .from('product-images')
          .list('', { limit: 1000 });

        if (!storageError && files) {
          const imageUrls = files.map((file) => ({
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            url: supabase.storage.from('product-images').getPublicUrl(file.name).data.publicUrl,
          }));

          // Also check for subdirectories
          const { data: siteFiles } = await supabase.storage
            .from('product-images')
            .list('site', { limit: 100 });

          if (siteFiles) {
            siteFiles.forEach((file) => {
              imageUrls.push({
                name: `site/${file.name}`,
                size: file.metadata?.size || 0,
                created_at: file.created_at,
                url: supabase.storage.from('product-images').getPublicUrl(`site/${file.name}`).data.publicUrl,
              });
            });
          }

          backup.storage = {
            bucket: 'product-images',
            count: imageUrls.length,
            files: imageUrls,
          };
        }
      }

      // Download as JSON file
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${type}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'all' ? 'To\'liq backup' : type === 'database' ? 'Database' : 'Rasmlar ro\'yxati'} yuklandi`,
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Xatolik',
        description: 'Backup yaratishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(null);
    }
  };

  const updateFavicon = (url: string) => {
    // Update or create favicon link element
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sozlamalar</h1>
          <p className="text-muted-foreground">
            Sayt logo, favicon va integratsiya sozlamalari
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Sayt logosini yuklang yoki URL kiriting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={logoInputMode} onValueChange={(v) => setLogoInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Yuklash
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Rasm tanlash
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={settings.logo_url || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button
                      type="button"
                      onClick={() => handleUrlSave(settings.logo_url || '', 'logo')}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Logo Preview */}
              {settings.logo_url ? (
                <div className="space-y-2">
                  <Label>Ko'rinishi:</Label>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-12 max-w-[200px] object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemove('logo')}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">Logo yuklanmagan</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favicon Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
              <CardDescription>
                Brauzer tabidagi kichik rasm (32x32 yoki 64x64 piksel tavsiya etiladi)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={faviconInputMode} onValueChange={(v) => setFaviconInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Yuklash
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                  >
                    {isUploadingFavicon ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Rasm tanlash
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={settings.favicon_url || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, favicon_url: e.target.value }))}
                      placeholder="https://example.com/favicon.ico"
                    />
                    <Button
                      type="button"
                      onClick={() => handleUrlSave(settings.favicon_url || '', 'favicon')}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Favicon Preview */}
              {settings.favicon_url ? (
                <div className="space-y-2">
                  <Label>Ko'rinishi:</Label>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={settings.favicon_url}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                      <span className="text-sm text-muted-foreground">32x32 ko'rinishi</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemove('favicon')}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">Favicon yuklanmagan</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Facebook Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              Facebook sozlamalari
            </CardTitle>
            <CardDescription>
              Facebook Pixel va Domain Verification sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Facebook Pixel ID */}
              <div className="space-y-2">
                <Label htmlFor="facebook_pixel_id" className="flex items-center gap-2">
                  Facebook Pixel ID
                </Label>
                <Input
                  id="facebook_pixel_id"
                  value={settings.facebook_pixel_id || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, facebook_pixel_id: e.target.value }))}
                  placeholder="Masalan: 902186118024639"
                />
                <p className="text-xs text-muted-foreground">
                  Facebook Events Manager dan Pixel ID ni oling
                </p>
              </div>

              {/* Domain Verification */}
              <div className="space-y-2">
                <Label htmlFor="facebook_domain_verification" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain Verification kodi
                </Label>
                <Input
                  id="facebook_domain_verification"
                  value={settings.facebook_domain_verification || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, facebook_domain_verification: e.target.value }))}
                  placeholder="Masalan: cbsnjzgkil9w1igb8dsuigz3lf033"
                />
                <p className="text-xs text-muted-foreground">
                  Facebook Business Settings → Brand Safety → Domains dan oling
                </p>
              </div>
            </div>

            <Button
              onClick={handleFacebookSave}
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Facebook sozlamalarini saqlash
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Telegram Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#0088cc]" />
              Telegram sozlamalari
            </CardTitle>
            <CardDescription>
              Yangi buyurtmalar haqida Telegram orqali xabar olish
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bot Token */}
              <div className="space-y-2">
                <Label htmlFor="telegram_bot_token" className="flex items-center gap-2">
                  Bot Token
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="telegram_bot_token"
                      type={showBotToken ? 'text' : 'password'}
                      value={settings.telegram_bot_token || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, telegram_bot_token: e.target.value }))}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowBotToken(!showBotToken)}
                    >
                      {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  @BotFather dan olingan bot token
                </p>
              </div>

              {/* Chat ID */}
              <div className="space-y-2">
                <Label htmlFor="telegram_chat_id" className="flex items-center gap-2">
                  Chat ID
                </Label>
                <Input
                  id="telegram_chat_id"
                  value={settings.telegram_chat_id || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, telegram_chat_id: e.target.value }))}
                  placeholder="-1001234567890"
                />
                <p className="text-xs text-muted-foreground">
                  Guruh yoki kanal ID raqami
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleTelegramSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Saqlash
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTelegramTest}
                disabled={isTelegramTesting || !settings.telegram_bot_token || !settings.telegram_chat_id}
              >
                {isTelegramTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Test xabar yuborish
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <h4 className="font-medium text-sm">Telegram bot yaratish qo'llanmasi:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Telegram da @BotFather ni oching</li>
                <li>/newbot buyrug'ini yuboring va bot nomini kiriting</li>
                <li>Olingan tokenni yuqoridagi maydonga kiriting</li>
                <li>Botni guruhga qo'shing va @getidsbot orqali Chat ID ni oling</li>
                <li>"Test xabar yuborish" tugmasi bilan tekshiring</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Sitemap sozlamalari
            </CardTitle>
            <CardDescription>
              Google Search Console uchun sitemap domain sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Domain Input */}
              <div className="space-y-2">
                <Label htmlFor="sitemap_domain">
                  Sayt domeni
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="sitemap_domain"
                    value={settings.sitemap_domain || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, sitemap_domain: e.target.value }))}
                    placeholder="https://kiraska.uz"
                  />
                  <Button
                    onClick={handleSitemapSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Domenni https:// bilan kiriting (masalan: https://kiraska.uz)
                </p>
              </div>

              {/* Sitemap URL */}
              <div className="space-y-2">
                <Label>Sitemap URL</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <code className="flex-1 text-sm break-all">{sitemapUrl}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copySitemapUrl}
                  >
                    {sitemapCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bu URL ni Google Search Console ga qo'shing
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <h4 className="font-medium text-sm">Google Search Console uchun qo'llanma:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Google Search Console ga kiring</li>
                  <li>"Индексирование" → "Файлы Sitemap" bo'limiga o'ting</li>
                  <li>Yuqoridagi Sitemap URL ni nusxalab qo'ying</li>
                  <li>"ОТПРАВИТЬ" tugmasini bosing</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Backup Section - SUPERADMIN ONLY */}
        {isSuperAdmin && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                To'liq Backup (VSCode uchun)
              </CardTitle>
              <CardDescription>
                Database, rasmlar va barcha ma'lumotlarni JSON formatda yuklab olish - VSCode da ishlatish uchun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Full Database Backup */}
                <Button
                  variant="default"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => downloadFullBackup('database')}
                  disabled={isBackingUp !== null}
                >
                  {isBackingUp === 'database' ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <FileJson className="h-8 w-8" />
                  )}
                  <span className="font-medium">Database Backup</span>
                  <span className="text-xs opacity-80">Barcha jadvallar (JSON)</span>
                </Button>

                {/* Images List */}
                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 border-primary/30"
                  onClick={() => downloadFullBackup('images')}
                  disabled={isBackingUp !== null}
                >
                  {isBackingUp === 'images' ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <ImagesIcon className="h-8 w-8 text-green-600" />
                  )}
                  <span className="font-medium">Rasmlar Ro'yxati</span>
                  <span className="text-xs text-muted-foreground">URL lari bilan</span>
                </Button>

                {/* Full Backup (All) */}
                <Button
                  variant="default"
                  className="h-auto py-6 flex-col gap-2 bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => downloadFullBackup('all')}
                  disabled={isBackingUp !== null}
                >
                  {isBackingUp === 'all' ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Download className="h-8 w-8" />
                  )}
                  <span className="font-medium">TO'LIQ BACKUP</span>
                  <span className="text-xs opacity-80">Database + Rasmlar</span>
                </Button>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Backup tarkibi:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>products</strong> - barcha mahsulotlar (to'liq ma'lumot)</li>
                  <li><strong>categories</strong> - kategoriyalar</li>
                  <li><strong>orders</strong> - buyurtmalar</li>
                  <li><strong>site_content</strong> - sayt kontenti (tarjimalar)</li>
                  <li><strong>site_settings</strong> - sozlamalar</li>
                  <li><strong>languages</strong> - tillar</li>
                  <li><strong>stock_history</strong> - ombor tarixi</li>
                  <li><strong>storage files</strong> - rasmlar URL lari</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                JSON faylni VSCode da ochib, ma'lumotlarni boshqa loyihaga import qilishingiz mumkin.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Data Export - SUPERADMIN ONLY */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Ma'lumotlarni export qilish (Excel)
              </CardTitle>
              <CardDescription>
                Mahsulotlar, buyurtmalar va kategoriyalarni Excel formatda yuklab olish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Products Export */}
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => exportToExcel('products')}
                  disabled={isExporting !== null}
                >
                  {isExporting === 'products' ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Package className="h-6 w-6 text-primary" />
                  )}
                  <span className="font-medium">Mahsulotlar</span>
                  <span className="text-xs text-muted-foreground">Excel formatda</span>
                </Button>

                {/* Orders Export */}
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => exportToExcel('orders')}
                  disabled={isExporting !== null}
                >
                  {isExporting === 'orders' ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  )}
                  <span className="font-medium">Buyurtmalar</span>
                  <span className="text-xs text-muted-foreground">Excel formatda</span>
                </Button>

                {/* Categories Export */}
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => exportToExcel('categories')}
                  disabled={isExporting !== null}
                >
                  {isExporting === 'categories' ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <FolderTree className="h-6 w-6 text-orange-600" />
                  )}
                  <span className="font-medium">Kategoriyalar</span>
                  <span className="text-xs text-muted-foreground">Excel formatda</span>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Barcha ma'lumotlar .xlsx formatda yuklab olinadi va Microsoft Excel, Google Sheets yoki boshqa dasturlarda ochish mumkin.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
