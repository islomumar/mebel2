import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { languages, Language } from '@/contexts/LanguageContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentField {
  key: string;
  label: string;
  description?: string;
}

interface ContentSection {
  title: string;
  fields: ContentField[];
}

interface SiteContentEditorProps {
  sections: ContentSection[];
}

interface ContentValues {
  [key: string]: {
    [lang: string]: string;
  };
}

export function SiteContentEditor({ sections }: SiteContentEditorProps) {
  const { refetch } = useSiteContent();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Language>('uz');
  const [values, setValues] = useState<ContentValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const allKeys = useMemo(() => {
    return sections.flatMap(section => section.fields.map(field => field.key));
  }, [sections]);

  useEffect(() => {
    loadAllContent();
  }, [allKeys]);

  const loadAllContent = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('site_content')
      .select('key, lang, value')
      .in('key', allKeys);

    if (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Xatolik',
        description: 'Kontentni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const loadedValues: ContentValues = {};
      
      // Initialize all keys
      allKeys.forEach(key => {
        loadedValues[key] = {};
        languages.forEach(lang => {
          loadedValues[key][lang.code] = '';
        });
      });
      
      // Fill with data from database
      data?.forEach(item => {
        if (!loadedValues[item.key]) {
          loadedValues[item.key] = {};
        }
        loadedValues[item.key][item.lang] = item.value;
      });
      
      setValues(loadedValues);
    }
    
    setIsLoading(false);
  };

  const handleValueChange = (key: string, lang: Language, value: string) => {
    setValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      for (const key of allKeys) {
        for (const lang of languages) {
          const value = values[key]?.[lang.code] || '';
          
          // Skip empty values for non-default languages
          if (!value && lang.code !== 'uz') continue;

          // Check if key+lang exists
          const { data: existing } = await supabase
            .from('site_content')
            .select('id')
            .eq('key', key)
            .eq('lang', lang.code)
            .maybeSingle();

          let error;
          if (existing) {
            ({ error } = await supabase
              .from('site_content')
              .update({ value })
              .eq('key', key)
              .eq('lang', lang.code));
          } else if (value) {
            ({ error } = await supabase
              .from('site_content')
              .insert([{ 
                key, 
                value, 
                lang: lang.code,
                description: `Content key: ${key}` 
              }]));
          }

          if (error) {
            throw error;
          }
        }
      }

      toast({
        title: 'Muvaffaqiyat',
        description: 'Barcha kontentlar saqlandi',
      });
      refetch();
      setHasChanges(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Language)}>
        <div className="flex items-center justify-between">
          <TabsList>
            {languages.map((lang) => (
              <TabsTrigger key={lang.code} value={lang.code} className="gap-2">
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllContent}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yangilash
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </div>

        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code} className="mt-6">
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {field.label}
                          {field.description && (
                            <span className="ml-2 text-xs text-muted-foreground font-normal">
                              ({field.description})
                            </span>
                          )}
                        </Label>
                        <Textarea
                          value={values[field.key]?.[lang.code] || ''}
                          onChange={(e) => handleValueChange(field.key, lang.code, e.target.value)}
                          placeholder={values[field.key]?.['uz'] || `${field.label} kiriting...`}
                          rows={2}
                          className="resize-none"
                        />
                        {lang.code !== 'uz' && !values[field.key]?.[lang.code] && values[field.key]?.['uz'] && (
                          <p className="text-xs text-muted-foreground">
                            Bo'sh qoldirilsa, O'zbekcha matn ko'rsatiladi: "{values[field.key]['uz']}"
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
