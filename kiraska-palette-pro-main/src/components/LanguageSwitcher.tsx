import { useLanguage, languages, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const shortLabels: Record<Language, string> = {
  uz: 'UZ',
  ky: 'KG',
  tj: 'TJ',
  ru: 'RU',
  zh: 'CN',
};

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  
  const currentLangData = languages.find(l => l.code === currentLanguage);
  const otherLanguages = languages.filter(l => l.code !== currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Globe className="h-4 w-4" />
          <span>{shortLabels[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[80px]">
        {otherLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="gap-2 cursor-pointer justify-center"
          >
            <span>{shortLabels[lang.code]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
