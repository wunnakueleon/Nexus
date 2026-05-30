import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../shared/components/Icon';

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Custom dropdown (not a native <select>) so the popup stays compact on mobile
// instead of opening the browser's full-screen option list.
const FilterSelect: React.FC<FilterSelectProps> = ({ options, value, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-bg-input border border-line rounded text-fg text-sm px-3 py-2 hover:border-line-hover focus:border-amber transition-colors"
      >
        <span className="truncate">{current?.label}</span>
        <Icon name="down" size={14} className={`text-fg-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-bg-secondary border border-line-hover rounded shadow-lg max-h-56 overflow-auto py-1">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left text-sm px-3 py-1.5 truncate transition-colors ${
                o.value === value ? 'text-amber bg-amber-dim' : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
