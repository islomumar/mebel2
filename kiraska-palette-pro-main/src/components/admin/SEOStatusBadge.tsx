import { Badge } from '@/components/ui/badge';
import { MultiLangValue } from './MultiLangInput';

interface SEOStatusBadgeProps {
  seoTitle: MultiLangValue;
  seoDescription: MultiLangValue;
  currentLanguage: string;
}

export function SEOStatusBadge({ seoTitle, seoDescription, currentLanguage }: SEOStatusBadgeProps) {
  const hasTitle = seoTitle[currentLanguage] && seoTitle[currentLanguage].trim() !== '';
  const hasDescription = seoDescription[currentLanguage] && seoDescription[currentLanguage].trim() !== '';

  if (hasTitle && hasDescription) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        SEO ✓
      </Badge>
    );
  }
  
  if (hasTitle || hasDescription) {
    return (
      <Badge variant="secondary" className="bg-yellow-500 text-yellow-950 hover:bg-yellow-600">
        SEO ~
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive">
      SEO ✗
    </Badge>
  );
}
