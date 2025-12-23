import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Globe, Eye, Search, Image as ImageIcon } from 'lucide-react';
import { SingleLangInput } from './SingleLangInput';
import { MultiLangValue } from './MultiLangInput';
import { Language } from '@/contexts/LanguageContext';

interface SEOFieldsCardProps {
  seoTitle: MultiLangValue;
  seoDescription: MultiLangValue;
  seoKeywords: MultiLangValue;
  seoImageUrl: string;
  canonicalUrl?: string;
  slug: string;
  activeLanguage: Language;
  onSeoTitleChange: (value: MultiLangValue) => void;
  onSeoDescriptionChange: (value: MultiLangValue) => void;
  onSeoKeywordsChange: (value: MultiLangValue) => void;
  onSeoImageUrlChange: (value: string) => void;
  onCanonicalUrlChange?: (value: string) => void;
  urlPrefix?: string;
  showCanonical?: boolean;
}

export function SEOFieldsCard({
  seoTitle,
  seoDescription,
  seoKeywords,
  seoImageUrl,
  canonicalUrl = '',
  slug,
  activeLanguage,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onSeoImageUrlChange,
  onCanonicalUrlChange,
  urlPrefix = '/product',
  showCanonical = false,
}: SEOFieldsCardProps) {
  const currentTitle = seoTitle[activeLanguage] || '';
  const currentDescription = seoDescription[activeLanguage] || '';
  
  // Calculate SEO status
  const getSeoStatus = () => {
    const hasTitle = !!currentTitle.trim();
    const hasDescription = !!currentDescription.trim();
    
    if (hasTitle && hasDescription) {
      return { label: "SEO to'liq", color: 'bg-green-500', variant: 'default' as const };
    }
    if (hasTitle || hasDescription) {
      return { label: 'Qisman', color: 'bg-yellow-500', variant: 'secondary' as const };
    }
    return { label: "SEO yo'q", color: 'bg-red-500', variant: 'destructive' as const };
  };

  const seoStatus = getSeoStatus();
  const titleLength = currentTitle.length;
  const descriptionLength = currentDescription.length;
  const previewUrl = `kiraska.uz${urlPrefix}/${slug}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO sozlamalari
          </CardTitle>
          <Badge variant={seoStatus.variant} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${seoStatus.color}`} />
            {seoStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEO Title */}
        <div className="space-y-2">
          <SingleLangInput
            label="SEO sarlavha"
            value={seoTitle}
            activeLanguage={activeLanguage}
            onChange={onSeoTitleChange}
            type="input"
            placeholder="Google qidiruv natijalarida ko'rinadigan sarlavha"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tavsiya: 50-60 belgi</span>
            <span className={titleLength > 60 ? 'text-destructive' : ''}>
              {titleLength}/60
            </span>
          </div>
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <SingleLangInput
            label="SEO tavsif"
            value={seoDescription}
            activeLanguage={activeLanguage}
            onChange={onSeoDescriptionChange}
            type="textarea"
            placeholder="Google qidiruv natijalarida ko'rinadigan tavsif"
            rows={3}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tavsiya: 150-160 belgi</span>
            <span className={descriptionLength > 160 ? 'text-destructive' : ''}>
              {descriptionLength}/160
            </span>
          </div>
        </div>

        {/* SEO Keywords */}
        <SingleLangInput
          label="SEO kalit so'zlar (ixtiyoriy)"
          value={seoKeywords}
          activeLanguage={activeLanguage}
          onChange={onSeoKeywordsChange}
          type="input"
          placeholder="kalit, so'z, vergul, bilan, ajratilgan"
        />

        {/* SEO Image */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Open Graph rasmi (ixtiyoriy)
          </Label>
          <Input
            value={seoImageUrl}
            onChange={(e) => onSeoImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Ijtimoiy tarmoqlarda ulashilganda ko'rinadigan rasm. Tavsiya: 1200x630 piksel
          </p>
          {seoImageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-xs">
              <img
                src={seoImageUrl}
                alt="SEO preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Canonical URL (optional) */}
        {showCanonical && onCanonicalUrlChange && (
          <div className="space-y-2">
            <Label>Canonical URL (ixtiyoriy)</Label>
            <Input
              value={canonicalUrl}
              onChange={(e) => onCanonicalUrlChange(e.target.value)}
              placeholder="https://kiraska.uz/product/slug"
            />
            <p className="text-xs text-muted-foreground">
              Agar bu sahifa boshqa sahifaning nusxasi bo'lsa, asosiy sahifa URL'ini kiriting
            </p>
          </div>
        )}

        {/* Google Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Google ko'rinishi
          </Label>
          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="h-3 w-3" />
              <span className="truncate">{previewUrl}</span>
            </div>
            <h3 className="text-lg text-blue-600 hover:underline cursor-pointer truncate font-medium">
              {currentTitle || 'SEO sarlavhani kiriting...'}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentDescription || 'SEO tavsifni kiriting...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
