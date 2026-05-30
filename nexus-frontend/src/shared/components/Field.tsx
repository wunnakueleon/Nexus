import React from 'react';
import Icon from './Icon';

export const fieldCls = 'w-full bg-bg-input border border-line rounded text-fg text-sm px-3 py-2 placeholder:text-fg-muted focus:border-amber transition-colors';

interface FieldProps {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, children }) => (
  <label className="block">
    {label && <div className="text-xs font-medium text-fg-secondary nx-uppercase mb-1.5">{label}</div>}
    {children}
    {hint && <div className="text-[11px]/[1.45] text-fg-muted mt-1 font-mono">{hint}</div>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input {...props} className={`${fieldCls} ${className}`} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea {...props} className={`${fieldCls} resize-none ${className}`} />
);

type SelectOption = string | { value: string; label: string };

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, ...rest }) => (
  <div className="relative">
    <select value={value} onChange={onChange} {...rest} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o} className="bg-bg-secondary">{o}</option>
          : <option key={o.value} value={o.value} className="bg-bg-secondary">{o.label}</option>
      )}
    </select>
    <Icon name="down" size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-secondary pointer-events-none" />
  </div>
);
