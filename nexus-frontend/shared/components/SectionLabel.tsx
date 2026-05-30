import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ children, className = '' }) => (
  <div className={`text-[12px]/[1.45] font-semibold text-fg-secondary nx-uppercase flex items-center gap-2 mb-3 ${className}`}>
    <span className="w-1.5 h-1.5 bg-amber rounded-sm" />
    {children}
  </div>
);

export default SectionLabel;
