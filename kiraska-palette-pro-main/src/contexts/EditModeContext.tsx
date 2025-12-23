import { createContext, useContext, useState, ReactNode } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
  editingKey: string | null;
  setEditingKey: (key: string | null) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  return (
    <EditModeContext.Provider value={{ isEditMode, setEditMode, editingKey, setEditingKey }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    return { isEditMode: false, setEditMode: () => {}, editingKey: null, setEditingKey: () => {} };
  }
  return context;
}
