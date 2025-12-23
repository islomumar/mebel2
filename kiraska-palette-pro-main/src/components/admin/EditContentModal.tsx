import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { languages, Language } from '@/contexts/LanguageContext';

interface LanguageValues {
  [key: string]: string;
}

export function EditContentModal() {
  const { editingKey, setEditingKey } = useEditMode();
  const { refetch, currentLanguage } = useSiteContent();
  const [values, setValues] = useState<LanguageValues>({});
  const [activeTab, setActiveTab] = useState<Language>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingKey) {
      setActiveTab(currentLanguage);
      loadAllLanguageValues();
    }
  }, [editingKey]);

  const loadAllLanguageValues = async () => {
    if (!editingKey) return;
    
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('site_content')
      .select('lang, value')
      .eq('key', editingKey);

    if (error) {
      console.error('Error loading content:', error);
    } else {
      const loadedValues: LanguageValues = {};
      data?.forEach((item) => {
        loadedValues[item.lang] = item.value;
      });
      setValues(loadedValues);
    }
    
    setIsLoading(false);
  };

  const handleValueChange = (lang: Language, value: string) => {
    setValues((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleSave = async () => {
    if (!editingKey) return;

    setIsSaving(true);

    try {
      // Save each language value
      for (const lang of languages) {
        const value = values[lang.code] || '';
        
        // Skip empty values for non-default languages
        if (!value && lang.code !== 'uz') continue;

        // Check if key+lang exists
        const { data: existing } = await supabase
          .from('site_content')
          .select('id')
          .eq('key', editingKey)
          .eq('lang', lang.code)
          .maybeSingle();

        let error;
        if (existing) {
          ({ error } = await supabase
            .from('site_content')
            .update({ value })
            .eq('key', editingKey)
            .eq('lang', lang.code));
        } else if (value) {
          ({ error } = await supabase
            .from('site_content')
            .insert([{ 
              key: editingKey, 
              value, 
              lang: lang.code,
              description: `Auto-created key: ${editingKey} (${lang.code})` 
            }]));
        }

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Muvaffaqiyat',
        description: 'Barcha tillar uchun kontent saqlandi',
      });
      refetch();
      setEditingKey(null);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  };

  return (
    <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kontentni tahrirlash</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {editingKey}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Language)}>
            <TabsList className="grid w-full grid-cols-5">
              {languages.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code} className="text-xs">
                  {lang.flag}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {languages.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Label>
                  <Textarea
                    value={values[lang.code] || ''}
                    onChange={(e) => handleValueChange(lang.code, e.target.value)}
                    rows={4}
                    placeholder={`${lang.name} tilida matn kiriting...`}
                  />
                  {lang.code !== 'uz' && !values[lang.code] && values['uz'] && (
                    <p className="text-xs text-muted-foreground">
                      Bo'sh qoldirilsa, O'zbekcha matn ko'rsatiladi
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingKey(null)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
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
      </DialogContent>
    </Dialog>
  );
}
