import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Languages, Loader2, GripVertical, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LanguageItem {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  is_active: boolean;
  is_default: boolean;
  position: number;
}

interface LanguageFormData {
  code: string;
  name: string;
  flag: string;
  is_active: boolean;
  is_default: boolean;
  position: number;
}

export default function AdminLanguages() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<LanguageFormData>({
    code: '',
    name: '',
    flag: '',
    is_active: true,
    is_default: false,
    position: 0,
  });

  const fetchLanguages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('position');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Tillarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setLanguages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const openCreateDialog = () => {
    setEditingLanguage(null);
    setFormData({
      code: '',
      name: '',
      flag: '',
      is_active: true,
      is_default: false,
      position: languages.length + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (language: LanguageItem) => {
    setEditingLanguage(language);
    setFormData({
      code: language.code,
      name: language.name,
      flag: language.flag || '',
      is_active: language.is_active,
      is_default: language.is_default,
      position: language.position,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (languageId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('languages')
      .update({ is_active: isActive })
      .eq('id', languageId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Holatni o\'zgartirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: isActive ? 'Til faollashtirildi' : 'Til o\'chirildi',
      });
      fetchLanguages();
    }
  };

  const handleSetDefault = async (languageId: string) => {
    // First, unset all defaults
    await supabase
      .from('languages')
      .update({ is_default: false })
      .neq('id', languageId);

    // Set the new default
    const { error } = await supabase
      .from('languages')
      .update({ is_default: true, is_active: true })
      .eq('id', languageId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Standart tilni o\'zgartirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Standart til o\'zgartirildi',
      });
      fetchLanguages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast({
        title: 'Xatolik',
        description: 'Til kodi va nomi majburiy',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const languageData = {
      code: formData.code.toLowerCase(),
      name: formData.name,
      flag: formData.flag || null,
      is_active: formData.is_active,
      is_default: formData.is_default,
      position: formData.position,
    };

    let error;
    if (editingLanguage) {
      ({ error } = await supabase
        .from('languages')
        .update(languageData)
        .eq('id', editingLanguage.id));
    } else {
      ({ error } = await supabase.from('languages').insert([languageData]));
    }

    if (error) {
      toast({
        title: 'Xatolik',
        description: error.message.includes('duplicate') 
          ? 'Bu til kodi allaqachon mavjud' 
          : 'Tilni saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: editingLanguage ? 'Til yangilandi' : 'Til qo\'shildi',
      });
      setIsDialogOpen(false);
      fetchLanguages();
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const languageToDelete = languages.find(l => l.id === deleteId);
    if (languageToDelete?.is_default) {
      toast({
        title: 'Xatolik',
        description: 'Standart tilni o\'chirib bo\'lmaydi',
        variant: 'destructive',
      });
      setDeleteId(null);
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Tilni o\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Til o\'chirildi',
      });
      fetchLanguages();
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newLanguages = [...languages];
    [newLanguages[index - 1], newLanguages[index]] = [newLanguages[index], newLanguages[index - 1]];
    
    // Update positions in database
    for (let i = 0; i < newLanguages.length; i++) {
      await supabase
        .from('languages')
        .update({ position: i + 1 })
        .eq('id', newLanguages[i].id);
    }
    fetchLanguages();
  };

  const handleMoveDown = async (index: number) => {
    if (index === languages.length - 1) return;
    const newLanguages = [...languages];
    [newLanguages[index], newLanguages[index + 1]] = [newLanguages[index + 1], newLanguages[index]];
    
    // Update positions in database
    for (let i = 0; i < newLanguages.length; i++) {
      await supabase
        .from('languages')
        .update({ position: i + 1 })
        .eq('id', newLanguages[i].id);
    }
    fetchLanguages();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tillar</h1>
            <p className="text-muted-foreground">
              Sayt tillarini boshqarish
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi til
          </Button>
        </div>

        {/* Languages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tillar ro'yxati ({languages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : languages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Languages className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Tillar topilmadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Bayroq</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Standart</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {languages.map((language, index) => (
                      <TableRow key={language.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <span>{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-2xl">
                          {language.flag || '🌐'}
                        </TableCell>
                        <TableCell className="font-mono uppercase">
                          {language.code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {language.name}
                        </TableCell>
                        <TableCell>
                          {language.is_default ? (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Standart
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(language.id)}
                            >
                              Standart qilish
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={language.is_active}
                              onCheckedChange={(checked) => handleToggleActive(language.id, checked)}
                              disabled={language.is_default}
                            />
                            <Badge variant={language.is_active ? 'default' : 'secondary'}>
                              {language.is_active ? 'Faol' : 'Nofaol'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === languages.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(language)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(language.id)}
                              disabled={language.is_default}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLanguage ? 'Tilni tahrirlash' : 'Yangi til qo\'shish'}
              </DialogTitle>
              <DialogDescription>
                Til ma'lumotlarini kiriting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Til kodi *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="uz, ru, en..."
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Til kodi 2-5 belgi bo'lishi kerak
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Til nomi *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="O'zbekcha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag">Bayroq (emoji)</Label>
                <Input
                  id="flag"
                  value={formData.flag}
                  onChange={(e) => setFormData((prev) => ({ ...prev, flag: e.target.value }))}
                  placeholder="🇺🇿"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is-active">Faol</Label>
                <Switch
                  id="is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    'Saqlash'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tilni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu tilni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
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
