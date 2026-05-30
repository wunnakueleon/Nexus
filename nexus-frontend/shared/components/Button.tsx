import React from 'react';
import Icon from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

const SIZES = {
  sm: 'text-[11px]/[1.45] px-2.5 py-1.5',
  md: 'text-xs px-3.5 py-2',
  lg: 'text-sm px-5 py-2.5',
};

const VARIANTS = {
  primary: 'bg-bg-tertiary border border-line-hover text-amber hover:border-amber',
  danger:  'bg-bg-tertiary border border-line-hover text-fg-secondary hover:text-critical hover:border-critical',
  ghost:   'bg-transparent border border-transparent text-fg-secondary hover:bg-bg-tertiary hover:text-fg',
  solid:   'bg-amber border border-amber text-bg hover:bg-amber/90',
  outline: 'bg-transparent border border-line text-fg-secondary hover:border-line-hover hover:text-fg',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', icon, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded font-semibold nx-uppercase transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed select-none';
  return (
    <button className={`${base} ${SIZES[size]} ${VARIANTS[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
};

export default Button;
