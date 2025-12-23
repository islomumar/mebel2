import { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  children?: ReactNode;
  className?: string;
}

export function EditableText({ 
  contentKey, 
  fallback = '', 
  children, 
  className,
}: EditableTextProps) {
  const { isEditMode, setEditingKey } = useEditMode();
  const { getText } = useSiteContent();

  const text = getText(contentKey, fallback);
  const displayContent = children || text;

  if (!isEditMode) {
    return <>{displayContent}</>;
  }

  return (
    <span className={cn('group/editable relative inline', className)}>
      {displayContent}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditingKey(contentKey);
        }}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded bg-primary/90 text-primary-foreground opacity-70 group-hover/editable:opacity-100 transition-opacity hover:bg-primary cursor-pointer align-middle"
        title={`Edit: ${contentKey}`}
      >
        <Pencil className="h-3 w-3" />
      </button>
    </span>
  );
}

// Hook for getting editable text or plain text based on mode
export function useEditableText() {
  const { isEditMode } = useEditMode();
  const { getText } = useSiteContent();
  
  return {
    isEditMode,
    getText,
  };
}
