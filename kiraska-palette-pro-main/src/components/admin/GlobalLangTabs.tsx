import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { languages, Language } from '@/contexts/LanguageContext';

interface GlobalLangTabsProps {
  activeLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const shortLabels: Record<Language, string> = {
  uz: 'UZ',
  ky: 'KG',
  tj: 'TJ',
  ru: 'RU',
  zh: 'CN',
};

export function GlobalLangTabs({ activeLanguage, onLanguageChange }: GlobalLangTabsProps) {
  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
      <Tabs value={activeLanguage} onValueChange={(v) => onLanguageChange(v as Language)}>
        <TabsList className="grid w-full grid-cols-5 h-10">
          {languages.map((lang) => (
            <TabsTrigger
              key={lang.code}
              value={lang.code}
              className="flex items-center gap-1.5 text-sm font-medium px-2"
            >
              <span>{shortLabels[lang.code]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
