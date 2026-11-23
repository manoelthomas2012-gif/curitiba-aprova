import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg bg-[#17365D] px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-blue-600">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
};
