import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Users, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'superadmin' | 'admin' | 'manager';

interface AdminUser {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  manager: 'Menejer',
};

const roleColors: Record<AppRole, string> = {
  superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  manager: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser, userRole } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as AppRole,
  });

  const isSuperAdmin = userRole === 'superadmin';

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Build query based on role - non-superadmin cannot see superadmin users
    let query = supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (isSuperAdmin) {
      // SuperAdmin can see all roles
      query = query.in('role', ['superadmin', 'admin', 'manager']);
    } else {
      // Non-superadmin cannot see superadmin users
      query = query.in('role', ['admin', 'manager']);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Foydalanuvchilarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      // Filter out superadmin from list for non-superadmin users
      const filteredUsers = isSuperAdmin 
        ? (data as AdminUser[]) || []
        : ((data as AdminUser[]) || []).filter(u => u.role !== 'superadmin');
      setUsers(filteredUsers);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: 'admin',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      toast({
        title: 'Ruxsat yo\'q',
        description: 'Faqat Super Admin foydalanuvchilarni boshqarishi mumkin',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        // Update existing user role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: 'Muvaffaqiyat',
          description: 'Foydalanuvchi yangilandi',
        });
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin/login`,
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Add role to user_roles table
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: formData.role,
            });

          if (roleError) throw roleError;
        }

        toast({
          title: 'Muvaffaqiyat',
          description: 'Yangi admin qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      fetchUsers();
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

  const handleDelete = async () => {
    if (!deleteUserId || !isSuperAdmin) return;

    setIsDeleting(true);
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', deleteUserId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Foydalanuvchini o\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Foydalanuvchi o\'chirildi',
      });
      fetchUsers();
    }
    
    setIsDeleting(false);
    setDeleteUserId(null);
  };

  const filteredUsers = users.filter((user) =>
    user.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roleLabels[user.role].toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Ruxsat yo'q</h2>
          <p className="mt-2 text-muted-foreground">
            Faqat Super Admin foydalanuvchilarni boshqarishi mumkin
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Foydalanuvchilar</h1>
            <p className="text-muted-foreground">Admin foydalanuvchilarni boshqaring</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi admin
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Foydalanuvchi qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admin foydalanuvchilar</CardTitle>
            <CardDescription>
              Jami {filteredUsers.length} ta admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">Foydalanuvchilar topilmadi</p>
                <p className="text-sm text-muted-foreground">
                  Yangi admin qo'shing
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Qo'shilgan sana</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">
                          {user.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(user)}
                              disabled={user.user_id === currentUser?.id}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteUserId(user.id)}
                              disabled={user.user_id === currentUser?.id}
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Adminni tahrirlash' : 'Yangi admin qo\'shish'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Admin rolini o\'zgartiring' : 'Yangi admin account yarating'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Parol *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: AppRole) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Only superadmin can see/assign superadmin role */}
                      {isSuperAdmin && (
                        <SelectItem value="superadmin">Super Admin - To'liq huquq</SelectItem>
                      )}
                      <SelectItem value="admin">Admin - Buyurtmalar, mahsulotlar, ombor</SelectItem>
                      <SelectItem value="manager">Menejer - Faqat buyurtmalar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingUser ? 'Saqlash' : 'Qo\'shish'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adminni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu adminni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
