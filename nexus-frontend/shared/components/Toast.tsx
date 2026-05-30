import React from 'react';
import { useApp } from '../hooks/useApp';

const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-bg-tertiary border border-line-hover rounded px-4 py-2.5 flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 bg-amber rounded-sm" />
      <span className="text-sm text-fg font-medium">{toast}</span>
    </div>
  );
};

export default Toast;
