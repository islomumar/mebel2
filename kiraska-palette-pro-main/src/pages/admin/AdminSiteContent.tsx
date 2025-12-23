import { AdminLayout } from '@/components/admin/AdminLayout';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { SitePreview } from '@/components/admin/SitePreview';
import { EditContentModal } from '@/components/admin/EditContentModal';
import { useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

function SiteContentInner() {
  const { setEditMode } = useEditMode();

  useEffect(() => {
    setEditMode(true);
    return () => setEditMode(false);
  }, [setEditMode]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sayt kontenti</h1>
            <p className="text-muted-foreground">
              Saytdagi barcha matnlarni vizual tahrirlash
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Eye className="h-4 w-4" />
            Tahrirlash rejimi yoqilgan
          </Badge>
        </div>

        {/* Site Preview */}
        <div className="rounded-xl border border-border overflow-hidden bg-background shadow-lg">
          <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">kiraska.uz - Preview Mode</span>
          </div>
          <SitePreview />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          💡 Matn ustiga kursorni olib boring va tahrirlash tugmasini bosing
        </p>
      </div>

      {/* Edit Modal */}
      <EditContentModal />
    </AdminLayout>
  );
}

export default function AdminSiteContent() {
  return (
    <EditModeProvider>
      <SiteContentInner />
    </EditModeProvider>
  );
}
