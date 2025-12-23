import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Language } from '@/contexts/LanguageContext';
import { MultiLangValue } from '@/components/admin/MultiLangInput';

interface SingleLangInputProps {
  label: string;
  value: MultiLangValue;
  activeLanguage: Language;
  onChange: (value: MultiLangValue) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}

export function SingleLangInput({
  label,
  value,
  activeLanguage,
  onChange,
  type = 'input',
  placeholder,
  required,
  error,
  rows = 3,
}: SingleLangInputProps) {
  const handleChange = (text: string) => {
    onChange({
      ...value,
      [activeLanguage]: text,
    });
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      {type === 'input' ? (
        <Input
          value={value[activeLanguage] || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || ''}
        />
      ) : (
        <Textarea
          value={value[activeLanguage] || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || ''}
          rows={rows}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
