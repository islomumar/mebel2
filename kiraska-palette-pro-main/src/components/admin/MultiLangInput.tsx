import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { languages, Language } from '@/contexts/LanguageContext';
import { Json } from '@/integrations/supabase/types';
import { useTranslations } from '@/hooks/useTranslations';

export interface MultiLangValue {
  uz?: string;
  ky?: string;
  tj?: string;
  ru?: string;
  zh?: string;
  [key: string]: string | undefined;
}

interface MultiLangInputProps {
  label: string;
  value: MultiLangValue;
  onChange: (value: MultiLangValue) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}

export function MultiLangInput({
  label,
  value,
  onChange,
  type = 'input',
  placeholder,
  required,
  error,
  rows = 3,
}: MultiLangInputProps) {
  const { t } = useTranslations();
  
  const handleChange = (lang: Language, text: string) => {
    onChange({
      ...value,
      [lang]: text,
    });
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <Tabs defaultValue="uz" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-8">
          {languages.map((lang) => (
            <TabsTrigger
              key={lang.code}
              value={lang.code}
              className="text-xs px-1 data-[state=active]:text-xs"
            >
              {lang.flag}
            </TabsTrigger>
          ))}
        </TabsList>
        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code} className="mt-2">
            {type === 'input' ? (
              <Input
                value={value[lang.code] || ''}
                onChange={(e) => handleChange(lang.code, e.target.value)}
                placeholder={placeholder || ''}
              />
            ) : (
              <Textarea
                value={value[lang.code] || ''}
                onChange={(e) => handleChange(lang.code, e.target.value)}
                placeholder={placeholder || ''}
                rows={rows}
              />
            )}
            {lang.code !== 'uz' && !value[lang.code] && value.uz && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('hint.fallbackText')}
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// Helper to convert Json to MultiLangValue
export function jsonToMultiLang(value: Json | null | undefined): MultiLangValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const result: MultiLangValue = {};
  for (const key of Object.keys(value)) {
    const v = (value as Record<string, Json>)[key];
    if (typeof v === 'string') {
      result[key] = v;
    }
  }
  return result;
}

// Helper function to get text in current language with fallback to 'uz'
export function getLocalizedText(value: MultiLangValue | Json | null | undefined, lang: Language): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return '';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return (obj[lang] as string) || (obj['uz'] as string) || '';
  }
  return '';
}
